import {Status} from "../hooks/health-check-get.tsx";
import {JSX} from "react";

export type HealthCheckStatus = {
    status: Status
} & Record<string, unknown>

interface HealthCheckGetProps {
    getHealthCheck: () => Promise<void>
    healthCheckStatus: HealthCheckStatus
}

const asKeys: (x: object) => JSX.Element[] = x => {
    return Object.entries(x).map(([key, value]) =>
        <div className='Element' key={key}>
            <div className='Element-key'>{key.toUpperCase()}</div><div className='Element-value'>{value}</div>
        </div>
    )
}

const mapElements: (x: JSX.Element[]) => JSX.Element = elements => {
    return <>
        {elements}
    </>
}

export function HealthCheckGet({getHealthCheck, healthCheckStatus}: HealthCheckGetProps): JSX.Element {
    return <>
        <button onClick={getHealthCheck}>Do Health Check</button>
        <div className='HealthCheckContainer'>
            {mapElements(asKeys(healthCheckStatus))}
        </div>
    </>
}