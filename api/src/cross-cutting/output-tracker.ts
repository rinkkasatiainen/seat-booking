import {TrackedEvent, TracksMessages} from './tracks-requests'

export class OutputTracker<T extends TrackedEvent<string>> {
    #data: T[] // variables starting with # are private in JS/TS

    constructor(private readonly tracksMessages: TracksMessages<T>, private readonly event: string) {
        this.#data = []
        this.tracksMessages.on(this.event, (data: T) => {
            this.#data.push(data)
        })
    }

    public data(): T[] {
        return this.#data
    }

    public static create<C extends TrackedEvent<string>>(
        _eventEmitter: TracksMessages<C>, event: string): OutputTracker<C> {
        return new OutputTracker<C>(_eventEmitter, event)
    }
}
