import {KnownDomainEvent} from '../../src/domain/event'

interface TestDomainEvent extends KnownDomainEvent<'HealthCheck'> {
    __type: 'HealthCheck';
    data: string;
}

interface CustomTestDomainEvent<T> extends KnownDomainEvent<'HealthCheck'> {
    __type: 'HealthCheck';
    data: T;
}

export const testDomainEventOf: (str: string) => TestDomainEvent = data => ({__type: 'HealthCheck', data})

export const customTestDomainEvent: <T>(x: T) => CustomTestDomainEvent<T> = data => ({__type: 'HealthCheck', data})