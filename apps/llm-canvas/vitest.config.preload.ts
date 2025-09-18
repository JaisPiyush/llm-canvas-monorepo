/// <reference types="vitest" />
/// <reference path="./test-setup/test-types.d.ts" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'preload',
    environment: 'happy-dom', // Simulates browser-like environment for Electron preload
    include: [
      'src/preload/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/preload/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/preload'
    },
    setupFiles: ['./test-setup/preload.setup.ts']
  },
  resolve: {
    alias: {
      '@preload': resolve(__dirname, 'src/preload'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@llm-canvas/sdk': resolve(__dirname, '../../packages/llm-canvas-sdk/src')
    }
  }
})
