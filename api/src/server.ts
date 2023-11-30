// eslint-disable-next-line max-classes-per-file
import * as http from 'http'
import express, {Express} from 'express'
import bodyParser from 'body-parser'
import {ActsAsPool, DisconnectFromPool} from './infra/postgres-db'
import {Logger} from './logger'
import healthCheck from './delivery/routes/health-check'
import {DomainEvent} from './domain/event'
import {ActsAsWebSocketServer} from './infra/websocket/ws-server'

export interface ServerLike {
    start: (port: number) => Promise<ServerLike>;
    close: () => Promise<void>;
}

export interface SendsMessages {
    send: (msg: DomainEvent) => void;
    close: () => void;
}

export interface RabbitMQConsumer<T> {
    listen: (cb: (msg: DomainEvent) => T) => void;
    close: () => void;
}

export type Broadcast = (data: DomainEvent) => number;

export class Server implements ServerLike {
    private app: RouteApp
    private httpServer?: http.Server
    private disconnectPool?: DisconnectFromPool
    private broadcast: Broadcast
    private producer?: SendsMessages

    constructor(
        private readonly logger: Logger,
        private readonly createPool: ActsAsPool,
        private readonly wsServer: ActsAsWebSocketServer,
        private readonly producerProvider: () => Promise<SendsMessages>,
        providesExpress: () => RouteApp
    ) {
        this.app = providesExpress()
        this.config()

        this.broadcast = data => this.wsServer.broadcast(data)
    }

    public start = async (port: number,): Promise<ServerLike> => {
        this.httpServer = this.app.listen(port, () => {
            this.logger.log(`Running on port ${port}`)
        })
        this.httpServer.on('upgrade', (request, socket, head) => {
            this.wsServer.handleUpgrade(request, socket, head)
        })

        this.disconnectPool = await this.dbConnect(this.createPool)
        this.producer = await this.producerProvider()
        this.app.use('/', healthCheck(this.broadcast, this.producer))

        return this
    }

    public close = async (): Promise<void> => {
        await this.disconnectPool?.call(this).catch((err: Error) => {
            this.logger.error(err)
        }).then(() => {
            this.logger.log('disconnected from pool')
        })
        this.producer?.close()
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

    private async dbConnect(pool: ActsAsPool): Promise<DisconnectFromPool> {
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
        return pool.disconnect.bind(pool)
    }
}

export type RouteApp = Pick<Express, 'use'|'listen'>
export type HttpServerAlias = Pick<http.Server, 'on'|'close'>

export class ExpressApp {

    public static of(): RouteApp {
        return express()
    }

    public static createNull(): RouteApp{
        return {
            // @ts-ignore For testing
            use: () => ExpressApp.createNull(),
            // @ts-ignore For testing
            listen: () => {
                const fakeServer: HttpServerAlias = {
                    // @ts-ignore For testing
                    close: () => fakeServer,
                    // @ts-ignore For testing
                    on: () => fakeServer,
                }
                return fakeServer
            },
        }
    }
}

export default Server
