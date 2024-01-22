import {AMQP_ENV, getVars} from '../../../src/env-vars'
import {testDomainEventOf} from '../../unit/test-domain-event'
import {RabbitSpy, rabbitSpy} from '../../utils/amqp_stream'
import {knownEvents} from '../../../src/domain/known-events'
import {streamSpy, StreamSpy} from '../../utils/stream'
import {Matches} from '../../utils/matches'
import {trackDomainMessage} from '../../../src/domain/tracked-message'
import {AmqpProducer} from '../../../src/common/infra/amqp/producer'

describe('AMQP Producer', () => {
    let spy: RabbitSpy
    let stream: StreamSpy
    const envVars: AMQP_ENV = getVars() as AMQP_ENV

    before(async () => {
        spy = await rabbitSpy('health-check:api')
        stream = streamSpy(spy)
    })

    after(() => {
        spy.close()
    })

    it('does send a message', async () => {
        stream = stream.ofType(knownEvents.HealthCheck)
            .withPayload('data')
            .matching(Matches.toSubset({data: 'Sending to RabbitMQ'})).log()

        // const producer = await createMQProducer2(envVars, 'amq.topic')
        const producer = await AmqpProducer.of(envVars, 'health-check:api')

        producer.send(trackDomainMessage(testDomainEventOf('Sending to RabbitMQ')))

        try {
            await stream.waitUntilFound(4)
        } finally {
            producer.close()
        }
    }).timeout(5000)
})
