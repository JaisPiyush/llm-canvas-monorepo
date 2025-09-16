/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as path from 'path'
import { ExtensionHostEvents, ExtensionManifest, CanvasManifest } from '@llm-canvas/sdk'

interface ExtensionContext {
  subscriptions: Array<{ dispose(): void }>
  extensionPath: string
  globalState: any
  workspaceState: any
}

interface LoadedExtension {
  id: string
  manifest: ExtensionManifest
  path: string
  context: ExtensionContext
  module: any
  isActive: boolean
}

class ExtensionHostProcess {
  private extensions = new Map<string, LoadedExtension>()
  private extensionsPath = ''
  private developmentMode = false
  private api: any

  async initialize(params: { extensionsPath: string; developmentMode: boolean }): Promise<void> {
    // TODO: Update this for using settings configuration
    this.extensionsPath = params.extensionsPath
    this.developmentMode = params.developmentMode

    // Create the extension API
    this.api = this.createExtensionAPI()

    // Set up global error handling
    process.on('uncaughtException', (error) => {
      this.sendNotification(ExtensionHostEvents.extensionError, {
        error: error.message,
        stack: error.stack
      })
    })

    console.log('Extension host initialized')
  }

  async loadExtensions(): Promise<any[]> {
    const extensionDirs = await this.findExtensionDirectories()
    const extensions: {
      id: string
      manifest: ExtensionManifest
      path: string
      isActive: boolean
      activationEvents: string[]
    }[] = []

    for (const dir of extensionDirs) {
      try {
        const manifestJsonPath = path.join(dir, 'manifest.json')
        const manifestJsonContent = await fs.promises.readFile(manifestJsonPath, 'utf8')
        const manifest: CanvasManifest = JSON.parse(manifestJsonContent)
        if (!manifest.name || !manifest.publisher) {
          throw new Error('Invalid extension manifest: missing name or publisher')
        }

        if (manifest.extensions === undefined || manifest.extensions!.length === 0) {
          continue
        }

        for (const extensionManifest of manifest.extensions) {
          extensionManifest.name = `${manifest.publisher}.${extensionManifest.name}`
          const extension = await this.loadExtension(extensionManifest, dir)
          if (extension) {
            extensions.push({
              id: extension.id,
              manifest: extension.manifest,
              path: extension.path,
              isActive: extension.isActive,
              activationEvents: extension.manifest.activationEvents || []
            })
          }
        }
      } catch (error) {
        console.error(`Failed to load extension from ${dir}:`, error)
        this.sendNotification(ExtensionHostEvents.extensionError, {
          path: dir,
          error: (error as any).message
        })
      }
    }

    return extensions
  }

  async activateExtension(params: { extensionId: string }): Promise<void> {
    const extension = this.extensions.get(params.extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${params.extensionId}`)
    }

    if (extension.isActive) {
      return
    }

    try {
      // Load the extension module
      const modulePath = path.join(extension.path, extension.manifest.main || 'extension.js')
      delete require.cache[modulePath] // Clear cache for hot reload

      // TODO: Advanced this to move away from package.json reliance to manifest.json. Write custom loader.
      extension.module = import(modulePath)

      // Call activate function
      if (typeof extension.module.activate === 'function') {
        await extension.module.activate(extension.context)
      }

      extension.isActive = true

      // Send contributions to main process
      if (extension.manifest.contributes) {
        this.sendNotification(ExtensionHostEvents.contributionsChanged, {
          extensionId: extension.id,
          type: 'added',
          contributions: extension.manifest.contributes
        })
      }

      console.log(`Extension activated: ${extension.id}`)
    } catch (error) {
      console.error(`Failed to activate extension ${extension.id}:`, error)
      throw error
    }
  }

  async deactivateExtension(params: { extensionId: string }): Promise<void> {
    const extension = this.extensions.get(params.extensionId)
    if (!extension || !extension.isActive) {
      return
    }

    try {
      // Call deactivate function
      if (extension.module && typeof extension.module.deactivate === 'function') {
        await extension.module.deactivate()
      }

      // Dispose all subscriptions
      for (const subscription of extension.context.subscriptions) {
        try {
          subscription.dispose()
        } catch (error) {
          console.error('Error disposing subscription:', error)
        }
      }
      extension.context.subscriptions = []

      extension.isActive = false
      extension.module = null

      // Notify main process
      this.sendNotification(ExtensionHostEvents.contributionsChanged, {
        extensionId: extension.id,
        type: 'removed'
      })

      console.log(`Extension deactivated: ${extension.id}`)
    } catch (error) {
      console.error(`Failed to deactivate extension ${extension.id}:`, error)
      throw error
    }
  }

  async executeCommand(params: { command: string; args: any[] }): Promise<any> {
    // Find the extension that provides this command
    for (const extension of this.extensions.values()) {
      if (extension.isActive && extension.manifest.contributes?.commands) {
        const commandDef = extension.manifest.contributes.commands.find(
          (c) => c.command === params.command
        )

        if (commandDef && extension.module) {
          // Execute the command through the extension's API
          return this.api.commands.executeCommand(params.command, ...params.args)
        }
      }
    }

    throw new Error(`Command not found: ${params.command}`)
  }

  private async findExtensionDirectories(): Promise<string[]> {
    if (!fs.existsSync(this.extensionsPath)) {
      return []
    }

    const entries = await fs.promises.readdir(this.extensionsPath, { withFileTypes: true })
    const directories: string[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const extensionPath = path.join(this.extensionsPath, entry.name)
        const manifestPath = path.join(extensionPath, 'manifest.json')

        if (fs.existsSync(manifestPath)) {
          directories.push(extensionPath)
        }
      }
    }

    return directories
  }

  private async loadExtension(
    extensionManifest: ExtensionManifest,
    extensionPath: string
  ): Promise<LoadedExtension | null> {
    try {
      const extensionId = extensionManifest.name

      // Create extension context
      const context: ExtensionContext = {
        subscriptions: [],
        extensionPath,
        globalState: new Map(),
        workspaceState: new Map()
      }

      const extension: LoadedExtension = {
        id: extensionId,
        manifest: extensionManifest,
        path: extensionPath,
        context,
        module: null,
        isActive: false
      }

      this.extensions.set(extensionId, extension)
      return extension
    } catch (error) {
      console.error(`Failed to load extension manifest from ${extensionPath}:`, error)
      return null
    }
  }

  private createExtensionAPI(): any {
    // This would be the full extension API implementation
    // For now, we'll create a basic stub
    return {
      commands: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        registerCommand: (command: string, _callback: (...args: any[]) => any) => {
          // Implementation would register command handler
          console.log(`Command registered: ${command}`)
          return { dispose: () => {} }
        },
        executeCommand: (command: string, ...args: any[]) => {
          // Implementation would execute command
          console.log(`Command executed: ${command}`, args)
        }
      },
      window: {
        showInformationMessage: (message: string) => {
          console.log(`Info: ${message}`)
        },
        showErrorMessage: (message: string) => {
          console.error(`Error: ${message}`)
        }
      }
    }
  }

  private sendNotification(method: string, params: any): void {
    if (process.send) {
      process.send({
        type: 'notification',
        method,
        params
      })
    }
  }

  private sendResponse(id: number, result?: any, error?: string): void {
    if (process.send) {
      process.send({
        type: 'response',
        id,
        result,
        error
      })
    }
  }
}

// Main message handler
const extensionHost = new ExtensionHostProcess()

process.on('message', async (message: any) => {
  if (message.type === 'request') {
    try {
      let result

      switch (message.method) {
        case 'initialize':
          result = await extensionHost.initialize(message.params)
          break
        case 'loadExtensions':
          result = await extensionHost.loadExtensions()
          break
        case 'activateExtension':
          result = await extensionHost.activateExtension(message.params)
          break
        case 'deactivateExtension':
          result = await extensionHost.deactivateExtension(message.params)
          break
        case 'executeCommand':
          result = await extensionHost.executeCommand(message.params)
          break
        case 'shutdown':
          process.exit(0)
          break
        default:
          throw new Error(`Unknown method: ${message.method}`)
      }

      process.send!({
        type: 'response',
        id: message.id,
        result
      })
    } catch (error) {
      process.send!({
        type: 'response',
        id: message.id,
        error: (error as any).message
      })
    }
  }
})
