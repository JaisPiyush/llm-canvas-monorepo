/* eslint-disable @typescript-eslint/no-this-alias */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ContributionManager } from './contributions/contributionManager'
import { setupContributionIpcHandlers } from './ipc/contributionHandler'
import fs from 'fs'
import { MainProcessViewManager } from './contributions/views/viewManager'

export class LLMCanvasApp {
  private mainWindow: BrowserWindow | null = null
  private contributionManager: ContributionManager | null = null
  private viewManager: MainProcessViewManager | null = null

  constructor() {
    this.setupEventHandlers()
  }

  async initialize(): Promise<void> {
    console.log('Initializing LLM Canvas...')

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.llmcanvas')

    // Create main window
    await this.createMainWindow()

    // Initialize contribution system
    await this.initializeContributionSystem()

    // Setup IPC handlers
    this.setupIpcHandlers()

    console.log('LLM Canvas initialized successfully')
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      icon: icon,
      show: false
    })

    // Load the renderer
    const self = this
    this.mainWindow.on('ready-to-show', () => {
      self.mainWindow!.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private async initializeContributionSystem(): Promise<void> {
    if (!this.mainWindow) {
      throw new Error('Main window must be created before initializing contribution system')
    }

    // Get extensions path - in development, use a local extensions folder
    const extensionsPath = is.dev
      ? path.join(__dirname, '../../extensions')
      : path.join(process.resourcesPath, 'extensions')

    // Create extensions directory if it doesn't exist
    // const fs = import('fs')
    if (!fs.existsSync(extensionsPath)) {
      fs.mkdirSync(extensionsPath, { recursive: true })
    }

    this.contributionManager = new ContributionManager({
      extensionsPath,
      enableDevelopmentMode: is.dev
    })

    await this.contributionManager.initialize(this.mainWindow)

    this.viewManager = new MainProcessViewManager(this.contributionManager!, this.mainWindow!)

    await this.viewManager.initialize()
  }

  private setupEventHandlers(): void {
    app.whenReady().then(() => this.initialize())

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', async () => {
      if (this.mainWindow === null) {
        await this.createMainWindow()
      }
    })

    app.on('before-quit', async () => {
      if (this.contributionManager) {
        await this.contributionManager.shutdown()
      }
    })
  }

  private setupIpcHandlers(): void {
    if (!this.contributionManager) {
      throw new Error('Contribution manager not initialized')
    }

    // Setup contribution-specific IPC handlers
    setupContributionIpcHandlers(this.contributionManager)

    // Window management
    ipcMain.handle(
      'window:show-message',
      (_, type: string, message: string, buttons?: string[]) => {
        // This will be forwarded to the renderer for UI display
        this.mainWindow?.webContents.send('window:show-message', { type, message, buttons })
      }
    )

    // Development helpers
    if (is.dev) {
      ipcMain.handle('dev:reload-extensions', async () => {
        if (this.contributionManager) {
          // In a real implementation, this would reload all extensions
          console.log('Reloading extensions...')
        }
      })

      ipcMain.handle('dev:get-extension-logs', async () => {
        // Return extension logs for debugging
        return []
      })
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getContributionManager(): ContributionManager | null {
    return this.contributionManager
  }

  getViewManager(): MainProcessViewManager | null {
    return this.viewManager
  }
}

// Initialize the application
const llmCanvasApp = new LLMCanvasApp()

// Handle app events
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

export default llmCanvasApp
