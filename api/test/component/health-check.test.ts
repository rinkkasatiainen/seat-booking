import * as console from 'console'
import { fail } from 'assert'
import chai from 'chai'
import request, {SuperTest, Test} from 'supertest'
import WebSocket from 'ws'
import Server, {ServerLike} from '../../src/server'
import {Logger} from '../../src/logger'
import createPool from '../../src/infra/postgres-db'
import {PG_ENV} from '../../src/env-vars'
import {wsServer} from '../../src/ws-server'

const {expect} = chai

const logger: Logger = {
    log: console.log.bind(this),
    error: console.error.bind(this),
}

const pgEnv: PG_ENV = {
    PG_HOST: 'postgres', PG_PASSWORD: 'pass1', PG_PORT: '5432', PG_USERNAME: 'user1',
}

describe('Health Check of the system', () => {
    let app: ServerLike
    let testSession: () => SuperTest<Test>

    before(async () => {
        app = await new Server(logger, createPool(pgEnv), wsServer).start(4001)
        // @ts-ignore for testing purposes;
        testSession = () => request(app.app)
    })
    after(async () => {
        await app.close()
    })

    it('Should start server', async () => {
        await testSession().get('/health/check')
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })

    it('should be able to send a health/check and return response on websocket', async () => {
        const wsClient: WebSocket = new WebSocket('ws://localhost:4001')
        const spy: string[] = []
        let connected = false
        wsClient.on('open', (_: WebSocket) => {
            wsClient.on('message', (data: WebSocket.RawData) => {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                spy.push(data.toString())
                connected = true
            })
            console.log('opened connection')
        })

        const timer = (ms: number) => new Promise(res => setTimeout(res, ms))

        for (let i = 0; i < 5; i++) {
            if (connected) {
                console.log('connected to WS')
                break
            }
            await timer(400)
        }

        await testSession().post('/health/check')
            .set('Accept', 'application/json')
            .send({data: 'Hello Websocket Test'})
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql({websocket: {status: 'ok', connections: 1}})
            }))

        for (let i = 0; i < 5; i++) {
            // @ts-ignore
            for(const x: string of spy){
                try {
                    const y: unknown = JSON.parse(x)
                    if(typeof y === 'object' && y !== null && 'data' in y && y.data === 'Hello Websocket Test') {
                        console.log('found')
                        return
                    }
                } catch (e) {
                    //  noop
                }
            }
            await timer(400)
            // @ts-ignore for testing
            console.log(`sss, ${spy.join(', ')}`)
        }
        fail('Should not have found')

    }).timeout(5000)
})
