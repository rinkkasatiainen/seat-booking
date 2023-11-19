import chai from 'chai'
import chaiSubset from 'chai-subset'
import Server, {ExpressApp, RabbitMQProducer} from '../src/server'
import {Logger, LogData, LogsData} from '../src/logger'
import {ActsAsPool, PgPool} from '../src/infra/postgres-db'
import {ActsAsWebSocketServer, WsServer} from '../src/infra/websocket/ws-server'
import {AmqpProducer} from '../src/infra/amqp/producer'

const {expect} = chai
chai.use(chaiSubset)


// const timer = (ms: number) => new Promise(res => setTimeout(res, ms))

type X = Record<string, unknown>


const isSubset: (sup: X | undefined, sub: X) => boolean =
    (superObj, subObj) => Object.keys(subObj).every(ele => {
        if (superObj === undefined) {
            return false
        }
        if (typeof subObj[ele] == 'object') {
            if (typeof superObj[ele] == 'object') {
                const subObject: Record<string, unknown> = subObj[ele] as Record<string, unknown>
                const superObjElement = superObj[ele] as Record<string, unknown>
                return isSubset(superObjElement, subObject)
            }
        }
        return subObj[ele] === superObj[ele]
    })

/*
eslint-disable @typescript-eslint/no-unsafe-assignment
*/

describe('Health Check of the system', () => {
    let server: Server |undefined
    let data: LogData
    let fakeWsServer: ActsAsWebSocketServer
    let producerProvider: () => Promise<RabbitMQProducer>
    let logger: Logger
    let pool: ActsAsPool
    after( async () => {
        await server?.close()
    })

    beforeEach( () => {
        fakeWsServer = WsServer.createNull()
        producerProvider = () => Promise.resolve(AmqpProducer.createNull())
        data = {error: [], log: []}
        logger = LogsData.createNull(data)
        pool = PgPool.createNull()

    })

    it('Logs error if cannot get time from DB', async () => {
        server = new Server(logger, pool, fakeWsServer, producerProvider, () => ExpressApp.createNull())
        await server.start(4010)

        expect(data.error.map((it: Error) => it.message)).to.eql(['Could not connect to DB'])
    })

    it('should be able to send a health/check and return response on websocket',  () => {
    })

    it('should be able to send a health/check and post that on AMQP.', () => {
    })
})

