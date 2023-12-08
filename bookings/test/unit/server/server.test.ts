import chai from 'chai'
import {Server} from '../../../src/server'
import {LogsData} from '../../../src/logger'
import {ExpressApp} from '../../../src/delivery/express-app'
import {ActsAsServer} from '../../../src/server/server'
import {OutputTracker} from '../../../src/infra/output-tracker'
import {ExpressAppEvents} from '../../../src/infra/express-app-events'

const {expect} = chai

describe('Bookings server', () => {
    let server: ActsAsServer
    let routeApp: ExpressApp
    let logger: LogsData
    let trackMessages: OutputTracker<ExpressAppEvents>

    beforeEach(async () => {
        logger = LogsData.createNull()
        routeApp = ExpressApp.createNull()
        trackMessages = routeApp.trackRequests()
        server = await Server.of(logger, /* producer, listener, */routeApp).start(4011)
    })

    afterEach(() => {
        server.close()
    })

    it('starts server on port', () => {
        expect(trackMessages.data()).to.eql([
            {
                type: 'listen',
                args: [{port: 4011}],
            },
        ])
    })
})
