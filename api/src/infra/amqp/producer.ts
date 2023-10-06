import amqp, {Connection} from 'amqplib/callback_api'
import {credentials} from 'amqplib'
import {AMQP_ENV} from '../../env-vars'
import {RabbitMQProducer} from '../../server'
import {DomainEvent} from '../../domain/event'
import {createAmqpUrl} from './url'

const createMQProducer: (envVars: AMQP_ENV, queueName: string) => Promise<RabbitMQProducer> =
    async (envvars, queueName) => {
        console.log(' to RabbitMQ...')
        const url = createAmqpUrl(envvars)
        let ch: any
        const opt = { credentials: credentials.plain(envvars.AMQP_USERNAME, envvars.AMQP_PASSWORD) }
        const p: RabbitMQProducer = await new Promise(
            res => {
                amqp.connect(url, opt, (errorConnect: Error, connection: Connection) => {
                    if (errorConnect) {
                        console.log('Error connecting to RabbitMQ: ', errorConnect)
                        return
                    }

                    connection.createChannel((errorChannel, channel) => {
                        if (errorChannel) {
                            console.log('Error creating channel: ', errorChannel)
                            return
                        }

                        ch = channel
                        console.log('Connected to RabbitMQ')
                    })

                    const producer: RabbitMQProducer = {
                        send: (msg: DomainEvent) => {
                            console.log(`Produce message to RabbitMQ... ${JSON.stringify(msg)}`)
                            ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)))
                        },
                        close: () => connection.close(),
                    }
                    res(producer)
                })
            }
        )

        return p
    }

export default createMQProducer
