import {knownEvents} from './known-events'

export type KnownEvents = keyof typeof knownEvents

export type AnyDomainEvent = KnownEvents

export interface DomainEvent {
    __type: string;
}

export interface KnownDomainEvent<T extends KnownEvents>  extends DomainEvent {
    __type: T;
}

export interface HealthCheck extends KnownDomainEvent<'HealthCheck'> {
    __type: 'HealthCheck';
    ws: { status: string };
    amqp: { status: string };
    message: string;
}
const isObject = (x: unknown): x is { [key: string]: unknown } => typeof x === 'object' && x !== null

export function isDomainEvent(x: unknown): x is DomainEvent {
    return isObject(x) &&
        '__type' in x && typeof x.__type === 'string' &&
        x.__type in knownEvents
}

export function isHealthCheck(x: DomainEvent): x is HealthCheck {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDomainEvent(x) && x.__type === knownEvents.HealthCheck
}

export const healthCheck: (msg: string) => HealthCheck = message => ({
    __type: 'HealthCheck',
    ws: {status: 'unknown'},
    amqp: {status: 'unknown'},
    message,
})
export const connectedToWS: (msg: string) => HealthCheck = message => ({
    __type: 'HealthCheck',
    ws: {status: 'connected'},
    amqp: {status: 'unknown'},
    message,
})
