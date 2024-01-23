import chai from 'chai'
import chaiSubset from 'chai-subset'
import {Server} from '../../../src/server'
import {LogsData} from '../../../src/logger'
import {ExpressApp, FakeServer} from '../../../src/delivery/express-app'
import {ActsAsServer} from '../../../src/server/server'
import {OutputTracker} from '../../../src/cross-cutting/output-tracker'
import {AmqpConsumer, StubbedChannel} from '../../../src/common/infra/amqp/consumer'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {amqpMessageOf} from '../../utils/amqp_stream'
import {TrackedAmqpEvent} from '../../../src/common/infra/amqp-events'
import {healthCheck} from '../../../src/domain/event'
import {AmqpProducer, StubbedBroadcast} from '../../../src/common/infra/amqp/producer'
import {TrackedExpressAppEvent} from '../../../src/common/infra/express-app-events'
import {trackDomainMessage} from '../../../src/domain/tracked-message'

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

    describe('listens to HTTP calls', () => {
        let fakeRoute: FakeServer

        beforeEach(async () => {
            fakeRoute = new FakeServer()
            routeApp = ExpressApp.createNull(fakeRoute)
            server = await Server.of(logger, listener, producer, routeApp).start(4011)
        })

        it('responds with GET /health/check', () => {
            const tracksMessages: OutputTracker<TrackedExpressAppEvent> = fakeRoute.trackRequests()

            fakeRoute.simulate('GET', '/health/check')
            expect(tracksMessages.data()
                .filter(it => it.type === 'respond')).to.eql(
                [{
                    type: 'respond',
                    args: ['GET', '/health/check', {status: 'ok'}],
                }],
            )
        })
    })

    describe('connects with AMQP', () => {
        beforeEach(async () => {
            server = await Server.of(logger, listener, producer, routeApp).start(4011)
        })

        it('consumes messages', () => {
            const tracksMessages: OutputTracker<TrackedAmqpEvent> = listener.trackRequests()
            const trackedMessage = trackDomainMessage(testDomainEventOf('a test event'))
            listeningChannel.simulate(queueName, amqpMessageOf(trackedMessage))

            expect(tracksMessages.data()
                .filter(it => it.type === 'listen')).to.eql(
                [{
                    type: 'listen',
                    args: [{msg: trackedMessage}],
                }],
            )
        })

        it('Feat: sends health-check response', () => {
            const tracksMessages = prodChannel.trackRequests('health-check', 'responses')
            listeningChannel.simulate(
                queueName,
                amqpMessageOf(trackDomainMessage(healthCheck('a test health check event')))
            )

            const events: unknown = tracksMessages.data()
                .filter(it => it.type === 'broadcast')
                // @ts-ignore fails as part of test, if not ok
                .map(it => JSON.parse(it.args).data)[0] // eslint-disable-line

            expect(events).to.containSubset(
                {__type: 'HealthCheck', message: 'a test health check event'},
            )
        })

    })

})
