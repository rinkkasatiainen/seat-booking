import {TrackedEvent} from '../../cross-cutting/tracks-requests'

// eslint-disable-next-line no-shadow
export const enum ExpressAppEventTypes2 {
    listen = 'listen',
    use = 'use',
    respond = 'respond',
}

// Wallaby likes this more than the use of enums.
export class ExpressAppEventTypes {
    public static listen = 'listen'
    public static use = 'use'
    public static respond = 'respond'
}

export type ExpressEvents = keyof typeof ExpressAppEventTypes

export interface TrackedExpressAppEvent extends TrackedEvent<ExpressEvents> {
    type: ExpressEvents;
    args: unknown[];
}
