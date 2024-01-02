import chai from 'chai'
import chaiSubset from 'chai-subset'
import {Server} from '../../../src/server'
import {LogsData} from '../../../src/logger'
import {ExpressApp} from '../../../src/delivery/express-app'
import {ActsAsServer} from '../../../src/server/server'
import {OutputTracker} from '../../../src/cross-cutting/output-tracker'
import {AmqpConsumer, StubbedChannel} from '../../../src/infra/amqp/consumer'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {amqpMessageOf} from '../../utils/amqp_stream'
import {TrackedAmqpEvent} from '../../../src/infra/amqp-events'
import {healthCheck} from '../../../src/domain/event'
import {AmqpProducer, StubbedBroadcast} from '../../../src/infra/amqp/producer'

const {expect} = chai
chai.use(chaiSubset)


const queueName = 'a-random-queue'

describe('Bookings server', () => {
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

    it('starts server on port', async () => {
        const trackMessages = routeApp.trackRequests()
        server = await Server.of(logger, listener, producer, routeApp).start(4011)

        expect(trackMessages.data()
            .filter(it => it.type === 'listen')).to.eql(
            [{
                type: 'listen',
                args: [{port: 4011}],
            }],
        )
    })
    describe('on running server', () => {
        beforeEach(async () => {
            server = await Server.of(logger, listener, producer, /* , listener, */routeApp).start(4011)
        })

        it('consumes messages from AMQP', () => {
            const tracksMessages: OutputTracker<TrackedAmqpEvent> = listener.trackRequests()
            listeningChannel.simulate(queueName, amqpMessageOf(testDomainEventOf('a test event')))

            expect(tracksMessages.data()
                .filter(it => it.type === 'listen')).to.eql(
                [{
                    type: 'listen',
                    args: [{msg: testDomainEventOf('a test event')}],
                }],
            )
        })

        it('sends health check message to producer as response.', () => {
            const tracksMessages = prodChannel.trackRequests('exchange-name', 'routing-key')
            listeningChannel.simulate(queueName, amqpMessageOf(healthCheck('a test health check event')))

            const events: unknown = tracksMessages.data()
                .filter(it => it.type === 'broadcast')
                // @ts-ignore fails as part of test, if not ok
                .map(it => JSON.parse(it.args))[0] // eslint-disable-line @typescript-eslint/no-unsafe-return

            expect(events).to.containSubset(
                {__type: 'HealthCheck', message: 'a test health check event'},
            )
        })

    })

})
