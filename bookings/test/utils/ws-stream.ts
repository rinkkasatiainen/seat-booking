import WebSocket from 'ws'
import {DomainEvent, isDomainEvent} from '../../src/domain/event'
import {createStreamSpy, SpiesStuff, StreamSpy} from "./stream";
import {waitFor} from "./wait-for";

export interface WsSpy extends SpiesStuff {
    close: () => void;
}

export const asDomainEventOrNull: (data: Buffer | ArrayBuffer | Buffer[]) => DomainEvent | null = (data) => {
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

export const wsSpy: (port: number) => Promise<WsSpy> = async (port) => {
    const elements: unknown[] = []
    const wsClient: WebSocket = new WebSocket(`ws://localhost:${port}`)
    let connected = false
    wsClient.on('open', (/* _: WebSocket */): void => {
        wsClient.on('message', (data: WebSocket.RawData) => {
            elements.push(...[asDomainEventOrNull(data)].filter(v => v !== null))
        })
        connected = true
    })
    await waitFor(3, () => !!connected)
    return {
        elements: () => elements,
        close: () => {
            wsClient.close()
            wsClient.terminate()
        },
    }
}

const noop = () => {/* noop */}

export const wsStream: (spy: WsSpy) => StreamSpy =
    wsSpyPromise => createStreamSpy(wsSpyPromise, [], noop)
