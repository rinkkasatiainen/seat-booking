import process from 'process'
import {config} from 'dotenv'
import {Server} from './server'
import {AMQP_ENV, ENV, getVars} from './env-vars'
import {ExpressApp} from './delivery/express-app'
import {LogsData} from './logger'
import {AmqpConsumer} from './infra/amqp/consumer'
import {ActsAsServer} from './server/server'

const path = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path})
const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

const consoleLogger: LogsData = LogsData.console()

// @ts-ignore To be fixed by typing
const amqpVars: AMQP_ENV = envVars as unknown as AMQP_ENV
// const producer = async () => await AmqpProducer.of(amqpVars, 'amq.topic').start(amqp)
const startListener = async () => await AmqpConsumer.of(amqpVars, 'health-check')

const starter: Promise<ActsAsServer> =
    new Promise<ActsAsServer>((resolve, reject) => {
        startListener().then(listener => {
            const server: Promise<ActsAsServer> = Server.of(consoleLogger, listener, ExpressApp.app()).start(serverPort)
            resolve(server)
        }).catch(err => reject(err))
    })

export default starter
