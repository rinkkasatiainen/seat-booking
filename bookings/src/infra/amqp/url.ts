import {AMQP_ENV} from '../../env-vars'

export const createAmqpUrl: (envvars: AMQP_ENV) => string =
    envvars => `amqp://${envvars.AMQP_HOST}/${envvars.AMQP_VHOST}`
