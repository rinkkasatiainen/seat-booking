import chai from 'chai'
import chaiSubset from 'chai-subset'
import request from 'supertest'
import {before} from 'mocha'
import {WsSpy, wsSpy, wsStream} from '../utils/ws-stream'


import {knownEvents} from '../../src/domain/known-events'
import {Matches} from '../utils/matches'
import {createStreamSpy} from '../utils/stream'
import {rabbitSpy} from '../utils/amqp_stream'

const {expect} = chai
chai.use(chaiSubset)

describe('deployment', () => {
    const rq = request('http://localhost:4000')
    let spy: WsSpy

    before(async () => {
        spy = await wsSpy(4000)
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
        const stream = wsStream(spy)
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

    describe('POST sends health check info on WS', () => {
        it('ws is connected', async () => {
            const stream = wsStream(spy)
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
            const stream = wsStream(spy)
                .ofType(knownEvents.HealthCheck)
                .withPayload('ws')
                .log()
                .matching(Matches.toSubset({ws: {status: 'connected'}, amqp: {status: 'connected'}}))

            await rq.post('/health/check')
                .set('Accept', 'application/json')
                .send({data: 'Hello Deployment Test2'})
                .expect(200)

            await stream.waitUntilFound(3)
        }).timeout(10000)

        it('also sends a message for \'bookings\' health ', async () => {
            const spy1 = await rabbitSpy('health-check:bookings')
            const stream = createStreamSpy(spy1)
                .ofType(knownEvents.HealthCheck)
                .log()
                .matching(Matches.toSubset({ws: {status: 'connected'}, amqp: {status: 'connected'}}))

            await rq.post('/health/check')
                .set('Accept', 'application/json')
                .send({data: 'Hello Deployment Test3'})
                .expect(200)

            await stream.waitUntilFound(5)

        }).timeout(10000)
    })
})
