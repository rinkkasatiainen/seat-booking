import process from 'process'
import {config} from 'dotenv'
import Server from './server'
import {Logger} from './logger'
import {createPool} from './infra/postgres-db'
import {AMQP_ENV, ENV, getVars} from './env-vars'
import {wsServerB} from './infra/websocket/ws-server'
import {ExpressApp} from './delivery/express-app'
import {AmqpProducer} from './common/infra/amqp/producer'
import {AmqpConsumer} from './common/infra/amqp/consumer'

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
const producer = async () => await AmqpProducer.of(amqpVars, 'health-check:api')
const listener = async () => await AmqpConsumer.of(amqpVars, 'health-check-api')
const healthCheckResponseSender = async () => await AmqpProducer.of(amqpVars, 'health-check:responses')
const healthCheckListener = async () => await AmqpConsumer.of(amqpVars, 'health-check-responses')

const starter =
    Promise.all([producer(), listener(), healthCheckResponseSender(), healthCheckListener()])
        .then(([prod, list, prod2, list2]) =>
            new Server(consoleLogger, createPool(envVars), wsServerB(), prod, list, prod2, list2, ExpressApp.app())
                .start(serverPort))

export default starter
