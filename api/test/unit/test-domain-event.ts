import {KnownDomainEvent} from '../../src/domain/event'

interface TestDomainEvent extends KnownDomainEvent<'HealthCheck'> {
    __type: 'HealthCheck';
    data: string;
}

export const testDomainEventOf: (str: string) => TestDomainEvent = data => ({__type: 'HealthCheck', data})
