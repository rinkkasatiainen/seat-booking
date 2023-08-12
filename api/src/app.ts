import server from './server'
import {Logger} from './logger'

const serverPort = parseInt(process.env.PORT || '4000', 10)

const consoleLogger: Logger = {
    log: console.log, /* eslint-disable-line  no-console */
    error: console.error, /* eslint-disable-line  no-console */
}

const starter = new server(consoleLogger).start(serverPort)
    .then((port: number) => consoleLogger.log(`Running on port ${port}`))
    .catch((error: Error) => {
        consoleLogger.error(error)
    })

export default starter
