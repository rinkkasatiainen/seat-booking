import {Request, Response, Router} from 'express'
import {Broadcast, RabbitMQProducer} from '../../server'


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
        const message = req.body
        const count = broadCast(JSON.stringify(message))
        producer.send(JSON.stringify(message))
        res.json({status: {websocket: {status: 'ok', connections: count }}})
    }


const r = (broadCast: Broadcast, producer: RabbitMQProducer) => {
    const router = Router()
    router.get('/hello/world', helloWorld)
    router.post('/health/check', healtCheckPost(broadCast, producer) )
    router.get('/health/check', healtCheck)
    return router
}
export default r
