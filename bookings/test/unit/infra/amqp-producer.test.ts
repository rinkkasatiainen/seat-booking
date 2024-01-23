import chai from 'chai'
import chaiSubset from 'chai-subset'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {OutputTracker} from '../../../src/cross-cutting/output-tracker'
import {TrackedAmqpEvent} from '../../../src/common/infra/amqp-events'
import {AmqpProducer, StubbedBroadcast} from '../../../src/common/infra/amqp/producer'
import {StubbedConnection} from '../../../src/common/infra/amqp/consumer'
import {trackDomainMessage} from '../../../src/domain/tracked-message'

const {expect} = chai
chai.use(chaiSubset)

describe('Happens to Stub the AMQProducer', () => {

    let producer: AmqpProducer
    // let conn: StubbedConnection
    let channel: StubbedBroadcast
    let tracksMessages: OutputTracker<TrackedAmqpEvent>
    beforeEach(() => {
        // conn = new StubbedConnection()
        // channel = new StubbedChannel()
        channel = new StubbedBroadcast()
        producer = AmqpProducer.createNull({channel})
    })

    afterEach(() => {
        producer.close()
    })


    it('it sends a domain event', () => {
        const domainEvent = testDomainEventOf('foobar')
        tracksMessages = channel.trackRequests('health-check', 'responses')

        producer.send(trackDomainMessage(domainEvent))

        // @ts-ignore if fails, fails test case, too.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
        const data = tracksMessages.data().map(it => JSON.parse(it.args).data)
        expect(data).to.eql([{
            __type: 'HealthCheck',
            data: 'foobar',
        }])
    })

    describe('closing producer', () => {

        it('closes channel', () => {
            tracksMessages = channel.trackRequests()
            producer.close()

            expect(tracksMessages.data()).to.eql([{type: 'events', args: ['closed']}])
        })

        it('closes connection', () => {

            const connection = new StubbedConnection()
            const p = AmqpProducer.createNull({connection})
            tracksMessages = connection.trackRequests()
            p.close()

            expect(tracksMessages.data()).to.eql([{type: 'events', args: ['closed']}])
        })
    })
})
