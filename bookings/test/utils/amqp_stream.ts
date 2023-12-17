import {fail} from 'assert'
import process from 'process'
import {config} from 'dotenv'
import amqp, {Channel, Connection, Message} from 'amqplib/callback_api'
import {MessageProperties} from 'amqplib'
import {AMQP_ENV, getVars} from '../../src/env-vars'
import {DomainEvent, isDomainEvent, KnownEvents} from '../../src/domain/event'
import {createAmqpUrl} from '../../src/infra/amqp/url'
import {CustomMatcher, Matches} from './matches'

/* eslint-disable no-console */

export interface SpiesStuff {
    elements: () => unknown[];
}

export interface StreamSpy {
    ofType: (knownEvents: KnownEvents) => StreamSpy;
    withPayload: (key: string) => StreamSpy;
    matching: (matches: CustomMatcher) => StreamSpy;
    waitUntilFound: (timeInSec: number) => Promise<void>;
}

function noop(): void { /* noop */ }
const timer = (ms: number) => new Promise(res => setTimeout(res, ms))
export type RabbitSpy = SpiesStuff & CanBeClosed

export const amqpMessageOf = (domainEvent: DomainEvent): Message => ({
    content: Buffer.from(JSON.stringify(domainEvent), 'utf-8'),
    fields: {deliveryTag: 1, redelivered: false, exchange: 'any', routingKey: 'rt'},
    properties: {} as MessageProperties,
})


const createStreamSpy: <T extends SpiesStuff>(spy: T, filters: CustomMatcher[]) => StreamSpy = (spy, filters) => {

    const _streamSpy: StreamSpy = {
        ofType: (eventType) => createStreamSpy(spy, [...filters, Matches.ofType(eventType)]),
        withPayload: (key: string) => createStreamSpy(spy, [...filters, Matches.withPayload(key)]),
        matching: (filter: CustomMatcher) => createStreamSpy(spy, [...filters, filter]),
        waitUntilFound: async (timeInSec: number) => {
            const timeInMs = timeInSec * 1000
            const waitTimeInMs = 300
            const loopAmount = Math.ceil(timeInMs / waitTimeInMs)
            for (let i = 0; i < loopAmount; i++) {
                let elements = spy.elements()
                for (const filter of filters) {
                    elements = elements.filter(filter.matches)
                }
                if (elements.length > 0) {
                    return
                }
                await timer(loopAmount)
            }
            fail('Did not find')
        },
    }
    return _streamSpy
}
export const streamSpy: (spy: SpiesStuff) => StreamSpy =
    spiesStuff=> createStreamSpy(spiesStuff, [])

export interface CanBeClosed {
    close: () => void;
}

const envFile = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path: `${envFile}`})

export const rabbitSpy: () => Promise<RabbitSpy> = async () => {
    const elements: unknown[] = []

    const envVars: AMQP_ENV = getVars() as AMQP_ENV
    const url = createAmqpUrl(envVars)
    const closable = await new Promise<{channel: Channel; conn: Connection}>((res, reject) => {

        amqp.connect(url, (errConn, conn) => {
            if (errConn) {
                reject(errConn)
            }

            conn.createChannel((err, channel) => {
                if(err){
                    reject(err)
                }
                channel.assertQueue('testing-queue', {autoDelete: true}, (e, queue) => {
                    if (e) {
                        reject(e)
                    }

                    channel.bindQueue(queue.queue, 'amq.topic', '#', undefined, (errBind) => {
                        if (errBind) {
                            reject(errBind)
                        }

                        channel.consume(queue.queue, (msg: Message | null) => {
                            if (msg) {
                                const parsed: unknown = JSON.parse(msg.content.toString())
                                if (isDomainEvent(parsed)) {
                                    elements.push(parsed)
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



