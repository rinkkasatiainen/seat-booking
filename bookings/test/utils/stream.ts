import {fail} from 'assert'
import {KnownEvents} from '../../src/domain/event'
import {CustomMatcher, Matches} from './matches'

export interface SpiesStuff {
    elements: () => unknown[];
}

export interface StreamSpy {
    ofType: (knownEvents: KnownEvents) => StreamSpy;
    withPayload: (key: string) => StreamSpy;
    matching: (matches: CustomMatcher) => StreamSpy;
    log: () => StreamSpy;
    waitUntilFound: (timeInSec: number) => Promise<void>;
}

export function noop(): void { /* noop */
}

const timer = (ms: number) => new Promise(res => setTimeout(res, ms))
type Logs = () => void;

export const createStreamSpy: <T extends SpiesStuff>(spy: T, filters: CustomMatcher[], logs: Logs) => StreamSpy =
    (spy, filters, logs = noop) => {

        const _streamSpy: StreamSpy = {
            ofType: (eventType) => createStreamSpy(spy, [...filters, Matches.ofType(eventType)], logs),
            withPayload: (key: string) => createStreamSpy(spy, [...filters, Matches.withPayload(key)], logs),
            matching: (filter: CustomMatcher) => createStreamSpy(spy, [...filters, filter], logs),
            waitUntilFound: async (timeInSec: number) => {
                // waitFor(timeInSec, () => {
                //     let elements = spy.elements()
                //     for (const filter of filters) {
                //         elements = elements.filter(filter.matches)
                //     }
                //     return elements.length > 0
                // })
                const timeInMs = timeInSec * 1000
                const waitTimeInMs = 300
                const loopAmount = Math.ceil(timeInMs / waitTimeInMs)
                for (let i = 0; i < loopAmount; i++) {
                    let elements = spy.elements()
                    for (const filter of filters) {
                        elements = elements.filter(filter.matches)
                    }
                    if (elements.length > 0) {
                        return
                    }
                    await timer(waitTimeInMs)
                }
                logs()
                fail(`Did not find, total amount of messages received is ${spy.elements().length}`)
            },
            log: () => {
                const f: Logs = () => {
                    console.log(`ELEMENTS: ${spy.elements().length}`)
                    console.log(spy.elements())
                }
                return createStreamSpy(spy, filters, f.bind(this))
            },
        }
        return _streamSpy
    }

export const streamSpy: (spy: SpiesStuff) => StreamSpy =
    spiesStuff => createStreamSpy(spiesStuff, [], noop)
