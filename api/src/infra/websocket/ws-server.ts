import {IncomingMessage} from 'http'
import internal from 'stream'
import * as console from 'console'
import ws from 'ws'
import WebSocket from 'ws'
import {connectedToWS, DomainEvent} from '../../domain/event'

function noop() { /**/ }

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

    public handleUpgrade(
        request: WsIncomingMessage,
        socket: internal.Duplex,
        head: Buffer): void {
        this.wsServer.handleUpgrade(request, socket, head, (webSocket) => {
            this.wsServer.emit('connection', webSocket, request)
        })
    }

    public close(cb: ((err?: Error) => void) | undefined): void {
        for (const client of this.wsServer.clients) {
            client.close()
        }
        return this.wsServer.close(cb)
    }

    public static of(): ActsAsWebSocketServer {
        const _wsServer = new ws.Server({noServer: true})
        _wsServer.on('connection', socket => {
            socket.on('message', (/* _message*/) => {
                // eslint-disable-next-line no-console
                console.log('did receive incoming message from WS.')
            })
            socket.send(JSON.stringify(connectedToWS('Hello from WebSocket!')))
            // socket.on('close', () => {
            //     console.log('Closing socket connection', _wsServer.clients.size)
            // })
        })

        return new WsServer(_wsServer)
    }

    public static createNull(spiedBroadcast?: DomainEvent[]): ActsAsWebSocketServer {
        const fake: ActsAsWebSocketServer = {
            broadcast( data: DomainEvent): number {
                if(spiedBroadcast){
                    spiedBroadcast.push(data)
                }
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
