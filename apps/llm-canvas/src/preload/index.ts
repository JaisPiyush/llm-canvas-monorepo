/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'
import packageJson from '../../package.json'
import { CanvasAPI, ExtensionHostEvents } from '@llm-canvas/sdk'

// Implementation of the API
const canvasAPI: CanvasAPI = {
  // Extension management
  extensions: {
    list: () => ipcRenderer.invoke('extensions:list'),
    activate: (extensionId: string) => ipcRenderer.invoke('extensions:activate', extensionId),
    deactivate: (extensionId: string) => ipcRenderer.invoke('extensions:deactivate', extensionId)
  },

  // Command execution
  commands: {
    execute: (command: string, ...args: any[]) =>
      ipcRenderer.invoke('contributions:executeCommand', command, ...args),
    list: () => ipcRenderer.invoke('contributions:getCommands')
  },

  // Workspace management
  workspace: {
    openFolder: (folderPath: string) => ipcRenderer.invoke('workspace:open', folderPath),
    getFolders: () => ipcRenderer.invoke('workspace:get-folders'),
    getConfiguration: (section?: string) =>
      ipcRenderer.invoke('workspace:get-configuration', section)
  },

  // Service management
  services: {
    list: () => ipcRenderer.invoke('services:list'),
    call: (serviceId: string, method: string, params: any) =>
      ipcRenderer.invoke('services:call', serviceId, method, params)
  },

  // Permission management
  permissions: {
    request: (extensionId: string, permissions: string[]) =>
      ipcRenderer.invoke('permissions:request', extensionId, permissions),
    check: (extensionId: string, permission: string) =>
      ipcRenderer.invoke('permissions:check', extensionId, permission)
  },

  // Window management
  window: {
    showMessage: (type: string, message: string, buttons?: string[]) =>
      ipcRenderer.invoke('window:show-message', type, message, buttons)
  },

  // Contribution system
  contributions: {
    getViewContainers: (location?: string) =>
      ipcRenderer.invoke('contributions:getViewContainers', location),
    getViews: (containerId?: string) => ipcRenderer.invoke('contributions:getViews', containerId),
    getCommands: () => ipcRenderer.invoke('contributions:getCommands'),
    getMenuContributions: (menuId: string) =>
      ipcRenderer.invoke('contributions:getMenuContributions', menuId),
    getStatusBarItems: () => ipcRenderer.invoke('contributions:getStatusBarItems'),
    executeCommand: (command: string, ...args: any[]) =>
      ipcRenderer.invoke('contributions:executeCommand', command, ...args)
  },

  // Event handling
  events: {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      // Validate channel name to prevent arbitrary IPC access
      const allowedChannels: string[] = [
        ExtensionHostEvents.contributionsChanged,
        ExtensionHostEvents.extensionActivated,
        ExtensionHostEvents.extensionDeactivated,
        ExtensionHostEvents.extensionError,
        'window:show-message'
      ]

      if (allowedChannels.includes(channel)) {
        ipcRenderer.on(channel, listener)
      } else {
        console.warn(`Attempted to listen on unauthorized channel: ${channel}`)
      }
    },

    off: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, listener)
    },

    once: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      const allowedChannels: string[] = [
        ExtensionHostEvents.contributionsChanged,
        ExtensionHostEvents.extensionActivated,
        ExtensionHostEvents.extensionDeactivated,
        ExtensionHostEvents.extensionError,
        'window:show-message'
      ]

      if (allowedChannels.includes(channel)) {
        ipcRenderer.once(channel, listener)
      } else {
        console.warn(`Attempted to listen on unauthorized channel: ${channel}`)
      }
    }
  },

  // File system operations
  fs: {
    readFile: async (filepath: string, options?: { encoding?: string }) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    writeFile: async (filepath: string, data: Uint8Array | string) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    exists: async (filepath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      return false
    },

    mkdir: async (dirpath: string, options?: { recursive?: boolean }) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    readdir: async (dirpath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      return []
    },

    stat: async (filepath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    }
  },

  // System info
  system: {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }
}

// Expose the API to the renderer process
// contextBridge.exposeInMainWorld('electronAPI', electronAPI)
contextBridge.exposeInMainWorld('LLMCANVAS_VERSION', packageJson.version)

// Log that preload script has loaded
console.log('LLM Canvas preload script loaded')

// Handle uncaught errors in the preload script
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in preload script:', error)
})

// Export the interface for TypeScript consumers
export default canvasAPI

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('canvas', canvasAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.canvas = canvasAPI
}
