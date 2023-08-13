import {Pool} from 'pg'
import {PG_ENV} from "../app";


export type CreatePool = () => Pool

const createPool: (x: Partial<PG_ENV>) => CreatePool = pgEnv => () => {
    return new Pool({
        max: 20,
        connectionString: `postgres://${pgEnv.PG_USERNAME}:${pgEnv.PG_PASSWORD}@${pgEnv.PG_HOST}:${pgEnv.PG_PORT}/api-db`,
        idleTimeoutMillis: 30000,
    })
}
export default createPool;
