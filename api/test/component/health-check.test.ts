import * as console from 'console'
import {fail} from 'assert'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import request, {SuperTest, Test} from 'supertest'
import WebSocket from 'ws'
import Server, {RabbitMQConsumer, ServerLike} from '../../src/server'
import {Logger} from '../../src/logger'
import createPool from '../../src/infra/postgres-db'
import {AMQP_ENV, PG_ENV} from '../../src/env-vars'
import {wsServer} from '../../src/infra/websocket/ws-server'
import createMQProducer from '../../src/infra/amqp/producer'
import createMQConsumer from '../../src/infra/amqp/consumer'
import {DomainEvent, isDomainEvent, isHealthCheck} from '../../src/domain/event'
import {knownEvents} from '../../src/domain/known-events'
import {Matches, wsStream} from '../utils/ws-stream'

const {expect} = chai
chai.use(chaiSubset)

const logger: Logger = {
    log: console.log.bind(this),
    error: console.error.bind(this),
}

const pgEnv: PG_ENV = {
    PG_HOST: 'postgres', PG_PASSWORD: 'pass1', PG_PORT: '5432', PG_USERNAME: 'user1',
}

const amqpEnv: AMQP_ENV = {
    AMQP_HOST: 'localhost:5672', AMQP_PASSWORD: 'guest', AMQP_USERNAME: 'guest', AMQP_VHOST: 'api',

}

const timer = (ms: number) => new Promise(res => setTimeout(res, ms))

// interface X { [key: string]: unknown }
type X = Record<string, unknown>


const isSubset: (sup: X | undefined, sub: X) => boolean =
    (superObj, subObj) => Object.keys(subObj).every(ele => {
        if (superObj === undefined) {
            return false
        }
        if (typeof subObj[ele] == 'object') {
            if (typeof superObj[ele] == 'object') {
                const subObject: Record<string, unknown> = subObj[ele] as Record<string, unknown>
                const superObjElement = superObj[ele] as Record<string, unknown>
                return isSubset(superObjElement, subObject)
            }
        }
        return subObj[ele] === superObj[ele]
    })


describe('Health Check of the system', () => {
    let app: ServerLike
    let testSession: () => SuperTest<Test>
    let consumer: RabbitMQConsumer<JSONValue>

    before(async () => {
        const producer = async () => await createMQProducer(amqpEnv, 'aki.tmp')
        app = await new Server(logger, createPool(pgEnv), wsServer, producer).start(4001)
        // @ts-ignore for testing purposes;
        testSession = () => request(app.app)
        consumer = await createMQConsumer(amqpEnv, 'aki.tmp')
    })
    after(async () => {
        consumer.close()
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
        const spy: DomainEvent[] = []
        let connected = false
        wsClient.on('open', (_: WebSocket) => {
            wsClient.on('message', (data: WebSocket.RawData) => {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const str = data.toString()
                try {
                    const jsonData: unknown = JSON.parse(str)
                    if (isDomainEvent(jsonData)) {
                        spy.push(jsonData)
                    }
                } catch (e) {
                    /* noop*/
                }
                connected = true
            })
            console.log('opened connection')
        })


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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const {status} = res.body
                expect(status).to.eql({websocket: {status: 'ok', connections: 1}})
            }))

        for (let i = 0; i < 5; i++) {
            // @ts-ignore
            for (const domainEvent: string of spy) {
                if (isHealthCheck(domainEvent)) {
                    if (isSubset({...domainEvent}, {message: 'Hello Websocket Test'})) {
                        console.log('found')
                        return
                    }
                }
            }
            await timer(400)
            // @ts-ignore for testing
            console.log(`sss, ${spy.join(', ')}`)
        }
        fail('Should not have found')

    }).timeout(5000)

    it('should be able to send a health/check and post that on AMQP.', async () => {
        const spy: DomainEvent[] = []
        consumer.listen(msg => {
            spy.push(msg)
            return null
        })

        await testSession().post('/health/check')
            .set('Accept', 'application/json')
            .send({data: 'Hello RabbitMQ Test'})
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const {status} = res.body
                expect(status).to.containSubset({
                    websocket: {
                        status: 'ok',
                        connections: (expectedValue: number) => expectedValue >= 1,
                    },
                })
            }))

        for (let i = 0; i < 5; i++) {
            // @ts-ignore
            const domainEvent = spy[spy.length - 1]
            // @ts-ignore
            if (isHealthCheck(domainEvent)) {
                if (isSubset({...domainEvent}, {message: 'Hello RabbitMQ Test'})) {
                    console.log('found')
                    return
                }
                console.log('almost')
            }

            await timer(400)
            // @ts-ignore for testing
            console.log(`sss, ${spy.join(', ')}`)
        }
        fail('Should not have found')

    }).timeout(5000)


    it('I think this reads better', async () => {
        const stream = (await wsStream())
            .ofType(knownEvents.HealthCheck)
            .withPayload('ws')
            .matching(Matches.toSubset({ws: {status: 'connected'}}))

        await testSession().post('/health/check')
            .set('Accept', 'application/json')
            .send({data: 'Hello Websocket Test'})
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const {status} = res.body
                expect(status).to.containSubset({
                    websocket: {
                        status: 'ok',
                        connections: (expectedValue: number) => expectedValue >= 1,
                    },
                })
            }))

        await stream.waitUntilFound(5)
    }).timeout(10000)
})
