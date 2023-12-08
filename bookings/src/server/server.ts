import {DomainEvent} from '../domain/event'
import {ExpressApp} from '../delivery/express-app'
import {LogsData} from '../logger'
import {healthCheckRoute} from '../delivery/routes/health-check'


export interface ActsAsServer {
    start: (port: number) => Promise<ActsAsServer>;

    close(): void;
}

export interface SendsMessages {
    send: (msg: DomainEvent) => void;
    close: () => void;
}

export type ListenerCallback = (x: DomainEvent) => void;

export interface ListenesMessages {
    onMessage: (fn: ListenerCallback) => void;
    close: () => void;
}

export class Server implements ActsAsServer {

    private constructor(
        private readonly logger: LogsData,
        private readonly routeApp: ExpressApp
    ) {
    }

    public async start(port: number): Promise<Server> {
        await this.routeApp.listen(port, () => {
            this.logger.info(`Listening on port ${port}`)
        })
        this.routeApp.routeFor('/', healthCheckRoute() )
        return this
    }

    public close(): void {
        this.routeApp.close()
    }

    public static of(
        logger: LogsData,
        /* producer: SendsMessages, listener: ListenesMessages,*/
        routeApp: ExpressApp): {
        start: (port: number) => Promise<ActsAsServer>;
    } {
        return {
            start: async (port) => await new Server(logger, /* producer, listener,*/ routeApp).start(port),
        }
    }
}
