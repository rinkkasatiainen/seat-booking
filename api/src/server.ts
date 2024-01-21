// eslint-disable-next-line max-classes-per-file
import * as http from 'http'
import bodyParser from 'body-parser'
import {Router} from 'express'
import {ActsAsPool} from './infra/postgres-db'
import {Logger} from './logger'
import {healthCheckRoute} from './delivery/routes/health-check'
import {DomainEvent} from './domain/event'
import {ActsAsWebSocketServer} from './infra/websocket/ws-server'
import {RouteApp} from './delivery/express-app'
import {TrackedMessage} from './domain/tracked-message'

export interface ServerLike {
    start: (port: number) => Promise<ServerLike>;
    close: () => Promise<void>;
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

export type Broadcast = (data: DomainEvent) => number;

export class Server implements ServerLike {
    private httpServer?: http.Server

    constructor(
        private readonly logger: Logger,
        private readonly createPool: ActsAsPool,
        private readonly wsServer: ActsAsWebSocketServer,
        private readonly producer: SendsMessages,
        private readonly listener: ListenesMessages,
        private readonly app: RouteApp
    ) {
        this.config()
    }

    public start = async (port: number,): Promise<ServerLike> => {
        this.httpServer = this.app.listen(port, () => {
            this.logger.log(`Running on port ${port}`)
        })
        this.httpServer.on('upgrade', (request, socket, head) => {
            this.wsServer.handleUpgrade(request, socket, head)
        })

        await this.dbConnect(this.createPool)

        const broadcast: Broadcast = data => this.wsServer.broadcast(data)
        this.app.use('/', healthCheckRoute<Router>(Router())(broadcast, this.producer, this.listener))

        return this
    }

    public close = async (): Promise<void> => {
        await this.createPool.disconnect().catch((err: Error) => {
            this.logger.error(err)
        }).then(() => {
            this.logger.log('disconnected from pool')
        })
        this.producer.close()
        this.httpServer?.close((err) => {
            if (err) {
                this.logger.error(err)
            }
            this.logger.log('closed')
        })
        return await new Promise((res, rej) => {
            this.wsServer.close((err?: Error) => {
                if (err) {
                    rej(err)
                }
                res()
            })
        })
    }

    private config() {
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(bodyParser.json({limit: '1mb'})) // 100kb default
    }

    private async dbConnect(pool: ActsAsPool): Promise<void> {
        await pool.connect()
            .then(async (client) => {
                await client.query('SELECT NOW()').then(rows => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const _rows: Array<{now: string}> = rows.rows as Array<{now: string}>
                    const result: { now: string } | undefined = _rows[0]
                    if (result){
                        this.logger.log(`Starting DB connection @: ${result.now}`)
                    } else {
                        this.logger.error( new Error('Could not connect to DB'))
                    }
                })
                client.release()
            }).catch((err: Error) => {
                this.logger.error(err)
                throw err
            })
    }
}

export type HttpServerAlias = Pick<http.Server, 'on'|'close'>

export default Server
