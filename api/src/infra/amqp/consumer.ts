import * as console from 'console'
import {Channel, Connection, Message} from 'amqplib/callback_api'
import {AMQP_ENV} from '../../env-vars'
import {ListenesMessages} from '../../server'
import {DomainEvent, isDomainEvent} from '../../domain/event'
import {createAmqpUrl} from './url'
import {assertQueue, createChannel} from './producer'

export interface ActsAsConsumer {
    connect: (url: string, callback: (errorConnect: Error, connection: Connection) => void) => void;
}

function noop() {/* ?*/
}

export class AmqpConsumer {

    public static of(envVars: AMQP_ENV, queueName: string): {
        start: (a: ActsAsConsumer) => Promise<ListenesMessages>;
    } {
        const url = createAmqpUrl(envVars)
        return {
            start: async (_amqp) => {
                const closable = await new Promise<{ channel: Channel; conn: Connection }>((res, reject) => {
                    _amqp.connect(url, (errConn, conn) => {
                        if (errConn) {
                            reject(errConn)
                        }

                        createChannel(conn).then(channel => {
                            assertQueue(channel, queueName, {autoDelete: false}).then(amqpQueue => {
                                channel.bindQueue(amqpQueue.queue, 'amq.topic', '#', undefined, (errBind) => {
                                    if (errBind) {
                                        reject(errBind)
                                    }

                                    res({channel, conn})
                                })
                            }).catch(err => reject(err))
                        }).catch(err => reject(err))
                    })
                })

                return {
                    onMessage(cb): void {
                        closable.channel.consume(queueName, (msg: Message | null) => {
                            if (msg) {
                                closable.channel.ack(msg)
                                const parsed: unknown = JSON.parse(msg.content.toString())
                                if (isDomainEvent(parsed)) {
                                    cb(parsed)
                                }
                            }
                        })

                    },
                    close: () => {
                        closable.channel.close(err => {
                            console.error('could not close channel', err)
                        })
                        closable.conn.close()
                    },
                }

            },
        }
    }

    public static createNull(callback?: () => DomainEvent): ListenesMessages {
        return {
            close: noop,
            onMessage: (fn) => {
                if (callback) {
                    fn(callback())
                }
            },
        }
    }
}


