import {DomainEvent, isHealthCheck} from '../domain/event'
import {ExpressApp} from '../delivery/express-app'
import {LogsData} from '../logger'
import {healthCheckRoute} from '../delivery/routes/health-check'
import {TrackedMessage} from '../domain/tracked-message'


export interface ActsAsServer {
    start: (port: number) => Promise<ActsAsServer>;

    close(): void;
}

export interface SendsMessages {
    send: (msg: TrackedMessage<DomainEvent>) => void;
    close: () => void;
}

export type ListenerCallback = (x: TrackedMessage<DomainEvent>) => void;

export interface ListenesMessages {
    onMessage: (fn: ListenerCallback) => void;
    close: () => void;
}

export class Server implements ActsAsServer {

    private constructor(
        private readonly logger: LogsData,
        private readonly listener: ListenesMessages,
        private readonly producer: SendsMessages,
        private readonly routeApp: ExpressApp
    ) {
    }

    public async start(port: number): Promise<Server> {
        await this.routeApp.listen(port, () => {
            this.logger.info(`Listening on port ${port}`)
        })
        this.listener.onMessage((event) => {
            const domainEvent = event.data
            if (isHealthCheck(domainEvent)) {
                const newEvent = {...domainEvent, bookings: {status: 'ok', amqp: {status: 'connected'}}}
                this.producer.send({uuid: event.uuid, data: newEvent})
            }
        })
        this.routeApp.routeFor('/', healthCheckRoute())
        return this
    }

    public close(): void {
        this.routeApp.close()
    }

    public static of(
        logger: LogsData,
        listener: ListenesMessages,
        producer: SendsMessages,
        routeApp: ExpressApp): {
        start: (port: number) => Promise<ActsAsServer>;
    } {
        return {
            start: async (port) => await new Server(logger, listener, producer, routeApp).start(port),
        }
    }
}
