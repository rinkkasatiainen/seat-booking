import {defineConfig, mergeConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteConfig from './vite.config'

// https://vitejs.dev/config/
// @ts-ignore
export default mergeConfig(viteConfig, defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
    },
}))
