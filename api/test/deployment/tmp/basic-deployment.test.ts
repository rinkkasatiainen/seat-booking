import chai from 'chai'
import chaiSubset from 'chai-subset'
import request from 'supertest'
import {WsSpy, websocket, streamOf} from '../../utils/ws-stream'
import {knownEvents} from '../../../src/domain/known-events'
import {Matches} from '../../utils/matches'
import {createStreamSpy} from '../../utils/stream'
import {rabbitSpy} from '../../utils/amqp_stream'
import {AmqpProducer} from "../../../src/common/infra/amqp/producer";
import {trackDomainMessage} from "../../../src/domain/tracked-message";
import {customTestDomainEvent, testDomainEventOf} from "../../unit/test-domain-event";
import {AMQP_ENV, getVars} from "../../../src/env-vars";

const {expect} = chai
chai.use(chaiSubset)

describe('deployment', () => {
    const rq = request('http://localhost:4000')
    let spy: WsSpy

    before(async () => {
        spy = await websocket(4000)
    })

    after(() => {
        spy.close()
    })

    it('GET /health/check provides some information', async () => {
        await rq.get('/health/check')
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })

    it('POST responds with WS connection amount', async () => {
        const stream = streamOf(spy)
            .ofType(knownEvents.HealthCheck)
            .withPayload('ws')
            .matching(Matches.toSubset({ws: {status: 'connected'}}))

        await rq.post('/health/check')
            .set('Accept', 'application/json')
            .send({data: 'Hello Deployment Test'})
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const {status} = res.body
                expect(status).to.containSubset({
                    websocket: {
                        status: 'ok',
                        connections: (expectedValue: number) => expectedValue >= 1,
                    },
                })
            }))
        await stream.waitUntilFound(5)
    })

    describe('listens to health-check:responses', () => {
        const envVars: AMQP_ENV = getVars() as AMQP_ENV
        let producer: AmqpProducer;
        beforeEach( async () => {
            producer = await AmqpProducer.of(envVars, 'health-check:responses');
        })
        afterEach( () => {
            producer.close()
        })

        it('forwards rabbitmq responses to WS', async () => {
            const stream = streamOf(spy)
                .ofType(knownEvents.HealthCheck).log()
                .matching(Matches.toSubset({data: {sentThrough: 'rabbitmq'}, amqp: {status: 'connected'}}))

            producer.send(trackDomainMessage(customTestDomainEvent({sentThrough: 'rabbitmq'})))

            await stream.waitUntilFound(5)
        }).timeout(10000)
    });


    describe('POST sends health check info on WS', () => {
        it('ws is connected', async () => {
            const stream = streamOf(spy)
                .ofType(knownEvents.HealthCheck)
                .withPayload('ws')
                .matching(Matches.toSubset({ws: {status: 'connected'}}))

            await rq.post('/health/check')
                .set('Accept', 'application/json')
                .send({data: 'Hello Deployment Test'})
                .expect(200)

            await stream.waitUntilFound(5)
        }).timeout(10000)

        it('when rabbitMq is up, sends also rabbitMQ status', async () => {
            const stream = streamOf(spy)
                .ofType(knownEvents.HealthCheck)
                .withPayload('ws')
                .log()
                .matching(Matches.toSubset({ws: {status: 'connected'}, amqp: {status: 'connected'}}))

            await rq.post('/health/check')
                .set('Accept', 'application/json')
                .send({data: 'Hello Deployment Test2'})
                .expect(200)

            await stream.waitUntilFound(4)
        }).timeout(5000)

        it('also sends a message for \'bookings\' health ', async () => {
            const spy1 = await rabbitSpy('health-check:bookings')
            try {
                const stream = createStreamSpy(spy1)
                    .ofType(knownEvents.HealthCheck)
                    .log()
                    .matching(Matches.toSubset({ws: {status: 'connected'}, amqp: {status: 'connected'}}))

                await rq.post('/health/check')
                    .set('Accept', 'application/json')
                    .send({data: 'Hello Deployment Test3'})
                    .expect(200)

                await stream.waitUntilFound(5)
            } finally {
                spy1.close()
            }

        }).timeout(10000)
    })
})
