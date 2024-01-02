import {TrackedEvent} from '../cross-cutting/tracks-requests'

// This is a bug in es-lint
// eslint-disable-next-line no-shadow
export const enum AmqpEventTypes {
    listen = 'listen',
    broadcast = 'broadcast',
    events = 'events',
    error = 'error',
}

export type AmqpEvents = keyof typeof AmqpEventTypes
// export type AmqpEvents = AmqpEventTypes

export interface TrackedAmqpEvent extends TrackedEvent<AmqpEvents> {
    type: AmqpEvents;
    args: unknown[];
}

const createEvent: (x: AmqpEvents) => (args: unknown[]) => TrackedAmqpEvent = type => args => ({type, args})

export const broadcastEvent: (args: unknown[]) => TrackedAmqpEvent = createEvent(AmqpEventTypes.broadcast)
export const errorEvent: (args: unknown[]) => TrackedAmqpEvent = createEvent(AmqpEventTypes.error)
export const generalEvent: (args: unknown[]) => TrackedAmqpEvent = createEvent(AmqpEventTypes.events)
