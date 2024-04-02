import process from 'process'
import {config} from 'dotenv'
import {Server} from './server'
import {AMQP_ENV, ENV, getVars} from './env-vars'
import {ExpressApp} from './delivery/express-app'
import {LogsData} from './logger'
import {AmqpConsumer} from './common/infra/amqp/consumer'
import {ActsAsServer} from './server/server'
import {AmqpProducer} from './common/infra/amqp/producer'

// configure
const path = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path})
const envVars: ENV = getVars()
// @ts-ignore To be fixed by typing
const amqpVars: AMQP_ENV = envVars as unknown as AMQP_ENV

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

const consoleLogger: LogsData = LogsData.console()

const producer = async () => await AmqpProducer.of(amqpVars, 'health-check:responses')
const startListener = async () => await AmqpConsumer.of(amqpVars, 'health-check-bookings')


const starter: Promise<ActsAsServer> =
    new Promise<ActsAsServer>((resolve, reject) => {
        startListener().then(listener => {
            producer().then(prod => {
                const server: Promise<ActsAsServer> =
                    Server.of(consoleLogger, listener, prod, ExpressApp.app()).start(serverPort)
                resolve(server)
            }).catch(err => reject(err))
        }).catch(err => reject(err))
    })

export default starter
