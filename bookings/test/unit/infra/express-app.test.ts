import chai from 'chai'
import chaiSubset from 'chai-subset'
import {ExpressApp, FakeServer, StubbedRouter} from '../../../src/delivery/express-app'

const {expect} = chai
chai.use(chaiSubset)

describe('Can Stub the ExpressApp', () => {
    it('can stub whole server', async () => {
        const fakeServer = new FakeServer()

        const stubbedRouter = new StubbedRouter()
        stubbedRouter.get('/foo', (req, res) => {
            res.json(req.body)
        })
        const fakeApp: ExpressApp = ExpressApp.createNull(fakeServer)
        fakeApp.routeFor('/', () => stubbedRouter)

        await fakeApp.listen(5002, () => {
            // console.log('not important - not used!!')
        })

        const response = fakeServer.simulate('GET', '/foo')

        // @ts-ignore just happens to have 'body'
        expect(response.body).to.containSubset({data: 'foo'})
    })
})
