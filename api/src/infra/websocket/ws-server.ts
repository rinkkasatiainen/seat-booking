import {IncomingMessage} from 'http'
import internal from 'stream'
import * as console from 'console'
import ws from 'ws'
import WebSocket from 'ws'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(){
}

type WsInstanceType = InstanceType<typeof ws.WebSocket>
type WsIncomingMessage = InstanceType<typeof IncomingMessage>

export interface ActsAsWebSocketServer {
    clients: Set<WsInstanceType>;
    on: (event: 'connection', cb: (webSocket: ws.WebSocket) => void) => this;
    handleUpgrade:
        (request: WsIncomingMessage,
         socket: internal.Duplex,
         head: Buffer,
         cb: (client: WsInstanceType, rq: WsIncomingMessage) => void
        ) => void;
    emit: (event: 'connection', webSocket: ws.WebSocket, rq: WsIncomingMessage) => boolean;
    close: (cb?: (err?: Error) => void) => void;
}

export class WsServer implements ActsAsWebSocketServer{
    public readonly clients: Set<WsInstanceType>

    constructor(private readonly wsServer: ws.Server) {
        this.clients = wsServer.clients
    }



    public close(cb: ((err?: Error) => void) | undefined): void {
        return this.wsServer.close(cb)
    }

    public emit(event: 'connection', webSocket: WebSocket.WebSocket, rq: WsIncomingMessage): boolean {
        return this.wsServer.emit(event, webSocket, rq)
    }

    public handleUpgrade(
        request: WsIncomingMessage,
        socket: internal.Duplex,
        head: Buffer,
        cb: (client: WsInstanceType, rq: WsIncomingMessage) => void): void {
        return this.wsServer.handleUpgrade(request, socket, head, cb)
    }

    public on(event: 'connection', cb: (webSocket: WebSocket.WebSocket) => void): this {
        this.wsServer.on(event, cb)
        return this
    }

    public static of(): ActsAsWebSocketServer {
        const _wsServer = new ws.Server({noServer: true})
        _wsServer.on('connection', socket => {
            socket.on('message', _message => {
                // eslint-disable-next-line no-console
                console.log('did receive incoming message from WS.')
            })
        })
        return new WsServer(_wsServer)
    }

    public static createNull(): ActsAsWebSocketServer {
        const fake: ActsAsWebSocketServer = {
            clients: new Set<WsInstanceType>(),
            handleUpgrade: noop,
            emit: () => false,
            on: (_) => fake,
            close: (cb) => {
                if (cb){
                    cb()
                }
            },
        }
        return fake
    }

}

export const wsServerB = () => WsServer.of()
