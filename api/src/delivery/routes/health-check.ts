import {Broadcast, ListenesMessages, SendsMessages} from '../../server'
import {connectedToWS, DomainEvent, healthCheck, HealthCheck, isDomainEvent, isHealthCheck} from '../../domain/event'
import {ReqResFn, RequestWithValidData, Routes} from '../express-app'
import {isTracked, trackDomainMessage, TrackedMessage} from '../../domain/tracked-message'
import {AmqpProducer} from '../../common/infra/amqp/producer'
import {parseExchangeName} from '../../common/infra/amqp/url'

const helloWorld: ReqResFn =
    (_, res) => {
        res.send('Hello World, mate!')
    }


const healtCheck: ReqResFn =
    (_, res) => {
        res.json({status: 'ok'})
    }

const isObject = (x: unknown): x is { [key: string]: unknown } => typeof x === 'object' && x !== null

function doesContainBodyWithData(x: unknown): x is RequestWithValidData {
    if (isObject(x)) {
        const {body} = x
        return typeof body === 'object' && body !== null && 'data' in body
    }
    return false
}

const withValidRequest: (f: ReqResFn) => ReqResFn =
    callbackFn => (req, res) => {
        if (doesContainBodyWithData(req)) {
            return callbackFn(req, res)
        }
        res.status(400).json('INVALID REQUEST')
        return
    }

const healtCheckPost:
    (a: Broadcast, b: AmqpProducer, c: ListenesMessages, d: SendsMessages) => ReqResFn =
    (broadCast, producer: AmqpProducer, listener, hcResponses) => (req, res) => {
        const message: unknown = req.body.data
        if (typeof message === 'string') {
            const healthCheckEvent: HealthCheck = healthCheck(message)
            const trackedMessage: TrackedMessage<DomainEvent> = trackDomainMessage(healthCheckEvent)
            producer.send(trackedMessage)

            const healthCheckMessage = connectedToWS(healthCheckEvent.message)
            const count = broadCast(healthCheckMessage)
            res.json({status: {websocket: {status: 'ok', connections: count}}})

            listener.onMessage((event) => {
                if (isTracked(isDomainEvent)(event)) {
                    // if (event.uuid === trackedMessage.uuid) {
                    const domainMsg = event.data
                    if (isHealthCheck(domainMsg)) {
                        const e: HealthCheck = {...healthCheckMessage, amqp: {status: 'connected'}}
                        const msg: TrackedMessage<HealthCheck> = {uuid: trackedMessage.uuid, data: e}
                        hcResponses.send(msg)
                        producer.to(parseExchangeName('health-check:bookings')).send(msg)
                        // broadCast(e)
                    }
                    // }
                }
            })
            return
        }
        res.status(400).json({status: 'error', reason: 'invalid data in request'})
    }


export type ProvidesRoutes<T extends Routes> =
    (bc: Broadcast, pr: AmqpProducer, li: ListenesMessages, hcResponses: SendsMessages) => T

const r: <T extends Routes> (router: T) => ProvidesRoutes<T> =
    <T extends Routes>(router: T) => (broadCast, producer, listener, hcResponses): T => {
        router.get('/hello/world', helloWorld)
        router.post('/health/check', withValidRequest(healtCheckPost(broadCast, producer, listener, hcResponses)))
        router.get('/health/check', healtCheck)
        return router
    }

export const healthCheckRoute: <T extends Routes>(t: T) => ProvidesRoutes<T> = routes => r(routes)
