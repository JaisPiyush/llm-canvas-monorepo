/// <reference types="vitest" />
/// <reference path="./test-setup/test-types.d.ts" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'renderer',
    environment: 'jsdom',
    include: [
      'src/renderer/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/renderer/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/out/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/renderer'
    },
    setupFiles: ['./test-setup/renderer.setup.ts']
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@preload': resolve(__dirname, 'src/preload'),
      '@llm-canvas/sdk': resolve(__dirname, '../../packages/llm-canvas-sdk/src')
    }
  }
})