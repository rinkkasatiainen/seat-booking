import process from 'process'

export interface PG_ENV {
    PG_HOST: string;
    PG_PORT: string;
    PG_USERNAME: string;
    PG_PASSWORD: string;
}

interface SERVER_ENV {
    SERVER_HOST: string;
    SERVER_PORT: string;
}

export interface AMQP_ENV {
    AMQP_USERNAME: string;
    AMQP_PASSWORD: string;
    AMQP_HOST: string;
    AMQP_VHOST: string;
    AMQP_HC_QUEUE: string;     // <queue:routing>
    AMQP_HC_EXCHANGE: string;  // <exchange:routing>
}

export type FULLENV = PG_ENV & SERVER_ENV & AMQP_ENV
type K = keyof FULLENV
export type ENV = Partial<FULLENV>
const envVarNames: K[] = [
    'PG_HOST', 'PG_PORT', 'PG_USERNAME', 'PG_PASSWORD',
    'SERVER_HOST', 'SERVER_PORT',
    'AMQP_HOST', 'AMQP_VHOST', 'AMQP_PASSWORD', 'AMQP_USERNAME', 'AMQP_HC_EXCHANGE', 'AMQP_HC_QUEUE']
type MapEnv<K_ extends keyof FULLENV, T extends FULLENV[K_]> = (key: K_) => T | undefined

export const getVars: () => ENV = () => {
    const getV: MapEnv<K, FULLENV[K]> = key => {
        const value = process.env[key]
        if (value) {
            const envValue = process.env[value]
            return envValue || value
        }
        return undefined
    }
    return envVarNames.reduce((prev: ENV, envVarName) => {
        const value = getV(envVarName)
        if (value) {
            prev[envVarName] = value
        }
        return prev
    }, {})
}
