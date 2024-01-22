import {CustomMatcher, Matches} from "./matches";
import {KnownEvents} from "../../src/domain/event";
import {waitFor} from "./wait-for";

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

type Logs = () => void;

export const createStreamSpy: <T extends SpiesStuff>(spy: T, filters: CustomMatcher[], logs: Logs) => StreamSpy =
    (spy, filters, logs = noop) => {

        const _streamSpy: StreamSpy = {
            ofType: (eventType) => createStreamSpy(spy, [...filters, Matches.ofType(eventType)], logs),
            withPayload: (key: string) => createStreamSpy(spy, [...filters, Matches.withPayload(key)], logs),
            matching: (filter: CustomMatcher) => createStreamSpy(spy, [...filters, filter], logs),
            waitUntilFound: async (timeInSec: number) => {
                await waitFor(timeInSec, () => {
                    let elements = spy.elements()
                    for (const filter of filters) {
                        elements = elements.filter(filter.matches)
                    }
                    return elements.length > 0
                }, logs)
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