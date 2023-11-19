import process from 'process'
import {config} from 'dotenv'
import Server, {ExpressApp} from './server'
import {Logger} from './logger'
import createPool from './infra/postgres-db'
import {ENV, getVars} from './env-vars'
import {wsServerB} from './infra/websocket/ws-server'
import createMQProducer from './infra/amqp/producer'

const path = (process.env.NODE_ENV === 'test' ? 'test.env' : 'variables.env')
config({path})
const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)


const consoleLogger: Logger = {
    log: console.log, /* eslint-disable-line  no-console */
    error: console.error, /* eslint-disable-line  no-console */
}


// @ts-ignore To be fixed by typing
const producer = async () => await createMQProducer(envVars, 'amq.topic')

const starter =
    new Server(consoleLogger, createPool(envVars), wsServerB(), producer, ExpressApp.of.bind(ExpressApp))
        .start(serverPort)


export default starter
