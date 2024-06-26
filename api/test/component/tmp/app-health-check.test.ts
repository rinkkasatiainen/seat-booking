import * as console from 'console'
import {fail} from 'assert'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import request, {SuperTest, Test} from 'supertest'
import WebSocket from 'ws'
import Server, {ListenesMessages, ServerLike} from '../../../src/server'
import {Logger} from '../../../src/logger'
import {createPool} from '../../../src/infra/postgres-db'
import {AMQP_ENV, getVars, PG_ENV} from '../../../src/env-vars'
import {wsServerB} from '../../../src/infra/websocket/ws-server'
import {DomainEvent, isDomainEvent, isHealthCheck} from '../../../src/domain/event'
import {websocket, streamOf} from '../../utils/ws-stream'
import {knownEvents} from '../../../src/domain/known-events'
import {ExpressApp} from '../../../src/delivery/express-app'
import {RabbitSpy, rabbitSpy} from '../../utils/amqp_stream'
import {streamSpy} from '../../utils/stream'
import {Matches} from '../../utils/matches'
import {AmqpProducer} from '../../../src/common/infra/amqp/producer'
import {AmqpConsumer} from '../../../src/common/infra/amqp/consumer'

const {expect} = chai
chai.use(chaiSubset)

const logger: Logger = {
    log: console.log.bind(this),
    error: console.error.bind(this),
}

const pgEnv: PG_ENV = {
    PG_HOST: 'postgres', PG_PASSWORD: 'pass1', PG_PORT: '5432', PG_USERNAME: 'user1',
}

const envVars: AMQP_ENV = getVars() as AMQP_ENV

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
    let consumer: ListenesMessages
    let rabbitMqSpy: RabbitSpy

    before(async () => {
        const producer = await AmqpProducer.of(envVars, 'health-check:api')
        consumer = await AmqpConsumer.of(envVars, 'health-check-test')
        app = await new Server(logger, createPool(pgEnv), wsServerB(),
            producer, consumer, producer, consumer, ExpressApp.app()).start(4001)
        // @ts-ignore for testing purposes;
        testSession = () => request(app.app)
        rabbitMqSpy = await rabbitSpy('health-check:api')
    })
    after(async () => {
        consumer.close()
        await app.close()
        rabbitMqSpy.close()
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
        wsClient.on('open', (/* _: WebSocket*/) => {
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
            for (const domainEvent of spy) {
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
        const stream = streamSpy(rabbitMqSpy).ofType(knownEvents.HealthCheck).withPayload('amqp').log()

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

        await stream.waitUntilFound(4)

    }).timeout(5000)


    // it('does magic', () => {
    //
    //     listenTo(websocket).and.expect(knownEvents.HealthCheck).withPayload(Matches.toSubset())
    //
    //     withWebsocketConnection().itShouldReceive(knownEvents.HealthCheck).withPayload(Matches.toSubset())
    //
    // })


    it('I think this reads better', async () => {
        const stream = streamOf(await websocket(4001))
            .ofType(knownEvents.HealthCheck).log()
            .withPayload('ws')
            .matching(Matches.toSubset({ws: {status: 'connected'}, message: 'Hello Websocket Test'}))

        await testSession().post('/health/check')
            .set('Accept', 'application/json')
            .send({data: 'Hello Websocket Test'})
            .expect(200)

        await stream.waitUntilFound(5)
    }).timeout(10000)
})
