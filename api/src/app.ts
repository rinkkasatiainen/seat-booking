import server from './server'
import {Logger} from './logger'
import {config} from "dotenv";
import createPool from "./infra/postgres-db";
import {ENV, getVars} from "./env-vars";
import process from "process";

const path = (process.env.NODE_ENV === "test" ? "test.env" : "variables.env");
config({path});
const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

console.log({envVars})

const consoleLogger: Logger = {
    log: console.log, /* eslint-disable-line  no-console */
    error: console.error, /* eslint-disable-line  no-console */
}

const starter = new server(consoleLogger, createPool(envVars)).start(serverPort)

export default starter
