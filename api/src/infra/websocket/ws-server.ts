import {IncomingMessage} from 'http'
import internal from 'stream'
import * as console from 'console'
import ws from 'ws'
import WebSocket from 'ws'
import {connectedToWS, DomainEvent} from '../../domain/event'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

type WsInstanceType = InstanceType<typeof ws.WebSocket>
type WsIncomingMessage = InstanceType<typeof IncomingMessage>

export interface ActsAsWebSocketServer {
    broadcast: (data: DomainEvent) => number;
    handleUpgrade: (request: WsIncomingMessage,
                    socket: internal.Duplex,
                    head: Buffer) => void;
    close: (cb?: (err?: Error) => void) => void;
}

export class WsServer implements ActsAsWebSocketServer {
    public readonly clients: Set<WsInstanceType>

    constructor(private readonly wsServer: ws.Server) {
        this.clients = wsServer.clients
    }

    public broadcast(data: DomainEvent): number {
        this.wsServer.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data))
            }
        })
        return this.wsServer.clients.size
    }

    public close(cb: ((err?: Error) => void) | undefined): void {
        for (const client of this.wsServer.clients) {
            client.close()
        }
        return this.wsServer.close(cb)
    }

    public emit(event: 'connection', webSocket: WebSocket.WebSocket, rq: WsIncomingMessage): boolean {
        return this.wsServer.emit(event, webSocket, rq)
    }

    public handleUpgrade(
        request: WsIncomingMessage,
        socket: internal.Duplex,
        head: Buffer): void {
        this.wsServer.handleUpgrade(request, socket, head, (webSocket) => {
            this.wsServer.emit('connection', webSocket, request)
        })
    }

    public static of(): ActsAsWebSocketServer {
        const _wsServer = new ws.Server({noServer: true})
        _wsServer.on('connection', socket => {
            socket.on('message', (/* _message*/) => {
                // eslint-disable-next-line no-console
                console.log('did receive incoming message from WS.')
            })
            socket.send(JSON.stringify(connectedToWS('Hello from WebSocket!')))
        })

        return new WsServer(_wsServer)
    }

    public static createNull(): ActsAsWebSocketServer {
        const fake: ActsAsWebSocketServer = {
            broadcast(/* _data: DomainEvent*/): number {
                return 0
            },
            handleUpgrade: noop,
            close: (cb) => {
                if (cb) {
                    cb()
                }
            },
        }
        return fake
    }

}

export const wsServerB: () => ActsAsWebSocketServer = () => WsServer.of()
