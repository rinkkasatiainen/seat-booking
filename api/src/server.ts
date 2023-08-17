import * as http from 'http'
import express, {Express} from 'express'
import bodyParser from 'body-parser'
import {CreatePool} from './infra/postgres-db'
import {Logger} from './logger'

import healthCheck from './delivery/routes/health-check'

export interface ServerLike {
    start: (port: number) => Promise<ServerLike>;
    close: () => Promise<void>;
}

export class Server implements ServerLike {
    private app: Express
    private httpServer?: http.Server
    private disconnectPool?: () => Promise<void>

    constructor(private readonly logger: Logger, private readonly createPool: CreatePool) {
        this.app = express()
        this.config()
        this.routes()
    }

    public start = async (port: number): Promise<Server> => {
        this.disconnectPool = await this.dbConnect(this.createPool)
        this.httpServer = this.app.listen(port, () => {
            this.logger.log(`Running on port ${port}`)
        })

        return this
    }

    public close = async (): Promise<void> => {
        this.logger.log('closing')
        await this.disconnectPool?.call(this).catch((err: Error) => {
            this.logger.error(err)
        }).then(() => {
            this.logger.log('disconnected from X')
        })
        this.httpServer?.close((err) => {
            if (err) {
                this.logger.error(err)
            }
            this.logger.log('closed')
        })
    }

    private config() {
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(bodyParser.json({limit: '1mb'})) // 100kb default
    }

    private routes(): void {
        this.app.use('/', healthCheck)
    }

    private async dbConnect(createPool: CreatePool): Promise<() => Promise<void>> {
        const pool = createPool()
        await pool.connect()
            .then(async (client) => {
                await client.query('SELECT NOW()').then(rows => {
                    const result: { now: string } = rows.rows[0] as { now: string }
                    this.logger.log(`Starting DB connection @: ${result.now}`)
                })
                client.release()
            }).catch((err: Error) => {
                this.logger.error(err)
                throw err
            })
        return () => pool.end()
    }
}

export default Server
