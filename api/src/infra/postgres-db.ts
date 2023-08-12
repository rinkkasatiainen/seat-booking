import { Pool } from 'pg'

export default new Pool ({
    max: 20,
    connectionString: 'postgres://user:password@localhost:5643/dbname',
    idleTimeoutMillis: 30000,
})
