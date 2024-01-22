import {fail} from 'assert'

const noop = () => { /* noop */
}

export const waitFor: (timeInSec: number, cb: () => boolean, onError?: () => void) => Promise<void> =
    async (timeInSec, cb, onError = noop) => {
        const timeInMs = timeInSec * 1000
        const waitTimeInMs = 300
        const loopAmount = Math.ceil(timeInMs / waitTimeInMs)
        for (let i = 0; i < loopAmount; i++) {
            if (cb()) {
                return
            }
            await timer(waitTimeInMs)
        }
        onError()
        fail(`Did not find in time ${timeInSec} seconds`)
    }
const timer = (ms: number) => new Promise(res => setTimeout(res, ms))
