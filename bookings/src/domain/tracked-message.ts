import {v4 as uuidv4} from 'uuid'
import {knownEvents} from './known-events'
import {DomainEvent} from './event'

export interface TrackedMessage<T> {
    uuid: string;
    data: T;
}

export function isDomainEvent(x: unknown): x is DomainEvent {
    return isObject(x) &&
        '__type' in x && typeof x.__type === 'string' &&
        x.__type in knownEvents
}

export function trackDomainMessage<T extends DomainEvent>(data: T): TrackedMessage<T> {
    return {
        uuid: uuidv4(), data,
    }
}

function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null
}

function objectKeysMatchExpected( x: object): x is TrackedMessage<unknown>{
    const trackedMessageKeys = ['uuid', 'data']
    const objectKeys = Object.keys(x)
    return objectKeys.length === trackedMessageKeys.length && objectKeys.every(function(value, index) {
        return value === trackedMessageKeys[index]
    })
}

export function isTracked<T>(fn: (x: unknown) => x is T): (value: unknown) => value is TrackedMessage<T> {
    return (value): value is TrackedMessage<T> => {
        if (isObject(value)) {
            if (objectKeysMatchExpected(value) ) {
                return  fn(value.data)
            }
        }
        return false
    }
}
