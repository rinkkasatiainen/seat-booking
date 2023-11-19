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

    public static createNull(): ActsAsPool {
        return {
            disconnect(): Promise<void> {
                return Promise.resolve(undefined)
            },
            connect(): CanConnectToPool {
                const res: QueryResult = {
                    command: 'none', fields: [], oid: 0, rowCount: 0, rows: [],
                }
                return Promise.resolve({
                    query: () => Promise.resolve(res),
                    release: noop,
                })
            },

        }
    }
}

const createPool: (x: Partial<PG_ENV>) => ActsAsPool = pgEnv => PgPool.of.call(this, pgEnv)

// eslint-disable-next-line @typescript-eslint/unbound-method
export default createPool
