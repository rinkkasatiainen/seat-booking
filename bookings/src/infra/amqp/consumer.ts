// eslint-disable-next-line max-classes-per-file
import amqp, {Channel, Connection, Message} from 'amqplib/callback_api'
import {AMQP_ENV} from '../../env-vars'
import {ListenesMessages, ListenerCallback} from '../../server'
import {isDomainEvent} from '../../domain/event'
import {CanTrackMessages, TracksMessages} from '../../cross-cutting/tracks-requests'
import {AmqpEvents, TrackedAmqpEvent} from '../amqp-events'
import {OutputTracker} from '../../cross-cutting/output-tracker'
import {createAmqpUrl} from './url'

import {assertQueue, bindQueue, createChannel} from './queue-handling'

export interface ActsAsConsumer {
    connect: (url: string, callback: (errorConnect: Error, connection: Connection) => void) => void;
}


type ConnectedAmqpConsumer = ListenesMessages

type AmqpWrapper = ActsAsConsumer

export interface CanStartAmqpConsumer {
    start: (url: string, _amqp: AmqpWrapper) => Promise<ConnectedAmqpConsumer>;
}

export interface ConnectionLike {
    close: () => void;
}

interface ChannelLike {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    close: (err: any) => void;
    consume: (name: string, cb: (msg: Message | null) => void) => void;
}

export class AmqpConsumer implements ListenesMessages, CanTrackMessages<AmqpEvents> {
    private tracksMessages: TracksMessages<TrackedAmqpEvent>
    private static EVENT_NAME = 'AMQP_CONSUMER_EVENT'
    constructor(
        private readonly queueName: string,
        private readonly connection: ConnectionLike,
        private readonly channel: ChannelLike) {
        this.tracksMessages = new TracksMessages()
    }

    public onMessage(fn: ListenerCallback): void {
        this.channel.consume(this.queueName, (msg: Message | null) => {
            if (msg) {
                const parsed: unknown = JSON.parse(msg.content.toString())
                this.tracksMessages.eventHappened(AmqpConsumer.EVENT_NAME,{type: 'listen', args: [{msg: parsed}]} )
                if (isDomainEvent(parsed)) {
                    fn(parsed)
                }
            }
        })
    }

    public trackRequests(): OutputTracker<TrackedAmqpEvent> {
        return OutputTracker.create<TrackedAmqpEvent>(this.tracksMessages, AmqpConsumer.EVENT_NAME)
    }

    public close(): void {
        this.channel.close((err: Error) => {
            // eslint-disable-next-line no-console
            console.error('could not close channel', err)
        })
        this.connection.close()
    }

    public static async of(envVars: AMQP_ENV, queueName: string): Promise<ListenesMessages> {
        const canStartAmqp: CanStartAmqpConsumer = {
            start: async (url: string, _amqp: AmqpWrapper): Promise<ListenesMessages> => {
                const closable = await new Promise<{ channel: Channel; conn: Connection }>((res, reject) => {
                    _amqp.connect(url, (errConn, conn) => {
                        if (errConn) {
                            reject(errConn)
                        }

                        createChannel(conn).then((channel: Channel) => {
                            assertQueue(channel, queueName, {autoDelete: false}).then(amqpQueue => {
                                bindQueue(channel, amqpQueue, 'amq.topic').then(() => {
                                    res({channel, conn})
                                }).catch((err: Error) => reject(err))
                            }).catch((err: Error) => reject(err))
                        }).catch((err: Error) => reject(err))
                    })
                })

                return new AmqpConsumer(queueName, closable.conn, closable.channel)
            },
        }
        const _url = createAmqpUrl(envVars)

        return await canStartAmqp.start(_url, amqp)
    }

    public static createNull(args?: Partial<{
        qName: string;
        conn: ConnectionLike;
        channel: ChannelLike;
    }>): Promise<AmqpConsumer> {
        const {qName, conn, channel} = {
            qName: 'testQ-irrelevant', conn: new StubbedConnection(), channel: new StubbedChannel(),
            ...args,
        }
        return Promise.resolve(
            new AmqpConsumer(qName, conn, channel)
        )
    }
}

type ConsumesEvent = (msg: (Message | null)) => void;

export class StubbedChannel implements ChannelLike {
    private readonly listeners: Record<string, ConsumesEvent[]>

    constructor() {
        this.listeners = {}
    }

    public close(): void {
        for( const k of Object.keys( this.listeners )){
            delete this.listeners[k]
        }
    }

    public consume(name: string, cb: ConsumesEvent): void {
        const listener = this.listeners[name] || []
        listener.push(cb)
        this.listeners[name] = listener
    }

    public simulate(queueName: string, event: Message): void {
        const listeners = this.listeners[queueName] || []
        for (const listener of listeners) {
            listener(event)
        }
    }
}

export class StubbedConnection implements ConnectionLike {
    public close(): void {
        /* noop*/
    }
}

