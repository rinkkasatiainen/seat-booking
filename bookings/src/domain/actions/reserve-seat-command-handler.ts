// eslint-disable-next-line max-classes-per-file
import {ListenesMessages} from '../../server'
import {DomainCommand} from '../event'
import {CanTrackMessages, TrackedEvent, TracksMessages} from '../../cross-cutting/tracks-requests'
import {knownCommands} from '../known-commands'
import {OutputTracker} from '../../cross-cutting/output-tracker'
import {ReserveSeatCommand} from '../events/reserve-seat-command'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Command {
    /* noop*/
}

interface Err {
    _type: string;
}

// @ts-ignore TODO - will be implemented
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Result<L extends Err, R> {
}

class Right<L extends Err, R> implements Result<L, R> {

    // @ts-ignore TODO - wip
    constructor(private readonly __value: R) {
    }
}

interface CommandHandler<T extends Command, Q> {
    handle(command: T): Result<Err, Q>;
}

export class Seat {
    constructor(public readonly row: number, public readonly seat: number) {
    }
}

interface TrackedCommand extends TrackedEvent<keyof typeof knownCommands> {
    command: Command;
}

export class ReserveSeatCommandHandler
implements CommandHandler<ReserveSeatCommand, unknown>, CanTrackMessages<keyof typeof knownCommands> {
    private tracksMessages: TracksMessages<TrackedCommand>

    constructor(private readonly consumer: ListenesMessages<DomainCommand>) {
        consumer.onMessage(message => {
            this.handle(message.data as unknown as ReserveSeatCommand)
        })
        this.tracksMessages = new TracksMessages()
    }

    public trackRequests: () => OutputTracker<TrackedCommand>
        = () => OutputTracker.create<TrackedCommand>(this.tracksMessages, 'received')

    public handle(command: ReserveSeatCommand): Result<Err, unknown> {
        this.tracksMessages.eventHappened('received', {type: command.__type, command})
        return new Right(command)
    }

    public close() {
        this.consumer.close()
    }
}
