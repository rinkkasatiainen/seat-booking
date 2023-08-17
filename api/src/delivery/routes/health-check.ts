import {Request, Response, Router} from 'express'

const router = Router()

const helloWorld: (req: Request, res: Response) => void =
    (_, res) => {
        res.send('Hello World, mate!')
    }


const healtCheck: (req: Request, res: Response) => void =
    (_, res) => {
        res.json({status: 'ok'})
    }

router.get('/hello/world', helloWorld)
router.get('/health/check', healtCheck)


export default router
