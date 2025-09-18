/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Global mocks for browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Electron APIs
global.require = vi.fn()

// Mock Electron main process APIs
const mockElectron = {
  app: {
    getPath: vi.fn((name: string) => {
      const paths: Record<string, string> = {
        userData: '/mock/userData',
        temp: '/mock/temp',
        home: '/mock/home',
        documents: '/mock/documents',
        downloads: '/mock/downloads',
        desktop: '/mock/desktop'
      }
      return paths[name] || '/mock/default'
    }),
    getName: vi.fn(() => 'llm-canvas'),
    getVersion: vi.fn(() => '1.0.0'),
    isReady: vi.fn(() => true),
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    off: vi.fn(),
    quit: vi.fn(),
    exit: vi.fn()
  },
  ipcMain: {
    on: vi.fn(),
    off: vi.fn(),
    handle: vi.fn(),
    removeHandler: vi.fn(),
    send: vi.fn(),
    sendSync: vi.fn()
  },
  ipcRenderer: {
    on: vi.fn(),
    off: vi.fn(),
    invoke: vi.fn(),
    send: vi.fn(),
    sendSync: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    },
    on: vi.fn(),
    off: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn()
  })),
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn()
  },
  shell: {
    openExternal: vi.fn(),
    openPath: vi.fn(),
    showItemInFolder: vi.fn()
  },
  path: {
    join: vi.fn((...args: string[]) => args.join('/')),
    resolve: vi.fn((...args: string[]) => args.join('/')),
    dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
    basename: vi.fn((p: string) => p.split('/').pop() || ''),
    extname: vi.fn((p: string) => {
      const parts = p.split('.')
      return parts.length > 1 ? `.${parts.pop()}` : ''
    })
  },
  fs: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    mkdir: vi.fn(),
    stat: vi.fn(),
    existsSync: vi.fn()
  }
}

// Mock Electron based on environment
if (typeof window === 'undefined') {
  // Node.js environment (main process)
  global.require = vi.fn((module: string) => {
    if (module === 'electron') {
      return mockElectron
    }
    return {}
  })
} else {
  // Browser environment (renderer process)
  ;(global as any).electronAPI = {
    ...mockElectron.ipcRenderer,
    ...mockElectron.shell,
    ...mockElectron.dialog
  }
}

// Note: child_process mocking is handled in individual test files

// Mock fs for file system operations
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn()
}))

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
  resolve: vi.fn((...args: string[]) => args.join('/')),
  dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/')),
  basename: vi.fn((p: string) => p.split('/').pop() || ''),
  extname: vi.fn((p: string) => {
    const parts = p.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  })
}))
