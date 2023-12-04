import {Pool, PoolClient, QueryResult} from 'pg'

import {PG_ENV} from '../env-vars'

function noop() { /**/ }

type ConnectedPoolClient = Pick<PoolClient, 'query' | 'release'>
type CanConnectToPool = Promise<ConnectedPoolClient>;

export type CreatePool = () => CanConnectToPool
export type DisconnectFromPool = () => Promise<void>


export interface ActsAsPool {
    connect: CreatePool;
    disconnect: DisconnectFromPool;
}


export class PgPool implements ActsAsPool {

    private constructor(private readonly pool: Pool) {
    }

    public connect(): Promise<PoolClient> {
        return this.pool.connect()
    }

    public disconnect(): Promise<void>{
        return this.pool.end()
    }

    public static of(pgEnv: Partial<PG_ENV>): ActsAsPool {
        const {PG_PORT, PG_USERNAME, PG_PASSWORD, PG_HOST} = pgEnv
        const pool = new Pool({
            max: 20,
            connectionString: `postgres://${PG_USERNAME}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/api-db`,
            idleTimeoutMillis: 30000,
        })

        return new PgPool(pool)
    }

    public static createNull(dataRows: FakeData = {}): ActsAsPool {
        function isDefined<T>(value: T | undefined): asserts value is T {
            if (value === undefined) {
                throw new Error('Expected value not to be undefined')
            }
        }

        function assertValue<T>(x: T | undefined): T {
            isDefined(x)
            return x
        }

        function dataOr<T extends string>(key: T, data: FakeData): unknown[] {
            const value = data[key]
            if (value === undefined) {
                return []
            }
            return assertValue(value)
        }
        const resultOf: (query: string, data: unknown[]) => QueryResult = (query, rows) => ({
            command: query, fields: [], oid: 0, rowCount: 0, rows,
        })

        return {
            disconnect(): Promise<void> {
                return Promise.resolve(undefined)
            },
            connect(): CanConnectToPool {
                return Promise.resolve({
                    query: (q: string) => Promise.resolve(resultOf(q, dataOr(q, dataRows))),
                    release: noop,
                }) as Promise<ConnectedPoolClient>
            },

        }
    }
}

type FakeData = Record<string, unknown[]>

export const createPool: (x: Partial<PG_ENV>) => ActsAsPool = pgEnv => PgPool.of.call(this, pgEnv)
