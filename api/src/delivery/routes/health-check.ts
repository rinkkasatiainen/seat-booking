import {Request, Response, Router} from 'express'
import {Broadcast, RabbitMQProducer} from '../../server'
import {healthCheck, HealthCheck} from '../../domain/event'


const helloWorld: (req: Request, res: Response) => void =
    (_, res) => {
        res.send('Hello World, mate!')
    }


const healtCheck: (req: Request, res: Response) => void =
    (_, res) => {
        res.json({status: 'ok'})
    }

interface RequestWithValidData {
    body: { data: unknown };
}

type F = (req: RequestWithValidData, res: Response) => void

const isObject = (x: unknown): x is {[key: string]: unknown} => typeof x === 'object' && x !== null

function isValidF(x: unknown): x is RequestWithValidData {
    if (isObject(x)) {
        const {body} = x
        return typeof body === 'object' && body !== null && 'data' in body
    }
    return false

}

const withValidRequest: (f: F) => (req: Request, res: Response) => void =
    callbackFn => (req, res) => {
        if (isValidF(req)) {
            return callbackFn(req, res)
        }
        res.status(400).json('INVALID REQUEST')
        return
    }

const healtCheckPost:
    (broadCast: Broadcast, producer: RabbitMQProducer) => (req: RequestWithValidData, res: Response) => void =
    (broadCast, producer) => (req, res) => {
        const message: unknown = req.body.data
        if (typeof message === 'string') {
            const healthCheckEvent: HealthCheck = healthCheck(message)
            const count = broadCast(healthCheckEvent)
            producer.send(healthCheckEvent)
            res.json({status: {websocket: {status: 'ok', connections: count}}})
            return
        }
        res.json({status: 'failed'})
    }


const r = (broadCast: Broadcast, producer: RabbitMQProducer) => {
    const router = Router()
    router.get('/hello/world', helloWorld)
    router.post('/health/check', withValidRequest(healtCheckPost(broadCast, producer)))
    router.get('/health/check', healtCheck)
    return router
}
export default r
