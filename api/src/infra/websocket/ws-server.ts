import ws from 'ws'

// Set up a headless websocket server that prints any
// events that come in.
export const wsServer = new ws.Server({noServer: true})
console.log('create WS server')
wsServer.on('connection', socket => {
    socket.on('message', message => {
        // do magic
        console.log('received:' , message)
    })
})
