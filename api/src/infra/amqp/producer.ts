import {Channel, Connection, Replies} from 'amqplib/callback_api'
import {credentials} from 'amqplib'
import {Options} from 'amqplib/properties'
import {AMQP_ENV} from '../../env-vars'
import {SendsMessages} from '../../server'
import {DomainEvent} from '../../domain/event'
import {TrackedMessage} from '../../domain/tracked-message'
import {createAmqpUrl, ExchangeName, parseExchangeName} from './url'

function noop() {/**/
}

export interface ActsAsProducer {
    connect: (url: string, opts: unknown, callback: (errorConnect: Error, connection: Connection) => void) => void;
}

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

export class AmqpProducer {
    public static of(envvars: AMQP_ENV, exchange: ExchangeName): {
        start: (_amqp: ActsAsProducer) => Promise<SendsMessages>;
    } {
        const topic = parseExchangeName(exchange)
        return this.Builder(envvars, topic.exchangeName, topic.routingKey)
    }

    public static createNull(spiedBroadcast?: DomainEvent[]): SendsMessages {
        return {
            close: noop,
            send: (msg) => {
                if (spiedBroadcast) {
                    spiedBroadcast.push( msg.data)
                }
            },
        }
    }

    private static Builder(envvars: AMQP_ENV, exchangeName: string, routingKey: string) {
        return {
            start: async (_amqp: ActsAsProducer): Promise<SendsMessages> => {
                const url = createAmqpUrl(envvars)
                const opt = {credentials: credentials.plain(envvars.AMQP_USERNAME, envvars.AMQP_PASSWORD)}
                const p: SendsMessages = await new Promise(
                    (res, reject) => {
                        _amqp.connect(url, opt, (errorConnect: Error, connection: Connection) => {
                            if (errorConnect) {
                                reject(errorConnect)
                            }

                            createChannel(connection).then(channel => {
                                const producer: SendsMessages = {
                                    send: (msg: TrackedMessage<DomainEvent>) => {
                                        channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)))
                                    },
                                    close: () => {
                                        channel.close((err) => {
                                            reject(err)
                                        })
                                        connection.close()
                                    },
                                }
                                res(producer)
                            }).catch(err => {
                                reject(err)
                            })
                        })
                    }
                )
                return p
            },
        }
    }
}
