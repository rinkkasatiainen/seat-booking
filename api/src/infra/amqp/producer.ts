import {Channel, Connection} from 'amqplib/callback_api'
import {credentials} from 'amqplib'
import {AMQP_ENV} from '../../env-vars'
import {SendsMessages} from '../../server'
import {DomainEvent} from '../../domain/event'
import {createAmqpUrl} from './url'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

export interface ActsAsProducer {
    connect: (url: string, opts: unknown, callback: (errorConnect: Error, connection: Connection) => void) => void;
}

function createChannel(connection: Connection): Promise<Channel> {
    return new Promise((res, rej) => {
        connection.createChannel((errorChannel, channel) => {
            if (errorChannel) {
                rej(errorChannel)
            }

            res(channel)
        })
    })
}

export class AmqpProducer {
    public static of(envvars: AMQP_ENV, exchangeName: string): {
        start: (_amqp: ActsAsProducer) => Promise<SendsMessages>;
    } {
        return this.Builder(envvars, exchangeName)
    }

    public static createNull(): SendsMessages {
        return {
            close: noop,
            send: noop,
        }
    }

    private static Builder(envvars: AMQP_ENV, exchangeName: string) {
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
                                    send: (msg: DomainEvent) => {
                                        channel.publish(exchangeName, 'msg', Buffer.from(JSON.stringify(msg)))
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
