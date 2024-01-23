import chai from 'chai'
import chaiSubset from 'chai-subset'
import Server, {ListenesMessages} from '../../../src/server'
import {LogData, Logger, LogsData} from '../../../src/logger'
import {ActsAsPool, PgPool} from '../../../src/infra/postgres-db'
import {ActsAsWebSocketServer, WsServer} from '../../../src/infra/websocket/ws-server'
import {ExpressApp, RouteApp} from '../../../src/delivery/express-app'
import {AmqpProducer} from '../../../src/common/infra/amqp/producer'
import {AmqpConsumer} from '../../../src/common/infra/amqp/consumer'

const {expect} = chai
chai.use(chaiSubset)

describe('Server startup', () => {
    let server: Server |undefined
    let data: LogData
    let fakeWsServer: ActsAsWebSocketServer
    let producer: AmqpProducer
    let listener: ListenesMessages
    let providesExpress: RouteApp
    let logger: Logger
    let pool: ActsAsPool
    after( async () => {
        await server?.close()
    })

    beforeEach( async () => {
        data = {error: [], log: []}
        logger = LogsData.createNull(data)
        fakeWsServer = WsServer.createNull()
        producer = AmqpProducer.createNull({})
        listener = await AmqpConsumer.createNull()
        providesExpress = ExpressApp.createNull()
        pool = PgPool.createNull()
    })

    it('Logs error if cannot get time from DB', async () => {
        await new Server(logger, pool, fakeWsServer, producer, listener, producer, listener, providesExpress)
            .start(4010)

        expect(data.error.map((it: Error) => it.message)).to.eql(['Could not connect to DB'])
    })

    it('checks time of now when connecting to DB',  async () => {
        const now = new Date().toLocaleString()
        pool = PgPool.createNull({'SELECT NOW()': [{now}]})

        await new Server(logger, pool, fakeWsServer, producer, listener, producer, listener, providesExpress)
            .start(4010)

        expect(data.log).to.eql([`Starting DB connection @: ${now}`])
    })

    it('creates listener for events, connects to it', async () => {
        await new Server(logger, pool, fakeWsServer, producer, listener, producer, listener, providesExpress)
            .start(4010)

        expect(true).to.eql(false)

    })
})

