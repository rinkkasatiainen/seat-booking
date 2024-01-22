import chai from 'chai'
import chaiSubset from 'chai-subset'
import {ExpressApp, FakeServer, StubbedRouter} from '../../../src/delivery/express-app'

const {expect} = chai
chai.use(chaiSubset)
const noop = () => { /* noop*/
}

describe('Can Stub the ExpressApp', () => {
    it('can stub whole server', async () => {
        const fakeServer = new FakeServer()
        const responseBody = {status: 'not-ok'}

        const stubbedRouter = new StubbedRouter()
        stubbedRouter.get('/foo', (_req, res) => {
            res.json(responseBody)
        })

        const fakeApp: ExpressApp = ExpressApp.createNull(fakeServer)
        fakeApp.routeFor('/', () => stubbedRouter)

        await fakeApp.listen(5002, noop)
        const outputTracker = fakeServer.trackRequests()

        fakeServer.simulate('GET', '/foo')

        expect(outputTracker.data().filter(it => it.type === 'respond')).to.eql(
            [{
                args: ['GET', '/foo', {status: 'not-ok'}],
                type: 'respond',
            }]
        )
    })
})
