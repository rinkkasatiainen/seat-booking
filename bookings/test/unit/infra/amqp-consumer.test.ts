import chai from 'chai'
import chaiSubset from 'chai-subset'
import {MessageProperties} from 'amqplib'
import {AmqpConsumer, StubbedChannel, StubbedConnection} from '../../../src/infra/amqp/consumer'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {amqpMessageOf} from '../../utils/amqp_stream'
import {OutputTracker} from '../../../src/cross-cutting/output-tracker'
import {TrackedAmqpEvent} from '../../../src/infra/amqp-events'

const {expect} = chai
chai.use(chaiSubset)

const noop = (): void => { /* noop */}

describe('Happens to Stub the AMQPConsumer', () => {

    let consumer: AmqpConsumer
    let conn: StubbedConnection
    let channel: StubbedChannel
    const queueName = 'TEST Q'
    beforeEach(async () => {
        conn = new StubbedConnection()
        channel = new StubbedChannel()
        consumer = await AmqpConsumer.createNull({qName: queueName, conn, channel})
    })

    afterEach(() => {
        consumer.close()
    })


    it('can consume a domain event', (done) => {
        const domainEvent = testDomainEventOf('foobar')

        consumer.onMessage(event => {
            expect(event).to.eql({...domainEvent})
            done()
        })

        channel.simulate(queueName, amqpMessageOf(domainEvent))
    })

    it('should not consume an event that is not domain event', (done) => {
        consumer.onMessage(() => {
            throw new Error('This should not have been called.')
        })

        channel.simulate(queueName, {
            content: Buffer.from(JSON.stringify({_any: 'ramdom messsage'}), 'utf-8'),
            fields: {deliveryTag: 1, redelivered: false, exchange: 'any', routingKey: 'rt'},
            properties: {} as MessageProperties,
        })
        setTimeout(() => {
            done()
        }, 300)
    })

    it('consumes messages from AMQP', () => {
        const tracksMessages: OutputTracker<TrackedAmqpEvent> = consumer.trackRequests()
        consumer.onMessage(noop) // This opens listening to the queue.

        channel.simulate(queueName, amqpMessageOf(testDomainEventOf('a test event')))

        expect(tracksMessages.data()).to.eql(
            [{
                type: 'listen',
                args: [{ msg: testDomainEventOf('a test event')}],
            }],
        )
    })
})
