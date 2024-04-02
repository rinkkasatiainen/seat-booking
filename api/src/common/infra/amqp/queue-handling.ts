import {Channel, Connection, Replies} from 'amqplib/callback_api'
import {Options} from 'amqplib/properties'

export function createChannel(connection: Connection): Promise<Channel> {
    return new Promise((res, rej) => {
        connection.createChannel((errorChannel, channel) => {
            if (errorChannel) {
                rej(errorChannel)
            }

            res(channel)
        })
    })
}

export function assertQueue(ch: Channel, queue: string, opts: Options.AssertQueue,): Promise<Replies.AssertQueue> {
    return new Promise((res, rej) => {
        ch.assertQueue(queue, opts, (err, q) => {
            if (err) {
                rej(err)
            }
            res(q)
        })
    })
}

export function bindQueue(ch: Channel, queue: Replies.AssertQueue, topic: string, pattern: string): Promise<void> {
    return new Promise((res, rej) => {
        ch.bindQueue(queue.queue, topic, pattern, undefined, (errBind) => {
            if (errBind) {
                rej(errBind)
            }
            res()
        })
    })
}
