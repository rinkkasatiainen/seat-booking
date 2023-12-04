import chai from 'chai'
import chaiSubset from 'chai-subset'
import request from 'supertest'
import {before} from 'mocha'
import {Matches, WsSpy, wsSpy, wsStream} from '../utils/ws-stream'


import {knownEvents} from '../../src/domain/known-events'

const {expect} = chai
chai.use(chaiSubset)

describe('deployment', () => {
    const rq = request('http://localhost:4000')
    let spy: WsSpy

    before(async () => {
        spy = await wsSpy(4000)
    })

    after( () => {
        spy.close()
    })

    it('Should start server', async () => {
        await rq.get('/health/check')
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })

    it('responds with status of WebSocket connections', async () => {
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
    }).timeout(10000)
    it('when rabbitMq is up, sends also rabbitMQ status', async () => {
        const stream =  wsStream(spy)
            .ofType(knownEvents.HealthCheck)
            .withPayload('ws')
            .matching(Matches.toSubset({ws: {status: 'connected'}, amqp: {status: 'connected'}}))

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
    }).timeout(10000)
})
