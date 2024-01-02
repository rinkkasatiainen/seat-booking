import {AmqpProducer} from '../../../src/infra/amqp/producer'
import {AMQP_ENV, getVars} from '../../../src/env-vars'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {RabbitSpy, rabbitSpy} from '../../utils/amqp_stream'
import {Matches} from '../../utils/matches'
import {streamSpy, StreamSpy} from '../../utils/stream'
import {knownEvents} from '../../../src/domain/known-events'

describe('AMQP Producer', () => {
    let spy: RabbitSpy
    let stream: StreamSpy
    const envVars: AMQP_ENV = getVars() as AMQP_ENV

    beforeEach(async () => {
        spy = await rabbitSpy('health-check:responses')
        stream = streamSpy(spy)
    })

    after(() => {
        spy.close()
    })

    it('does send a message', async () => {
        stream = stream.ofType(knownEvents.HealthCheck)
            .withPayload('data')
            .matching(Matches.toSubset({data: 'Sending to RabbitMQ'}))

        // const producer = await createMQProducer2(envVars, 'amq.topic')
        const producer = await AmqpProducer.of(envVars, 'health-check:bookings')

        producer.send(testDomainEventOf('Sending to RabbitMQ'))

        try {
            await stream.waitUntilFound(5)
        } finally {
            producer.close()
        }
    })
})
