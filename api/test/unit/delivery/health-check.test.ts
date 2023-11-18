import chai from 'chai'
import chaiSubset from 'chai-subset'

const {expect} = chai
chai.use(chaiSubset)


const timer = (ms: number) => new Promise(res => setTimeout(res, ms))

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

    it('Should start server', async () => {
        await timer(1)
        expect(true).to.eql(false)
    })

    it('should be able to send a health/check and return response on websocket',  () => {
    })

    it('should be able to send a health/check and post that on AMQP.', () => {
    })
})

