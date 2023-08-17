import * as console from 'console'
import chai from 'chai'
import request, {SuperTest, Test} from 'supertest'
import Server from '../../src/server'
import {Logger} from '../../src/logger'
import createPool from '../../src/infra/postgres-db'
import {PG_ENV} from '../../src/env-vars'

const {expect} = chai

const logger: Logger = {
    log: console.log.bind(this),
    error: console.error.bind(this),
}

const pgEnv: PG_ENV = {
    PG_HOST: 'postgres', PG_PASSWORD: 'pass1', PG_PORT: '5432', PG_USERNAME: 'user1',
}

describe('Health Check of the system', () => {
    let app: Server
    let testSession: () => SuperTest<Test>

    before(async () => {
        app = await new Server(logger, createPool(pgEnv)).start(4001)
        // @ts-ignore for testing purposes;
        testSession = () => request(app.app)
    })
    after( async () => {
        await app.close()
    })

    it('Should start server', async () => {
        await testSession().get('/health/check')
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })
})
