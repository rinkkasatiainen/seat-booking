import {KnownDomainCommands} from '../event'
import {Seat} from '../actions/reserve-seat-command-handler'

export interface ReserveSeatCommand extends KnownDomainCommands<'Reserve'> {
    __type: 'Reserve';
    seats: Seat[];
}

export const reserveSeatCommand: (seats: Seat[]) => ReserveSeatCommand = seats => ({__type: 'Reserve', seats})
