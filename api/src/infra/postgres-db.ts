import {Pool, PoolClient, QueryResult} from 'pg'

import {PG_ENV} from '../env-vars'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}

type ConnectedPoolClient = Pick<PoolClient, 'query' | 'release'>
type CanConnectToPool =Promise<ConnectedPoolClient>;

export type CreatePool = () => CanConnectToPool
export type DisconnectFromPool = () => Promise<void>


export interface ActsAsPool {
    connect: CreatePool;
    disconnect: DisconnectFromPool;
}

function hasQ<T extends string>(key: T, data: FakeData): data is Fakeable<T> {
    return Object.keys(data).includes(key)
}
function isDefined<T>(value: T | undefined ): asserts value is T {
    if (value === undefined) {
        // return false
        throw new Error( 'Expected value not to be undefined' )
    }
}

function assertValue<T>(x: T | undefined): T {
    isDefined(x)
    return x
}

export class PgPool {

    private constructor(private readonly pool: Pool) {
    }

    public connect() {
        return this.pool.connect()
    }
    public disconnect() {
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
        return {
            disconnect(): Promise<void> {
                return Promise.resolve(undefined)
            },
            connect(): CanConnectToPool {
                const empty: QueryResult = {
                    command: 'none', fields: [], oid: 0, rowCount: 0, rows: [],
                }
                const resultOf: (query: string, data: unknown[]) => QueryResult = (query, rows) => ({
                    command: query, fields: [], oid: 0, rowCount: 0, rows,

                })
                return Promise.resolve({
                    query: (q: string) => {
                        if (hasQ(q, dataRows)) {
                            return Promise.resolve(resultOf(q, assertValue(dataRows[q])))
                        }
                        return Promise.resolve(empty)
                    },
                    release: noop,
                }) as Promise<ConnectedPoolClient>
            },

        }
    }
}
type FakeData = Record<string, unknown[]>
type Fakeable<T extends string> = Record<T, unknown[]>

const fff: FakeData = { test: ['foobar']}
if( hasQ('test', fff) ){
    const y: Fakeable<'test'> = fff
    console.log(y)
}
console.log(fff)

const createPool: (x: Partial<PG_ENV>) => ActsAsPool = pgEnv => PgPool.of.call(this, pgEnv)

// eslint-disable-next-line @typescript-eslint/unbound-method
export default createPool
