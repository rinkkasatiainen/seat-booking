import React, {useEffect, useState} from "react";
import {HealthCheckStatus} from "../components/HealthCheckGet.tsx";

const resetStatus: <T>(dispatchFn: React.Dispatch<React.SetStateAction<T>>, status: T) => void =
    (dispatchFn, status) => {
        setTimeout(() => {
            dispatchFn(status)
        }, 3000)
    };

export enum Status {
    ok = 'ok',
    unknown = 'unknown',
}

const asStatus: (s: Status) => HealthCheckStatus = status => ({ status })
export const healthCheckGet: () => { status: HealthCheckStatus, callHealthCheck: () => Promise<void> } = () => {
    const [status, setStatus] = useState(asStatus(Status.unknown))

    const callHealthCheck = () => {
        return fetch('http://localhost:4000/health/check')
            .then(async res => {
                const body = await res.json()
                setStatus(body)
                resetStatus<HealthCheckStatus>(setStatus, asStatus(Status.unknown));
            })
            .catch(err => {
                console.error('Error in response', err)
            });
    }

    useEffect(() => {
        callHealthCheck()
    }, [])

    return {status, callHealthCheck}

}
