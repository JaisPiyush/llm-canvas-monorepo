/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'

// Mock Electron preload APIs
vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn()
  },
  ipcRenderer: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn()
  }
}))

// Mock Node.js process for preload environment
Object.defineProperty(global, 'process', {
  value: {
    platform: 'darwin',
    arch: 'x64',
    version: 'v18.0.0',
    contextIsolated: true,
    versions: {
      electron: '28.0.0',
      chrome: '120.0.0',
      node: '18.0.0'
    },
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    emit: vi.fn()
  },
  writable: true
})

// Global test utilities for preload
declare global {
  var mockContextBridge: any
  var mockIpcRenderer: any
}

global.mockContextBridge = vi.mocked((await import('electron')).contextBridge)
global.mockIpcRenderer = vi.mocked((await import('electron')).ipcRenderer)