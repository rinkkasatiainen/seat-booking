import amqp, {Connection} from 'amqplib/callback_api'
import {credentials} from 'amqplib'
import {AMQP_ENV} from '../../env-vars'
import {createAmqpUrl} from './url'

const createMQProducer: (envVars: AMQP_ENV, queueName: string) => (msg: string) => void =
    (envvars, queueName) => {
        console.log(' to RabbitMQ...')
        const url = createAmqpUrl(envvars)
        let ch: any
        const opt = { credentials: credentials.plain(envvars.AMQP_USERNAME, envvars.AMQP_PASSWORD) }
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
        })
        return (msg: string) => {
            console.log('Produce message to RabbitMQ...')
            ch.sendToQueue(queueName, Buffer.from(msg))
        }
    }

export default createMQProducer
