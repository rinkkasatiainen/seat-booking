import {Request, Response} from 'express'
import request, {SuperTest, Test} from 'supertest'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import {ExpressApp} from '../../../src/delivery/express-app'

const {expect} = chai
chai.use(chaiSubset)

describe('ExpressApp shallow integration', () => {

    let app: ExpressApp
    before(() => {
        app = ExpressApp.app()
    })

    after(() => {
        app.close()
    })

    it('can connect routes to the app', async () => {
        app.routeFor('/', routes => {
            routes.get('/foo', (_req, res) => {
                res.json({status: 'ok'})
            })
            return routes
        })
        await app.listen(5001, () => { /* noop*/
        })

        // @ts-ignore for testing
        const testSession: SuperTest<Test> = request(app._express)

        await testSession.get('/foo').expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })

    it('works also on stupid Server', async () => {
        const fakeApp: ExpressApp = ExpressApp.customServer()
        fakeApp.routeFor('/', routes => {
            routes.get('/foo', (_req: Request, res: Response) => {
                res.statusCode = 201
                res.setHeader('content-type', 'application/json')
                res.write(JSON.stringify({status: 'ok'}))
                res.end()
            })
            return routes
        })
        await fakeApp.listen(5002, () => {
            // console.log('started!!')
        })

        const testSession: SuperTest<Test> = request('http://localhost:5002')

        await testSession.get('/foo').expect(201)
            .expect((res => {
                expect(res.body).to.eql({status: 'ok'})
            }))
        fakeApp.close()

    })
})
