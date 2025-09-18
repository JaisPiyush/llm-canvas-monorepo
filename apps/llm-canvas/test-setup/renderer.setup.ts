import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

// Mock window.canvas API for renderer tests
const mockCanvasAPI = {
  extensions: {
    list: vi.fn().mockResolvedValue([]),
    activate: vi.fn().mockResolvedValue(undefined),
    deactivate: vi.fn().mockResolvedValue(undefined)
  },
  commands: {
    execute: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([])
  },
  workspace: {
    openFolder: vi.fn().mockResolvedValue(undefined),
    getFolders: vi.fn().mockResolvedValue([]),
    getConfiguration: vi.fn().mockResolvedValue({})
  },
  services: {
    list: vi.fn().mockResolvedValue([]),
    call: vi.fn().mockResolvedValue(undefined)
  },
  permissions: {
    request: vi.fn().mockResolvedValue(true),
    check: vi.fn().mockResolvedValue(true)
  },
  window: {
    showMessage: vi.fn().mockResolvedValue(undefined)
  },
  contributions: {
    getViewContainers: vi.fn().mockResolvedValue([]),
    getViews: vi.fn().mockResolvedValue([]),
    getCommands: vi.fn().mockResolvedValue([]),
    getMenuContributions: vi.fn().mockResolvedValue([]),
    getStatusBarItems: vi.fn().mockResolvedValue([]),
    executeCommand: vi.fn().mockResolvedValue(undefined)
  },
  events: {
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn()
  },
  fs: {
    readFile: vi.fn().mockRejectedValue(new Error('Direct file system access not available in renderer')),
    writeFile: vi.fn().mockRejectedValue(new Error('Direct file system access not available in renderer')),
    exists: vi.fn().mockResolvedValue(false),
    mkdir: vi.fn().mockRejectedValue(new Error('Direct file system access not available in renderer')),
    readdir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockRejectedValue(new Error('Direct file system access not available in renderer'))
  },
  system: {
    platform: 'darwin',
    arch: 'x64',
    version: 'v18.0.0'
  }
}

// Mock window.electron API
const mockElectronAPI = {
  ipcRenderer: {
    send: vi.fn(),
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn()
  },
  process: {
    versions: {
      electron: '28.0.0',
      chrome: '120.0.0',
      node: '18.0.0'
    }
  }
}

beforeAll(() => {
  // Mock global window APIs
  Object.defineProperty(window, 'canvas', {
    value: mockCanvasAPI,
    writable: true
  })

  Object.defineProperty(window, 'electron', {
    value: mockElectronAPI,
    writable: true
  })

  Object.defineProperty(window, 'LLMCANVAS_VERSION', {
    value: '1.0.0',
    writable: true
  })

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Global test utilities for renderer
declare global {
  var mockCanvas: typeof mockCanvasAPI
  var mockElectron: typeof mockElectronAPI
}

global.mockCanvas = mockCanvasAPI
global.mockElectron = mockElectronAPI