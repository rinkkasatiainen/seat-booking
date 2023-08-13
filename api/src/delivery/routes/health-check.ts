import {Request, Response, Router} from 'express';

const router = Router();

const helloWorld: (req: Request, res: Response) => Promise<void> =
    async (_, res) => {
        await res.send( 'Hello World, mate!' )
    }


const healtCheck: (req: Request, res: Response) => Promise<void> =
    async (_, res) => {
        await res.json({status: 'ok'})
    }

router.get('/hello/world', helloWorld);
router.get('/health/check', healtCheck);


export default router;