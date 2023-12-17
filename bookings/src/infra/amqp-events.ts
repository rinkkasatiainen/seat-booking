import {TrackedEvent} from '../cross-cutting/tracks-requests'

// eslint-disable-next-line no-shadow
export const enum AmqpEventTypes {
    listen = 'listen',
}

export type AmqpEvents = keyof typeof AmqpEventTypes

export interface TrackedAmqpEvent extends TrackedEvent<AmqpEvents> {
    type: AmqpEvents;
    args: unknown[];
}
