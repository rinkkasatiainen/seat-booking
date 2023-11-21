import chai from 'chai'
import chaiSubset from 'chai-subset'
import Server, {ExpressApp, RabbitMQProducer, RouteApp} from '../src/server'
import {LogData, Logger, LogsData} from '../src/logger'
import {ActsAsPool, PgPool} from '../src/infra/postgres-db'
import {ActsAsWebSocketServer, WsServer} from '../src/infra/websocket/ws-server'
import {AmqpProducer} from '../src/infra/amqp/producer'

const {expect} = chai
chai.use(chaiSubset)

describe('Server startup', () => {
    let server: Server |undefined
    let data: LogData
    let fakeWsServer: ActsAsWebSocketServer
    let producerProvider: () => Promise<RabbitMQProducer>
    let providesExpress: () => RouteApp
    let logger: Logger
    let pool: ActsAsPool
    after( async () => {
        await server?.close()
    })

    beforeEach( () => {
        fakeWsServer = WsServer.createNull()
        producerProvider = () => Promise.resolve(AmqpProducer.createNull())
        providesExpress = () => ExpressApp.createNull()
        data = {error: [], log: []}
        logger = LogsData.createNull(data)
        pool = PgPool.createNull()
    })

    it('Logs error if cannot get time from DB', async () => {
        await new Server(logger, pool, fakeWsServer, producerProvider, providesExpress).start(4010)

        expect(data.error.map((it: Error) => it.message)).to.eql(['Could not connect to DB'])
    })

    it('checks time of now when connecting to DB',  async () => {
        const now = new Date().toLocaleString()
        pool = PgPool.createNull({'SELECT NOW()': [{now}]})

        await new Server(logger, pool, fakeWsServer, producerProvider, providesExpress).start(4010)

        expect(data.log).to.eql([`Starting DB connection @: ${now}`])
    })
})

