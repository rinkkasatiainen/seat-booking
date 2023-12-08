import process from 'process'
import {config} from 'dotenv'
import {Server} from './server'
import {ENV, getVars} from './env-vars'
import {ExpressApp} from './delivery/express-app'
import {LogsData} from './logger'

const path = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path})
const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

const consoleLogger: LogsData = LogsData.console()

// @ts-ignore To be fixed by typing
// const amqpVars: AMQP_ENV = envVars
// const producer = async () => await AmqpProducer.of(amqpVars, 'amq.topic').start(amqp)
// const listener = async () => await AmqpConsumer.of(amqpVars, 'health-check').start(amqp)

const starter =
    Server.of(consoleLogger, ExpressApp.app()).start(serverPort)

export default starter
