import chai from 'chai'
import chaiSubset from 'chai-subset'
import request from 'supertest'


const {expect} = chai
chai.use(chaiSubset)

describe('deployment', () => {
    const rq = request('http://localhost:4100')

    it('Should start server', async () => {
        await rq.get('/health/check')
            .expect(200)
            .expect((res => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(res.body.status).to.eql('ok')
            }))
    })
})
