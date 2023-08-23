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

const healtCheckPost: (broadCast: Broadcast, producer: RabbitMQProducer) => (req: Request, res: Response) => void =
    (broadCast, producer) => (req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message: string = req.body.data
        if (typeof message === 'string') {
            const healthCheckEvent: HealthCheck = healthCheck(message)
            const count = broadCast(healthCheckEvent)
            producer.send(healthCheckEvent)
            res.json({status: {websocket: {status: 'ok', connections: count}}})
        }
    }


const r = (broadCast: Broadcast, producer: RabbitMQProducer) => {
    const router = Router()
    router.get('/hello/world', helloWorld)
    router.post('/health/check', healtCheckPost(broadCast, producer))
    router.get('/health/check', healtCheck)
    return router
}
export default r
