import {Request, Response} from 'express'
import chai from 'chai'
import {healthCheckRoute} from '../../../src/delivery/routes/health-check'
import {WsServer} from '../../../src/infra/websocket/ws-server'
import {AmqpProducer} from '../../../src/infra/amqp/producer'
import {AmqpConsumer} from '../../../src/infra/amqp/consumer'
import {ExpressApp, TestRoutes} from '../../../src/delivery/express-app'
import {DomainEvent, healthCheck} from '../../../src/domain/event'
import {testDomainEventOf} from '../test-domain-event'
import {trackDomainMessage} from '../../../src/domain/tracked-message'

const {expect} = chai

describe('health check route', () => {
    it('Does broadcast message', () => {
        const routes: TestRoutes = ExpressApp.nullRoutes()

        const spiedBroadcast: DomainEvent[] = []
        const broadcast = WsServer.createNull(spiedBroadcast).broadcast
        const route = healthCheckRoute(routes)(broadcast,
            AmqpProducer.createNull(),
            AmqpConsumer.createNull(() => trackDomainMessage(testDomainEventOf('foobar'))),
            AmqpProducer.createNull(),
        )

        const message = 'Message from Test!'
        const req = {body: {data: message}} as Request
        const res = {
            status: (/* _num: number*/) => res,
            json: (/* _body*/) => {/**/
            },
        } as unknown as Response
        route.simulate('POST', '/health/check')(req, res)

        expect(spiedBroadcast).to.eql([{...healthCheck(message), ws: {status: 'connected'}}])
    })

    it('Does broadcast message, vol2', () => {
        const routes: TestRoutes = ExpressApp.nullRoutes()

        const spiedBroadcast: DomainEvent[] = []
        const broadcast = WsServer.createNull(spiedBroadcast).broadcast
        const route = healthCheckRoute(routes)(broadcast,
            AmqpProducer.createNull(),
            AmqpConsumer.createNull(() => trackDomainMessage(testDomainEventOf('foobar'))),
            AmqpProducer.createNull(),
        )

        const message = 'Message from Test!'
        const req = {body: {data: message}} as Request
        const res = {
            status: (/* _num: number*/) => res,
            json: (/* _body*/) => {/**/
            },
        } as unknown as Response
        route.simulate('POST', '/health/check')(req, res)

        expect(spiedBroadcast).to.eql([{...healthCheck(message), ws: {status: 'connected'}}])
    })
})
