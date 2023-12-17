import chai from 'chai'
import {Server} from '../../../src/server'
import {LogsData} from '../../../src/logger'
import {ExpressApp} from '../../../src/delivery/express-app'
import {ActsAsServer} from '../../../src/server/server'
import {OutputTracker} from '../../../src/cross-cutting/output-tracker'
import {AmqpConsumer, StubbedChannel} from '../../../src/infra/amqp/consumer'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {amqpMessageOf} from '../../utils/amqp_stream'
import {TrackedAmqpEvent} from '../../../src/infra/amqp-events'

const {expect} = chai

describe('Bookings server', () => {
    let server: ActsAsServer
    let routeApp: ExpressApp
    let logger: LogsData
    let listeningChannel: StubbedChannel
    let listener: AmqpConsumer

    beforeEach(async () => {
        logger = LogsData.createNull()
        routeApp = ExpressApp.createNull()
        listeningChannel = new StubbedChannel()
        listener = await AmqpConsumer.createNull({channel: listeningChannel, qName: 'a-random-queue'})
    })

    afterEach(() => {
        server.close()
    })

    it('starts server on port', async () => {
        const trackMessages = routeApp.trackRequests()
        server = await Server.of(logger, listener, /* producer, listener, */routeApp).start(4011)

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
            server = await Server.of(logger, listener, /* producer, listener, */routeApp).start(4011)
        })

        it('consumes messages from AMQP', () => {
            const tracksMessages: OutputTracker<TrackedAmqpEvent> = listener.trackRequests()
            listeningChannel.simulate('a-random-queue', amqpMessageOf(testDomainEventOf('a test event')))

            expect(tracksMessages.data()
                .filter(it => it.type === 'listen')).to.eql(
                [{
                    type: 'listen',
                    args: [{ msg: testDomainEventOf('a test event')}],
                }],
            )
        })

    })

})
