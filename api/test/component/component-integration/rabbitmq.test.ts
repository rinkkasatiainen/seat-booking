import {AmqpProducer} from '../../../src/common/infra/amqp/producer'
import {AMQP_ENV, getVars} from '../../../src/env-vars'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {RabbitSpy, rabbitSpy} from '../../utils/amqp_stream'
import {Matches} from '../../utils/matches'
import {streamSpy, StreamSpy} from '../../utils/stream'
import {knownEvents} from '../../../src/domain/known-events'
import {trackDomainMessage} from '../../../src/domain/tracked-message'
import {SendsMessages} from '../../../src/server'

describe('AMQP Producer', () => {
    let spy: RabbitSpy
    let stream: StreamSpy
    const envVars: AMQP_ENV = getVars() as AMQP_ENV

    beforeEach(async () => {
        spy = await rabbitSpy('health-check:api')
        stream = streamSpy(spy)
    })

    after(() => {
        spy.close()
    })

    it('does send a message', async () => {
        stream = stream.ofType(knownEvents.HealthCheck)
            .withPayload('data').log()
            .matching(Matches.toSubset({data: 'Sending to RabbitMQ'}))

        // const producer = await createMQProducer2(envVars, 'amq.topic')
        const producer: SendsMessages = await AmqpProducer.of(envVars, 'health-check:api')

        producer.send(trackDomainMessage(testDomainEventOf('Sending to RabbitMQ')))

        try {
            await stream.waitUntilFound(3)
        } finally {
            producer.close()
        }
    }).timeout(6000)
})
