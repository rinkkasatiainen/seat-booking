import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'

import {HealthCheck} from '../../components/HealthCheck.tsx'
import * as healthCheckGetHooks from "../../hooks/health-check-get.tsx";


describe('HealthCheck', () => {
    it('does magic', () => {
        const mockObj = {
            status: healthCheckGetHooks.Status.ok,
            callHealthCheck: vi.fn() as unknown as () => Promise<void>
        }
        vi.spyOn(healthCheckGetHooks, 'healthCheckGet').mockImplementation(() => mockObj)
        const spy = vi.spyOn(mockObj, 'callHealthCheck')
        render(<HealthCheck/>)
        const getHealthCheckButton = screen.getByRole('button')

        expect(spy).toHaveBeenCalledTimes(0)
        fireEvent.click(getHealthCheckButton)
        expect(spy).toHaveBeenCalledOnce()
    })
})
