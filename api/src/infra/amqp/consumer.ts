import amqp, {Message} from 'amqplib/callback_api'
import {AMQP_ENV} from '../../env-vars'
import {RabbitMQConsumer} from '../../server'
import {createAmqpUrl} from './url'


const createMQConsumer: (envVars: AMQP_ENV, queueName: string) => RabbitMQConsumer<JSONValue> =
    (envVars: AMQP_ENV, queueName: string) => {
        console.log('Connecting to RabbitMQ...')
        const amqpURl = createAmqpUrl(envVars)
        return (callback: (msg: JSONValue) => JSONValue) => {
            amqp.connect(amqpURl, (errConn, conn) => {
                if (errConn) {
                    throw errConn
                }
                conn.createChannel((errChan, chan) => {
                    if (errChan) {
                        throw errChan
                    }
                    console.log('Connected to RabbitMQ')
                    chan.assertQueue(queueName, {durable: true})
                    chan.consume(queueName, (msg: Message | null) => {
                        if (msg) {
                            const parsed: JSONValue = JSON.parse(msg.content.toString())
                            callback(parsed)
                        }
                    }, {noAck: true})
                })
            })
        }

    }


export default createMQConsumer
