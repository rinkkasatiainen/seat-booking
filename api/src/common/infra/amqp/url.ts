import {AMQP_ENV} from '../../../env-vars'

// eslint-disable-next-line no-shadow
enum Xc {
    ['health-check'] = 'health-check'
}

// eslint-disable-next-line no-shadow
enum RK {
    ['api'] = 'api',
    ['bookings'] = 'bookings',
    ['responses'] = 'responses'
}

type HealthCheckXC = keyof typeof Xc
type HealthCheckRoutingKey = keyof typeof RK

export type ExchangeName = `${HealthCheckXC}:${HealthCheckRoutingKey}`

function assertExists<T>(v: T | undefined): asserts v is T {
    if (v === undefined) {
        throw new Error('Unexpected undefined')
    }
}

function isValidXc(v: string): v is Xc {
    // @ts-ignore This is a guard, part of the deal
    return !!Xc[v]
}
function isValidRK(v: string): v is Xc {
    // @ts-ignore This is a guard, part of the deal
    return !!RK[v]
}

function assertsType<T extends V, V extends string>(pred: (v1: V) => boolean, v: V): asserts v is T {
    if (!pred(v)){
        throw new Error('unknown type')
    }
}

export class XcTopic {
    constructor(public readonly exchangeName: HealthCheckXC, public readonly routingKey: HealthCheckRoutingKey) {
    }
}

export const parseExchangeName: (x: ExchangeName) => XcTopic = (value) => {
    const [exchangeName, routingKey] = value.split(':')
    assertExists(exchangeName)
    assertExists(routingKey)
    assertsType<Xc, string>(isValidXc, exchangeName)
    assertsType<RK, string>(isValidRK, routingKey)

    return new XcTopic(exchangeName, routingKey)
}

export const createAmqpUrl: (envvars: AMQP_ENV) => string =
    envvars => `amqp://${envvars.AMQP_HOST}/${envvars.AMQP_VHOST}`
