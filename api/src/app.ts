import server from './server'
import {Logger} from './logger'
import {config} from "dotenv";
import * as process from "process";
import createPool from "./infra/postgres-db";

export interface PG_ENV {
    PG_HOST: string
    PG_PORT: string
    PG_USERNAME: string
    PG_PASSWORD: string
}

interface SERVER_ENV {
    SERVER_HOST: string
    SERVER_PORT: string
}

export type FULLENV = PG_ENV & SERVER_ENV

type K = keyof FULLENV


export type ENV = Partial<FULLENV>
const path = (process.env.NODE_ENV === "test" ? "test.env" : "variables.env");
config({path});

const envVarNames: K[] = ['PG_HOST', 'PG_PORT', 'PG_USERNAME', 'PG_PASSWORD', 'SERVER_HOST', 'SERVER_PORT', 'PG_PORT']

type MapEnv<K extends keyof FULLENV, T extends FULLENV[K]> = (key: K) => T | undefined
const getVars: () => ENV = () => {
    const getV: MapEnv<K, FULLENV[K]> = key => {
        const value = process.env[key]
        if (!!value) {
            const envValue = process.env[value]
            return envValue || value
        }
        return undefined
    }
    return envVarNames.reduce((prev: ENV, envVarName) => {
        const value = getV(envVarName)
        if (!!value) {
            prev[envVarName] = value
        }
        return prev
    }, {})
}

const envVars: ENV = getVars()

const serverPort = parseInt(envVars.SERVER_PORT || '4000', 10)

const consoleLogger: Logger = {
    log: console.log, /* eslint-disable-line  no-console */
    error: console.error, /* eslint-disable-line  no-console */
}

const starter = new server(consoleLogger, createPool(envVars)).start(serverPort)
    .then((port: number) => consoleLogger.log(`Running on port ${port}`))
    .catch((error: Error) => {
        consoleLogger.error(error)
    })

export default starter
