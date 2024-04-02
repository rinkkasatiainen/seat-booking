import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";

import {HealthCheckGet} from "../../components/HealthCheckGet.tsx";
import {Status} from "../../hooks/health-check-get.tsx";

describe('HealthCheckGet', () => {
    it('Does send a message on click', () => {
        let statusResponse = { status: Status.unknown };
        let getHealthCheckFn = vi.fn();
        render(<HealthCheckGet healthCheckStatus={statusResponse} getHealthCheck={getHealthCheckFn} />)
        const getHealthCheckButton = screen.getByRole('button')

        expect(getHealthCheckFn).toHaveBeenCalledTimes(0)
        fireEvent.click(getHealthCheckButton)
        expect(getHealthCheckFn).toHaveBeenCalledOnce()
    })
})