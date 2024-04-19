import chai from 'chai'
import chaiSubset from 'chai-subset'
import {MessageProperties} from 'amqplib'
import {amqpMessageOf} from '../../utils/amqp_stream'
import {AmqpProducer, StubbedBroadcast} from '../../../src/common/infra/amqp/producer'
import {trackDomainMessage} from '../../../src/domain/tracked-message'
import {AMQP_ENV, getVars} from '../../../src/env-vars'
import {ActsAsServer, Server} from '../../../src/server/server'
import {ExpressApp} from '../../../src/delivery/express-app'
import {LogsData} from '../../../src/logger'
import {AmqpConsumer, StubbedChannel} from '../../../src/common/infra/amqp/consumer'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {HealthCheck, healthCheck} from '../../../src/domain/event'
import {TrackedAmqpEvent} from '../../../src/common/infra/amqp-events'


const {expect} = chai
chai.use(chaiSubset)

const queueName = 'a-random-queue'

// interface X { [key: string]: unknown }
type X = Record<string, unknown>

chai.use((ch) => {
    const Assertion = ch.Assertion

    Assertion.addMethod('matching', function(expected: Subset, idKey) {

        const obj = this._obj // eslint-disable-line @typescript-eslint/no-unsafe-assignment


        // throw new Error(JSON.stringify(obj, null, 4))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // new Assertion(obj[idKey]).to.be.a('string')

        Object.keys(expected).forEach((key) => {
            new Assertion(isSubset(obj, expected), 'expecting subsets to match').to.eq(true)
        })
    })
})

type Subset = Record<string, unknown>
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


describe('component of Bookings', () => {
    let server: ActsAsServer
    let routeApp: ExpressApp
    let logger: LogsData
    let listeningChannel: StubbedChannel
    let listener: AmqpConsumer
    let producer: AmqpProducer
    let prodChannel: StubbedBroadcast

    beforeEach(async () => {
        logger = LogsData.createNull()
        routeApp = ExpressApp.createNull()
        listeningChannel = new StubbedChannel()
        prodChannel = new StubbedBroadcast()
        listener = await AmqpConsumer.createNull({channel: listeningChannel, qName: queueName})
        producer = AmqpProducer.createNull({channel: prodChannel})
    })

    afterEach(() => {
        server.close()
    })

    describe('handles health-check', () => {
        it('forwards rabbitmq responses to WS', async () => {
            const trackedMessage = trackDomainMessage(testDomainEventOf('a test event'))

            server = await Server.of(logger, listener, producer, routeApp).start(4011)

            prodChannel.trackRequests('health-check', 'responses')
            listeningChannel.simulate(queueName, amqpMessageOf(trackedMessage))


            producer.send(trackDomainMessage(healthCheck('Hello from component test')))

        }).timeout(10000)
        it('request-response from AMQP', async () => {
            const tracksMessages = prodChannel.trackRequests('health-check', 'responses')
            server = await Server.of(logger, listener, producer, routeApp).start(4011)

            const message = trackDomainMessage(healthCheck('Hello from component test'))
            listeningChannel.simulate(queueName, {
                content: Buffer.from(JSON.stringify(message), 'utf-8'),
                fields: {deliveryTag: 1, redelivered: false, exchange: 'any', routingKey: 'rt'},
                properties: {} as MessageProperties,
            })

            await new Promise(res => setTimeout(res, 1000))

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const data = tracksMessages.data().map((it: TrackedAmqpEvent) => {
                // throw new Error(`it: ${it.args}`)
                // throw new Error(`it: ${JSON.stringify(it.args)}`)
                const parse: Buffer[] = it.args as Buffer[]
                // throw new Error(`it: ${JSON.stringify(parse)}`)
                return JSON.parse(parse).data as HealthCheck
            })
            // throw new Error(`it: ${JSON.stringify(data)}`)
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            expect(data).to.matching([{
                __type: 'HealthCheck',
                message: 'Hello from component test',
            }])
        })
    })

})
