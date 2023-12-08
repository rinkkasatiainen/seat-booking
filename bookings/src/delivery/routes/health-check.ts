import {ReqResFn, Routes} from '../express-app'


const healtCheck: ReqResFn =
    (_, res) => {
        res.json({status: 'ok'})
    }

export type ProvidesRoutes<T extends Routes> = (routes: T) => T

const healthCheckRoutes: <T extends Routes>(routes: T) => T =
    <T extends Routes>(router: T) => {
        router.get('/health/check', healtCheck)
        return router
    }

export const healthCheckRoute: <T extends Routes>() => ProvidesRoutes<T> =
    () => <T extends Routes>(routes: T) => healthCheckRoutes(routes)
