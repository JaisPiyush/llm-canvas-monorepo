// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    include: ['test/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'dist', 'out', 'data', 'build', 'resources'],
    coverage: {
      reporter: ['text', 'html']
    },
    alias: {
      '@main': resolve('src/main'),
      '@preload': resolve('src/preload')
    }
  }
})
