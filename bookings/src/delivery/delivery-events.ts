import {TrackedEvent} from '../cross-cutting/tracks-requests'

// This is a bug in es-lint
export const enum DeliveryEventTypes { // eslint-disable-line no-shadow
    response = 'response',
}

export type DeliveryEvents = keyof typeof DeliveryEventTypes

export interface TrackedDeliveryEvents extends TrackedEvent<DeliveryEvents> {
    type: DeliveryEvents;
    args: unknown[];
}

