import { Pool } from 'pg'

export default new Pool ({
    max: 20,
    connectionString: 'postgres://user1:pass1@postgres:5432/api-db',
    idleTimeoutMillis: 30000,
})
