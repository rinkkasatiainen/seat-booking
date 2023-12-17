import {Connection} from 'amqplib/callback_api'
import {SendsMessages} from '../../server'
import {DomainEvent} from '../../domain/event'

function noop() { /* noop */ }

export interface ActsAsProducer {
    connect: (url: string, opts: unknown, callback: (errorConnect: Error, connection: Connection) => void) => void;
}

export class AmqpProducer implements SendsMessages {
    public close(): void {
        /* noop */
    }

    public send(/* _msg: DomainEvent*/): void {
        /* noop */
    }

    public static of(/* _envvars: AMQP_ENV, _exchangeName: string*/): {
        start: (_amqp: ActsAsProducer) => Promise<SendsMessages>;
        } {
        return undefined as never
    }

    public static createNull(spiedBroadcast?: DomainEvent[]): SendsMessages {
        return {
            close: noop,
            send: (msg) => {
                if (spiedBroadcast) {
                    spiedBroadcast.push(msg)
                }
            },
        }
    }

}
