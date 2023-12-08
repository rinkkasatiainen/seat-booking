import {TrackedEvent} from '../delivery/express-app'

export interface ExpressAppEvents extends TrackedEvent<'listen' | 'use'> {
    type: 'listen' | 'use';
    args: unknown[];
}
