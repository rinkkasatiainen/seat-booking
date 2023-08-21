import {Request, Response, Router} from 'express'
import {Broadcast} from '../../server'


const helloWorld: (req: Request, res: Response) => void =
    (_, res) => {
        res.send('Hello World, mate!')
    }


const healtCheck: (req: Request, res: Response) => void =
    (_, res) => {
        res.json({status: 'ok'})
    }

const healtCheckPost: (broadCast: Broadcast) => (req: Request, res: Response) => void =
    broadCast => (req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        broadCast(JSON.stringify(req.body))
        res.json({status: 'ok'})
    }

const noop = (_: unknown) => {/* noop*/}


const r = (broadCast: Broadcast | undefined = noop) => {
    const router = Router()
    router.get('/hello/world', helloWorld)
    router.post('/health/check', healtCheckPost(broadCast) )
    router.get('/health/check', healtCheck)
    return router
}
export default r
