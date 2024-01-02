import {AMQP_ENV} from '../../env-vars'

type HealthCheckXC = 'health-check'
type HealthCheckRoutingKey = 'api' | 'bookings' | 'responses'

export type ExchangeName = `${HealthCheckXC}:${HealthCheckRoutingKey}`

function assertExists<T>(v: T | undefined): asserts v is T {
    if (v === undefined) {
        throw new Error('Unexpected undefined')
    }
}

export class XcTopic {
    constructor(public readonly exchangeName: string, public readonly routingKey: string) {
    }
}

export const parseExchangeName: (x: ExchangeName) => XcTopic = (value) => {
    const [exchangeName, routingKey] = value.split(':')
    assertExists(exchangeName)
    assertExists(routingKey)
    return new XcTopic(exchangeName, routingKey)
}

export const createAmqpUrl: (envvars: AMQP_ENV) => string =
    envvars => `amqp://${envvars.AMQP_HOST}/${envvars.AMQP_VHOST}`
