import React, {JSX} from 'react'
import {HealthCheckGet} from "./HealthCheckGet.tsx";
import {healthCheckGet} from "../hooks/health-check-get.tsx";


function HealthCheckResponses() {
    return <>
        <li>
            <ul>response 1</ul>
            <ul>response 2</ul>
        </li>
    </>
}

export function HealthCheck(): JSX.Element {
    const {status, callHealthCheck} = healthCheckGet()
    return <>
        <p> health check here</p>


        <div>
            <p>here is a block where one can send a health check call</p>
            <p>either in GET - and will get an immediate response</p>

            <HealthCheckGet getHealthCheck={() => callHealthCheck()} healthCheckStatus={status}/>

            <p>or as POST, which will return response, and can be seen in the WebSocket connection below</p>
        </div>

        <div>
            <HealthCheckResponses>

            </HealthCheckResponses>
            <p>Here is a block where you can connect to WebSockets</p>
            <p> and within that, is a list of last WebSocket healthCheck events</p>
        </div>
    </>
}
