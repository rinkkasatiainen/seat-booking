// eslint-disable-next-line max-classes-per-file
import amqp, {Channel, Connection, credentials} from 'amqplib/callback_api'
import {Options} from 'amqplib/properties'
import {SendsMessages} from '../../../server'
import {OutputTracker} from '../../../cross-cutting/output-tracker'
import {broadcastEvent, errorEvent, generalEvent, TrackedAmqpEvent} from '../amqp-events'
import {DomainEvent} from '../../../domain/event'
import {TracksMessages} from '../../../cross-cutting/tracks-requests'
import {AMQP_ENV} from '../../../env-vars'
import {TrackedMessage} from '../../../domain/tracked-message'
import {ConnectionLike, StubbedConnection} from './consumer'
import {createAmqpUrl, ExchangeName, parseExchangeName, XcTopic} from './url'
import {createChannel} from './queue-handling'

export interface ActsAsProducer {
    connect: (url: string, opts: unknown, callback: (errorConnect: Error, connection: Connection) => void) => void;
}

type AmqpWrapper = ActsAsProducer

export interface CanStartAmqpProducer {
    start: (url: string, _amqp: AmqpWrapper) => Promise<AmqpProducer>;
}

export interface BroadcastChannel {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publish: (exchangeName: string, routingKey: string, content: Buffer, options?: Options.Publish) => boolean;
    close: (cb: (err: Error) => void) => void;

}


type NullArgs = Partial<{ channel: BroadcastChannel; connection: ConnectionLike }>;

class SendsToChannel implements SendsMessages {
    constructor(private readonly channel: BroadcastChannel, private readonly topic: XcTopic) {
    }

    public send(msg: TrackedMessage<DomainEvent>): void {
        this.channel.publish(this.topic.exchangeName, this.topic.routingKey, Buffer.from(JSON.stringify(msg)))
    }

    public close(): void {
        this.channel.close(err => {
            console.error('Error', err) // eslint-disable-line no-console
        })
    }
}

export class AmqpProducer {
    private tracksMessages: TracksMessages<TrackedAmqpEvent>
    private readonly _event = 'BROADCAST'

    private constructor(
        private readonly connection: ConnectionLike,
        private readonly channel: BroadcastChannel,
        private readonly topic: XcTopic) {
        this.tracksMessages = new TracksMessages()
    }

    public close(): void {
        this.channel.close(err => {
            this.tracksMessages.eventHappened('ERROR', errorEvent([err]))
        })
        this.connection.close()
    }

    public to(topic: XcTopic): SendsMessages {
        return new SendsToChannel(this.channel, topic)
    }

    public send(msg: TrackedMessage<DomainEvent>): void {
        this.tracksMessages.eventHappened('broadcast', broadcastEvent([msg]))
        this.channel.publish(this.topic.exchangeName, this.topic.routingKey, Buffer.from(JSON.stringify(msg)))

    }

    public trackRequests(): OutputTracker<TrackedAmqpEvent> {
        return OutputTracker.create(this.tracksMessages, this._event)
    }

    public static of(envvars: AMQP_ENV, exchangeName: ExchangeName): Promise<AmqpProducer> {
        const topic: XcTopic = parseExchangeName(exchangeName)
        const canStartAmqp: CanStartAmqpProducer = {
            start: async (url, _amqp: AmqpWrapper): Promise<AmqpProducer> => {
                const opt = {credentials: credentials.plain(envvars.AMQP_USERNAME, envvars.AMQP_PASSWORD)}
                const closeable = await new Promise<{ channel: Channel; conn: Connection }>((res, rej) => {

                    _amqp.connect(url, opt, (errConn, conn) => {
                        if (errConn) {
                            rej(errConn)
                        }
                        createChannel(conn).then((channel: Channel) => {
                            res({channel, conn})
                        }).catch(err => rej(err))
                    })
                })

                return new AmqpProducer(closeable.conn, closeable.channel, topic)
            },
        }

        const _url = createAmqpUrl(envvars)
        return canStartAmqp.start(_url, amqp)
    }

    public static createNull(args: NullArgs): AmqpProducer {
        const defaultArgs = {connection: new StubbedConnection(), channel: new StubbedBroadcast()}
        const {channel, connection} = {...defaultArgs, ...args}
        return new AmqpProducer(connection, channel, new XcTopic('health-check', 'responses'))
    }
}

export class StubbedBroadcast implements BroadcastChannel {
    private readonly listeners: Record<string, TracksMessages<TrackedAmqpEvent>>

    constructor() {
        this.listeners = {}
    }

    public close(): void {
        for (const [key, tracksMessages] of Object.entries(this.listeners)) {
            tracksMessages.eventHappened('closed', generalEvent(['closed']))
            delete this.listeners[key]
        }
    }

    public publish(exchangeName: string, routingKey: string, content: Buffer): boolean {
        const broadcast = this.listeners[exchangeName]
        if (broadcast === undefined) {
            return false
        }
        broadcast.eventHappened(routingKey, broadcastEvent([content]))
        return true
    }

    public trackRequests(exchangeName = 'events', routingKey = 'closed'): OutputTracker<TrackedAmqpEvent> {
        const tracksMessages = new TracksMessages<TrackedAmqpEvent>()
        this.listeners[exchangeName] = tracksMessages

        return OutputTracker.create(tracksMessages, routingKey)
    }
}
