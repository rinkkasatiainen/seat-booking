import {Pool} from 'pg'

import {PG_ENV} from '../env-vars'


export type CreatePool = () => Pool

const createPool: (x: Partial<PG_ENV>) => CreatePool = pgEnv => () => {
    const {PG_PORT, PG_USERNAME, PG_PASSWORD, PG_HOST} = pgEnv
    const pool = new Pool({
        max: 20,
        connectionString: `postgres://${PG_USERNAME}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/api-db`,
        idleTimeoutMillis: 30000,
    })

    return pool
}
export default createPool
