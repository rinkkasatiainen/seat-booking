import chai from 'chai'
import chaiSubset from 'chai-subset'
import request from 'supertest'
import {knownEvents} from '../../../src/domain/known-events'
import {AmqpProducer} from '../../../src/common/infra/amqp/producer'
import {rabbitSpy, RabbitSpy} from '../../utils/amqp_stream'
import {AMQP_ENV, getVars} from '../../../src/env-vars'
import {Matches} from '../../utils/matches'
import {testDomainEventOf} from '../../utils/test-domain-event'
import {streamSpy} from '../../utils/stream'
import {trackDomainMessage} from '../../../src/domain/tracked-message'


const {expect} = chai
chai.use(chaiSubset)

describe('deployment', () => {
    const rq = request('http://localhost:4100')

    describe('health check on HTTP', () => {
        it('Should start server', async () => {
            await rq.get('/health/check')
                .expect(200)
                .expect((res => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    expect(res.body.status).to.eql('ok')
                }))
        })

        // TODO: AkS: Should this work like this?
        xit('health check also checks rabbitMQ', async () => {
            await rq.get('/health/check')
                .expect(200)
                .expect((res => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    expect(res.body).to.eql({status: 'ok', amqp: 'connected'})
                }))
        })
    })

    describe('health-check command on AMQP', () => {

        let spy: RabbitSpy
        const envVars: AMQP_ENV = getVars() as AMQP_ENV

        beforeEach(async () => {
            spy = await rabbitSpy('health-check:responses')
        })

        after(() => {
            spy.close()
        })

        it('listens to AMQP', async () => {
            let stream = streamSpy(spy)
            stream = stream.ofType(knownEvents.HealthCheck)
                .withPayload('data')
                .matching(Matches.toSubset(
                    {data: 'Sending to RabbitMQ', bookings: {status: 'ok', amqp: {status: 'connected'}}}
                ))
                .log()

            const producer = await AmqpProducer.of(envVars, 'health-check:bookings')

            producer.send(trackDomainMessage(testDomainEventOf('Sending to RabbitMQ')))

            try {
                (await stream.waitUntilFound(5))
            } finally {
                producer.close()
            }
        }).timeout(6000)
    })

})
