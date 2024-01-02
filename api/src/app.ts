import process from 'process'
import {config} from 'dotenv'
import amqp from 'amqplib/callback_api'
import Server from './server'
import {Logger} from './logger'
import {createPool} from './infra/postgres-db'
import {AMQP_ENV, ENV, getVars} from './env-vars'
import {wsServerB} from './infra/websocket/ws-server'
import {AmqpProducer} from './infra/amqp/producer'
import {ExpressApp} from './delivery/express-app'
import {AmqpConsumer} from './infra/amqp/consumer'

const path = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path})
const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

const consoleLogger: Logger = {
    log: console.log, /* eslint-disable-line  no-console */
    error: console.error, /* eslint-disable-line  no-console */
}

// @ts-ignore To be fixed by typing
const amqpVars: AMQP_ENV = envVars
const producer = async () => await AmqpProducer.of(amqpVars, 'health-check:api').start(amqp)
const listener = async () => await AmqpConsumer.of(amqpVars, 'health-check-api').start(amqp)

const starter =
    Promise.all([producer(), listener()]).then(([prod, list]) =>
        new Server(consoleLogger, createPool(envVars), wsServerB(), prod, list, ExpressApp.app())
            .start(serverPort))

export default starter
