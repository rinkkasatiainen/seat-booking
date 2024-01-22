// eslint-disable-next-line max-classes-per-file
import EventEmitter from 'events'
import * as http from 'http'
import express, {Request, Response} from 'express'
import {ApplicationRequestHandler} from 'express-serve-static-core'
import {ExpressAppEventTypes, ExpressEvents, TrackedExpressAppEvent} from '../common/infra/express-app-events'
import {OutputTracker} from '../cross-cutting/output-tracker'
import {CanTrackMessages, TracksMessages} from '../cross-cutting/tracks-requests'

const noop = () => {/* noop*/
}

// Types to define what of 'Express' we are using
export interface RequestWithValidData extends Request {
    body: { data: unknown };
}

export type ReqResFn = (req: RequestWithValidData, res: Response) => void

export interface Routes {
    get: (url: string, callback: ReqResFn) => void;
    post: (url: string, callback: ReqResFn) => void;
}

interface ExpressWrapper {
    listen: (port: number, callback: () => void) => http.Server;
    use: ApplicationRequestHandler<Routes>;
    // (path: PathParams, router: RequestHandlerParams) => void;
}

// internal types

export interface Route {
    [key: string]: ReqResFn;
}

type KEYS = 'POST' | 'GET'

export interface TestRoutes extends Routes {
    run: (method: KEYS, url: string) => ReqResFn;
}

export class ExpressApp implements CanTrackMessages<ExpressEvents> {
    private readonly tracksMessages: TracksMessages<TrackedExpressAppEvent>
    private httpServer?: http.Server

    constructor(private readonly _express: ExpressWrapper, private readonly _routes: Routes) {
        this.tracksMessages = new TracksMessages()
    }

    public routeFor(s: string, callback: (x: Routes) => Routes): void {
        // @ts-ignore TODO
        this._express.use(s, callback(this._routes))

    }

    public listen(port: number, callback: () => void): Promise<ExpressApp> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return new Promise(res => {
            this.httpServer = this._express.listen(port, () => {
                callback()
                this.tracksMessages.eventHappened('EXPRESS APP', {type: 'listen', args: [{port}]})
                res(this)
            })
        })
    }

    public trackRequests(): OutputTracker<TrackedExpressAppEvent> {
        return OutputTracker.create<TrackedExpressAppEvent>(this.tracksMessages, 'EXPRESS APP')
    }

    public close(): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.httpServer?.close()
    }

    public static app(): ExpressApp {
        return new ExpressApp(express(), express.Router())
    }

    public static createNull(expressWrapper: ExpressWrapper = new FakeServer()): ExpressApp {
        return new ExpressApp(expressWrapper, new StubbedRouter())
    }

    public static customServer(): ExpressApp {
        return new ExpressApp(new CustomServer(), new StubbedRouter())
    }
}

export class FakeServer implements ExpressWrapper, CanTrackMessages<ExpressEvents> {
    private _routes?: Routes
    private readonly tracksMessages: TracksMessages<TrackedExpressAppEvent>

    constructor() {
        this.tracksMessages = new TracksMessages<TrackedExpressAppEvent>()
    }

    public listen(_port: number, callback: () => void): http.Server {
        callback()
        return {close: noop} as http.Server
    }

    // @ts-ignore TODO
    public use: ApplicationRequestHandler<Routes> = (_path: string, routes: Routes): void => {
        this._routes = routes
    }

    public simulate(method: KEYS, path: string): Response {
        const r: StubbedRouter = this._routes as StubbedRouter

        const req: Request = {body: {}} as unknown as Request
        const res: Response = {
            json: (data: unknown) => {
                const event: TrackedExpressAppEvent = {type: 'respond', args: [method, path, data]}
                this.tracksMessages.eventHappened(ExpressAppEventTypes.respond, event)
            },
        } as unknown as Response
        // @ts-ignore TODO: AkS: Fix naming & visibility
        r._xxx.emit('request', method, path, req, res)

        return res
    }

    public close(): void {
        /* noop */
    }


    public trackRequests(): OutputTracker<TrackedExpressAppEvent> {
        return OutputTracker.create<TrackedExpressAppEvent>(this.tracksMessages, ExpressAppEventTypes.respond)
    }
}

class CustomServer implements ExpressWrapper {
    private server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

    constructor() {
        this.server = http.createServer()
    }

    // @ts-ignore TODO
    public use: ApplicationRequestHandler<Routes> =
        (_path: string, router: StubbedRouter): Routes => {
            const handleRequestWrapper: (req: http.IncomingMessage, res: http.ServerResponse) => void = (req, res) => {
                // @ts-ignore TODO
                router.registeredRoutes.GET[req.url](req, res) // eslint-disable-line @typescript-eslint/no-unsafe-call
            }
            this.server.on('request', handleRequestWrapper)
            const routes: StubbedRouter = new StubbedRouter()

            return routes
        }

    public listen(port: number, callback: () => void): http.Server {
        // this.server.on('request', this.handleRequest.bind(this))
        this.server.listen(port)
        callback()
        return this.server
    }
}

export class StubbedRouter implements Routes {
    private registeredRoutes: { [key in KEYS]: Route }
    private _xxx: EventEmitter


    constructor() {
        this.registeredRoutes = {GET: {}, POST: {}}

        this._xxx = new EventEmitter()
        this._xxx.on('request', (type: KEYS, path: string, req: Request, res: Response) => {
            const fn = this.getFn(type, path)
            fn(req, res)
        })
    }

    public get(path: string, callback: ReqResFn): void {
        this.registeredRoutes.GET[path] = callback

    }

    public post(path: string, callback: ReqResFn): void {
        this.registeredRoutes.POST[path] = callback
    }

    private getFn(type: KEYS, path: string): ReqResFn {
        const fn = this.registeredRoutes[type][path]
        return fn ? fn : noop
    }
}
