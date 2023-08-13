import express from 'express'
import bodyParser from 'body-parser'
import {CreatePool} from './infra/postgres-db'
import {Logger} from './logger'

import healthCheck from "./delivery/routes/health-check";

class Server {
    private app

    constructor(private readonly logger: Logger, private readonly pool: CreatePool) {
        this.app = express()
        this.config()
        this.routes()
        this.dbConnect()
    }

    public start: (x: number) => Promise<number> = (port: number) => new Promise((resolve, reject) => {
        this.app.listen(port, () => {
            resolve(port)
        }).on('error', (err: object) => reject(err))
    })

    private config() {
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(bodyParser.json({limit: '1mb'})) // 100kb default
    }

    private routes(): void {
        this.app.use('/', healthCheck)
    }

    private dbConnect() {
        this.pool().connect((err /* , client, done */) => {
            if (err) {
                throw new Error(err.message)
            }
            this.logger.log('Connected')
        })
    }
}

export default Server
