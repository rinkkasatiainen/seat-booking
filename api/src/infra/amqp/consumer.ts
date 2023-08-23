import amqp, {Message} from 'amqplib/callback_api'
import {AMQP_ENV} from '../../env-vars'
import {RabbitMQConsumer} from '../../server'
import {isDomainEvent} from '../../domain/event'
import {createAmqpUrl} from './url'


const createMQConsumer: (envVars: AMQP_ENV, queueName: string) => Promise<RabbitMQConsumer<JSONValue>> =
    async (envVars: AMQP_ENV, queueName: string) => {
        console.log('Connecting to RabbitMQ...')
        const amqpURl = createAmqpUrl(envVars)
        return await new Promise(res => amqp.connect(amqpURl, (errConn, conn) => {
            const r: RabbitMQConsumer<JSONValue> = {
                listen: (callback) => {
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
                                const parsed: unknown = JSON.parse(msg.content.toString())
                                if (isDomainEvent(parsed)){
                                    callback(parsed)
                                }
                            }
                        }, {noAck: true})
                    })
                },
                close: () => {
                    console.log('closing RabbitMQ connection')
                    conn.close()
                },
            }
            res(r)
        })
        )


    }


export default createMQConsumer
