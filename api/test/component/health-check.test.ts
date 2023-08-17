import chai from "chai";
// import chaiSubset from "chai-subset";
import request from "supertest";
import Server from "../../src/server";
import {Logger} from "../../src/logger";
import * as console from "console";
import createPool from "../../src/infra/postgres-db";
import {PG_ENV} from "../../src/env-vars";

const {expect} = chai;
// chai.use(chaiSubset);

const logger: Logger = {
    log: console.log,
    error: console.error
}

const pg_env: PG_ENV = {
    PG_HOST: "postgres", PG_PASSWORD: "pass1", PG_PORT: "5432", PG_USERNAME: "user1"
}

describe('Health Check of the system', () => {
    let app: any
    let testSession

    before(async () => {
        app = await new Server(logger, createPool(pg_env)).start(4001)
    });
    after( async() => {
        app.close()
    })

    it('Should start server', async () => {
        testSession = request(app.app);
        await testSession.get('/health/check')
            .expect(200)
            .expect((res => {
                expect(res.body.status).to.eql('ok')
            }))
    })
});