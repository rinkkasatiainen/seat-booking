import {TrackedEvent} from '../../cross-cutting/tracks-requests'

// eslint-disable-next-line no-shadow
export const enum ExpressAppEventTypes {
    listen = 'listen',
    use = 'use',
    respond = 'respond',
}

export type ExpressEvents = keyof typeof ExpressAppEventTypes

export interface TrackedExpressAppEvent extends TrackedEvent<ExpressEvents> {
    type: ExpressEvents;
    args: unknown[];
}
