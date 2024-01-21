import {expect} from 'chai'
import {v4} from 'uuid'
import {DomainEvent, HealthCheck, healthCheck, isDomainEvent} from '../../../src/domain/event'
import {isTracked, trackDomainMessage, TrackedMessage} from '../../../src/domain/tracked-message'

describe('Tracked Messages', () => {

    const healthCheckEvent = healthCheck('of any')
    describe('requires only uuid and data', () => {
        const event: TrackedMessage<unknown> = {uuid: v4(), data: 'anything'} as unknown as TrackedMessage<HealthCheck>
        const returnsFalse = (_x: unknown): _x is DomainEvent => false
        const returnsTrue = (_x: unknown): _x is DomainEvent => true

        it('if callback returns false, returns false', () => {
            expect(isTracked(returnsFalse)(event)).to.eql(false)
            expect(isTracked(returnsTrue)(event)).to.eql(true)
        })

        it('is false if missing a value', () => {
            const missingUUID = {data: event.data} as unknown as TrackedMessage<HealthCheck>
            expect(isTracked(returnsTrue)(missingUUID)).to.eql(false)
        })
        it('is false if wrong keys', () => {
            const missingUUID = {wrong: 'data', data: event.data} as unknown as TrackedMessage<HealthCheck>
            expect(isTracked(returnsTrue)(missingUUID)).to.eql(false)
        })
    })
    describe('with a domain event', () => {
        it('finds a domainmessage', () => {
            expect(isDomainEvent(healthCheckEvent)).to.eql(true)
        })

        it('finds a domain message', () => {
            const tracked = trackDomainMessage(healthCheckEvent)

            expect(isTracked(isDomainEvent)(tracked)).to.eql(true)
        })

        it('if callback returns false, returns false', () => {
            const tracked = trackDomainMessage(healthCheckEvent)

            expect(isTracked((_x: unknown): _x is DomainEvent => false)(tracked)).to.eql(false)
        })
    })

})
