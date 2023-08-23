import console from 'console'
import {fail} from 'assert'
import WebSocket from 'ws'
import {DomainEvent, isDomainEvent, KnownEvents} from '../../src/domain/event'

interface CustomMatcher {
    matches: (data: unknown) => boolean;
}

interface WsStreamSpy {
    ofType: (knownEvents: KnownEvents) => WsStreamSpy;
    withPayload: (key: string) => WsStreamSpy;
    matching: (matches: CustomMatcher) => WsStreamSpy;
    waitUntilFound: (timeInSec: number) => Promise<void>;
}

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


export class Matches {

    public static ofType(knownEvent: KnownEvents): CustomMatcher {
        return {
            matches: (data: unknown) => isDomainEvent(data) && data.__type === knownEvent,
        }
    }

    public static withPayload(key: string): CustomMatcher {
        return {matches: (data: unknown) => isDomainEvent(data) && key in data}
    }

    public static toSubset(supSet: X) {
        // @ts-ignore
        return {matches: (data: unknown) => !!data && isSubset(data, supSet)}
    }
}

const timer = (ms: number) => new Promise(res => setTimeout(res, ms))

const createWsStream: (spy: WsSpy, filters: CustomMatcher[]) => WsStreamSpy = (spy, filters) => {

    const wsStreamSpy: WsStreamSpy = {
        ofType: (eventType) => createWsStream(spy, [...filters, Matches.ofType(eventType)]),
        withPayload: (key: string) => createWsStream(spy, [...filters, Matches.withPayload(key)]),
        matching: (filter: CustomMatcher) => createWsStream(spy, [...filters, filter]),
        waitUntilFound: async (timeInSec: number) => {
            await waitFor(timeInSec, () => {
                let elements = spy.elements()
                for (const filter of filters) {
                    elements = elements.filter(filter.matches)
                }
                return elements.length > 0
            })
        },
    }
    return wsStreamSpy
}

interface WsSpy {
    elements: () => unknown[];
}

const waitFor: (timeInSec: number, cb: () => boolean) => Promise<void> = async (timeInSec, cb) => {
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

const asDomainEventOrNull: (data: Buffer | ArrayBuffer | Buffer[]) => DomainEvent | null = (data) => {
    let jsonData = null
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const str = data.toString()
    try {
        const asJson: unknown = JSON.parse(str)
        if (isDomainEvent(asJson)) {
            jsonData = asJson
        }
    } catch (e) {
        /* noop*/
    }
    return jsonData
}

const wsSpy: () => Promise<WsSpy> = async () => {
    const elements: unknown[] = []
    const wsClient: WebSocket = new WebSocket('ws://localhost:4001')
    let connected = false
    wsClient.on('open', (_: WebSocket) => {
        wsClient.on('message', (data: WebSocket.RawData) => {
            elements.push(...[asDomainEventOrNull(data)].filter(v => v !== null))
        })
        connected = true
        console.log('opened connection')
    })
    await waitFor(3, () => !!connected)
    return {
        elements: () => elements,
    }
}
export const wsStream: () => Promise<WsStreamSpy> = async () => createWsStream(await wsSpy(), [])
