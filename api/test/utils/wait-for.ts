import {fail} from 'assert'

export const waitFor: (timeInSec: number, cb: () => boolean) => Promise<void> = async (timeInSec, cb) => {
    const timeInMs = timeInSec * 1000
    const waitTimeInMs = 300
    const loopAmount = Math.ceil(timeInMs / waitTimeInMs)
    for (let i = 0; i < loopAmount; i++) {
        if (cb()) {
            return
        }
        await timer(waitTimeInMs)
    }
    fail(`Did not find in time ${timeInSec} seconds`)
}
const timer = (ms: number) => new Promise(res => setTimeout(res, ms))
