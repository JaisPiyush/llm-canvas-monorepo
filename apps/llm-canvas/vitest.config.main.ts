/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'main',
    environment: 'node',
    include: [
      'src/main/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/main/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/main'
    },
    setupFiles: ['./test-setup/main.setup.ts']
  },
  resolve: {
    alias: {
      '@main': resolve(__dirname, 'src/main'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@preload': resolve(__dirname, 'src/preload'),
      '@llm-canvas/sdk': resolve(__dirname, '../../packages/llm-canvas-sdk/src')
    }
  }
})