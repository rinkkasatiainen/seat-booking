import sinon from 'sinon'
import ws, {WebSocket} from 'ws'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import {WsServer} from '../../../src/infra/websocket/ws-server'
import {testDomainEventOf} from '../test-domain-event'

const {expect} = chai
chai.use(sinonChai)

type WsInstanceType = InstanceType<typeof ws.WebSocket>

const dummy = sinon.spy
const noop = () => { /* no-op */}

describe('WS server of ActsAsWebServer', () => {

    const mockServerWith: (x: Partial<ws.Server>) => ws.Server = data => {
        const def = {
            clients: new Set<WsInstanceType>(),
            close: (/* _cb: (err?: Error) => void*/) => {
                throw new Error('unexpected call to \'close\'')
            },
            emit: (/* _event: Event, _socket: ws.WebSocket, _rq: unknown*/) => {
                throw new Error('unexpected call to \'emit\'')
            },
        }

        return {
            ...def,
            ...data,
        } as ws.Server
    }
    const fakeClientWith: (x: Partial<WebSocket>) => WebSocket = (data) => ({
        readyState: WebSocket.OPEN,
        ...data,
    } as unknown as WebSocket)

    const wsServer: (x: { clients?: WebSocket[]; close?: () => void }) => ws.Server = (args) => {
        const {clients, ...rest} = args
        const clientSet = clients ? new Set(clients) : new Set([])
        return mockServerWith({
            clients: clientSet,
            ...rest,
        })
    }
    describe('with one client', () => {
        let spy: sinon.SinonSpy
        beforeEach(() => {
            spy = sinon.spy()
        })

        it('should send to client', () => {
            const _cl: WebSocket = fakeClientWith({send: spy})
            const server = new WsServer(wsServer({clients: [_cl]}))

            const event = testDomainEventOf('any')
            server.broadcast(event)

            expect(spy).to.have.been.called
        })

        it('should close the client', () => {
            const _cl: WebSocket = fakeClientWith({close: spy})

            const wsServer1 = wsServer({clients: [_cl], close: dummy()})
            const server = new WsServer(wsServer1)

            server.close((/* _err */) => {
                throw new Error('not here')
            })

            expect(spy).to.have.been.called
        })
        it('should close the server', () => {
            const _cl: WebSocket = fakeClientWith({close: dummy()})

            const wsServer1 = wsServer({clients: [_cl], close: spy})
            const server = new WsServer(wsServer1)

            server.close(noop)

            expect(spy).to.have.been.called
        })
    })
    describe('with zero client', () => {
        let spy: sinon.SinonSpy
        beforeEach(() => {
            spy = sinon.spy()
        })
        it('closes the server', () => {
            const wsServer1 = wsServer({close: spy})
            const server = new WsServer(wsServer1)

            server.close(noop)

            expect(spy).to.have.been.calledWith(noop)
        })
    })
})
