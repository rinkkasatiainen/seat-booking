import {Pool} from 'pg'

import {PG_ENV} from "../env-vars";


export type CreatePool = () => Pool

const createPool: (x: Partial<PG_ENV>) => CreatePool = pgEnv => () => {
    let pool = new Pool({
        max: 20,
        connectionString: `postgres://${pgEnv.PG_USERNAME}:${pgEnv.PG_PASSWORD}@${pgEnv.PG_HOST}:${pgEnv.PG_PORT}/api-db`,
        idleTimeoutMillis: 30000,
    });

    return pool
}
export default createPool;
