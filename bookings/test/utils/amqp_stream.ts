import process from 'process'
import {config} from 'dotenv'
import amqp, {Channel, Connection, Message} from 'amqplib/callback_api'
import {MessageProperties} from 'amqplib'
import {AMQP_ENV, getVars} from '../../src/env-vars'
import {DomainEvent, isDomainEvent} from '../../src/domain/event'
import {createAmqpUrl, ExchangeName, parseExchangeName} from '../../src/common/infra/amqp/url'
import {isTracked, TrackedMessage} from '../../src/domain/tracked-message'
import {noop, SpiesStuff} from './stream'

/* eslint-disable no-console */

export type RabbitSpy = SpiesStuff & CanBeClosed

export const amqpMessageOf = (domainEvent: TrackedMessage<DomainEvent>): Message => ({
    content: Buffer.from(JSON.stringify(domainEvent), 'utf-8'),
    fields: {deliveryTag: 1, redelivered: false, exchange: 'any', routingKey: 'rt'},
    properties: {} as MessageProperties,
})

export interface CanBeClosed {
    close: () => void;
}

const envFile = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path: `${envFile}`})

export const rabbitSpy: (x: ExchangeName) => Promise<RabbitSpy> = async (topic) => {
    const t = parseExchangeName(topic)
    const elements: unknown[] = []

    const envVars: AMQP_ENV = getVars() as AMQP_ENV
    const url = createAmqpUrl(envVars)
    const closable = await new Promise<{ channel: Channel; conn: Connection }>((res, reject) => {

        amqp.connect(url, (errConn, conn) => {
            if (errConn) {
                reject(errConn)
            }

            conn.createChannel((err, channel) => {
                if (err) {
                    reject(err)
                }
                channel.assertQueue('bookings-testing-queue', {autoDelete: true}, (e, queue) => {
                    if (e) {
                        reject(e)
                    }

                    channel.bindQueue(queue.queue, t.exchangeName, t.routingKey, undefined, (errBind) => {
                        if (errBind) {
                            reject(errBind)
                        }

                        console.log('bindQueue', queue.queue, t.exchangeName, t.routingKey)

                        channel.consume(queue.queue, (msg: Message | null) => {
                            if (msg) {
                                const parsed: unknown = JSON.parse(msg.content.toString())
                                console.log('consume-messgage', queue.queue, parsed)
                                if (isTracked(isDomainEvent)(parsed)) {
                                    console.log('found message', queue.queue, parsed)
                                    elements.push(parsed.data)
                                }
                            }
                        })
                        res({channel, conn})

                    })
                })
            })

        })
    })
    console.log('created test spy')
    return {
        elements: () => elements,
        close: () => {
            console.log('closing channel')
            closable.channel.close(noop)
            console.log('closing connection')
            closable.conn.close(noop)
        },
    }
}



