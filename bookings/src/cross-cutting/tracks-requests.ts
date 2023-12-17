import EventEmitter from 'events'
import {OutputTracker} from './output-tracker'

export interface TrackedEvent<T extends string> {
    type: T;
}

export interface CanTrackMessages<K extends string> {
    trackRequests: () => OutputTracker<TrackedEvent<K>>;
}

export class TracksMessages<T extends TrackedEvent<string>> {
    private readonly eventEmitter: EventEmitter

    constructor() {
        this.eventEmitter = new EventEmitter()
    }

    public eventHappened(name: string, event: T): void {
        this.eventEmitter.emit(name, event)
    }

    public on(event: string, callback: (data: T) => void): void {
        this.eventEmitter.on(event, callback)
    }
}
