import express, {Express, Request, Response, Router} from 'express'
import {HttpServerAlias} from '../server'

export type RouteApp = Pick<Express, 'use' | 'listen'>

export interface RequestWithValidData extends Request {
    body: { data: unknown };
}

export type ReqResFn = (req: RequestWithValidData, res: Response) => void

export interface Routes {
    get: (url: string, callback: ReqResFn) => void;
    post: (url: string, callback: ReqResFn) => void;
}

export interface Route {
    [key: string]: ReqResFn;
}

type KEYS = 'POST' | 'GET'

export interface TestRoutes extends Routes {
    run: (method: KEYS, url: string) => ReqResFn;
}

export class ExpressApp {

    public static app(): RouteApp {
        return express()
    }

    public static routes(): Routes {
        return Router()
    }

    public static createNull(): RouteApp {
        return {
            // @ts-ignore For testing
            use: () => ExpressApp.createNull(),
            // @ts-ignore For testing
            listen: () => {
                const fakeServer: HttpServerAlias = {
                    // @ts-ignore For testing
                    close: () => fakeServer,
                    // @ts-ignore For testing
                    on: () => fakeServer,
                }
                return fakeServer
            },
        }
    }

    public static nullRoutes(): TestRoutes {
        const registeredRoutes: { [key in KEYS]: Route } = {
            GET: {},
            POST: {},
        }
        return {
            get: (url: string, callback: ReqResFn) => {
                registeredRoutes.GET[url] = callback
            },
            post: (url: string, callback: ReqResFn) => {
                registeredRoutes.POST[url] = callback
            },
            // @ts-ignore used in testing - nullpointer clear in test
            run: (method, url) => registeredRoutes[method][url],
        }
    }
}
