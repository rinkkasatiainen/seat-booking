import chai from 'chai'
import chaiSubset from 'chai-subset'
import {AmqpConsumer, StubbedChannel, StubbedConnection} from '../../../src/common/infra/amqp/consumer'
import {ReserveSeatCommandHandler} from '../../../src/domain/actions/reserve-seat-command-handler'
import {ListenesMessages} from '../../../src/server'
import {DomainCommand} from '../../../src/domain/event'
import {trackDomainMessage} from '../../../src/domain/tracked-message'
import {reserveSeatCommand} from '../../../src/domain/events/reserve-seat-command'
import {amqpMessageOf} from '../../utils/amqp_stream'

const {expect} = chai
chai.use(chaiSubset)

describe('Something', () => {
    let consumer: ListenesMessages<DomainCommand>
    let conn: StubbedConnection
    let channel: StubbedChannel
    let cmdHandler: ReserveSeatCommandHandler
    const queueName = 'TEST Q'
    beforeEach(async () => {
        conn = new StubbedConnection()
        channel = new StubbedChannel()
        consumer = await AmqpConsumer.createNull({qName: queueName, conn, channel})
        cmdHandler = new ReserveSeatCommandHandler(consumer)
    })

    afterEach(() => {
        cmdHandler.close()
    })

    it('does magic', () => {
        // Send a message through AMQP

        const outputTracker = cmdHandler.trackRequests()
        // CommandHandler activates
        const event = trackDomainMessage(reserveSeatCommand([]))
        channel.simulate(queueName, amqpMessageOf(event))

        // ??
        expect(outputTracker.data()).to.eql([{command: event.data, type: 'Reserve'}])
        // profit!

        // Another message is sent to Events exchange.
    })
})
