/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import type { MockedFunction } from 'vitest'

// Mock Electron modules
vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    quit: vi.fn(),
    setUserModelId: vi.fn(),
    getPath: vi.fn().mockReturnValue('/mock/path'),
    getVersion: vi.fn().mockReturnValue('1.0.0')
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      setWindowOpenHandler: vi.fn()
    },
    show: vi.fn(),
    focus: vi.fn(),
    close: vi.fn()
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn()
  },
  shell: {
    openExternal: vi.fn()
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn()
  }
}))

// Mock path module for consistent cross-platform tests
vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('path')>()
  return {
    ...actual,
    join: vi.fn((...paths: string[]) => paths.join('/')),
    resolve: vi.fn((...paths: string[]) => '/' + paths.join('/'))
  }
})

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn()
  }
}))

// Global test utilities for main process
declare global {
  var mockElectronApp: any
  var mockBrowserWindow: MockedFunction<any>
  var mockIpcMain: any
}

global.mockElectronApp = vi.mocked((await import('electron')).app)
global.mockBrowserWindow = vi.mocked((await import('electron')).BrowserWindow)
global.mockIpcMain = vi.mocked((await import('electron')).ipcMain)