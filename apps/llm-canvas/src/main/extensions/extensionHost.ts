/* eslint-disable @typescript-eslint/no-explicit-any */
import { fork, ChildProcess } from 'child_process'
import * as path from 'path'
import EventEmitter from 'eventemitter3'
import { ExtensionHostEvents, ExtensionManifest } from '@llm-canvas/sdk'

export interface ExtensionHostOptions {
  extensionsPath: string
  enableDevelopmentMode?: boolean
  maxExtensions?: number
  timeoutMs?: number
}

export interface ExtensionInfo {
  id: string
  manifest: ExtensionManifest
  path: string
  isActive: boolean
  activationEvents: string[]
}

export class ExtensionHost extends EventEmitter {
  private childProcess: ChildProcess | null = null
  private readonly options: Required<ExtensionHostOptions>
  private readonly extensions = new Map<string, ExtensionInfo>()
  private isStarted = false
  private messageId = 0
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
      timeout: NodeJS.Timeout
    }
  >()

  constructor(options: ExtensionHostOptions) {
    super()
    this.options = {
      enableDevelopmentMode: false,
      maxExtensions: 100,
      timeoutMs: 30000,
      ...options
    }
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      return
    }

    const extensionHostScript = path.join(__dirname, 'extensionHostProcess.js')

    this.childProcess = fork(extensionHostScript, [], {
      silent: false,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        ...process.env,
        EXTENSION_HOST_MODE: 'true',
        EXTENSIONS_PATH: this.options.extensionsPath,
        DEVELOPMENT_MODE: this.options.enableDevelopmentMode.toString()
      }
    })

    this.setupChildProcessHandlers()

    // Initialize the extension host
    await this.sendRequest('initialize', {
      extensionsPath: this.options.extensionsPath,
      developmentMode: this.options.enableDevelopmentMode
    })

    this.isStarted = true
    this.emit('started')
  }

  async stop(): Promise<void> {
    if (!this.isStarted || !this.childProcess) {
      return
    }

    // Cancel pending requests
    for (const [, request] of this.pendingRequests.entries()) {
      clearTimeout(request.timeout)
      request.reject(new Error('Extension host stopped'))
    }
    this.pendingRequests.clear()

    // Send shutdown signal
    try {
      await this.sendRequest('shutdown', {}, 5000)
    } catch (error) {
      console.warn('Extension host shutdown timeout:', error)
    }

    // Kill the process
    this.childProcess.kill()
    this.childProcess = null
    this.isStarted = false
    this.emit('stopped')
  }

  async loadExtensions(): Promise<ExtensionInfo[]> {
    const extensions = await this.sendRequest('loadExtensions', {})

    for (const extension of extensions) {
      this.extensions.set(extension.id, extension)
    }

    this.emit('extensionsLoaded', extensions)
    return extensions
  }

  async activateExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${extensionId}`)
    }

    if (extension.isActive) {
      return
    }

    await this.sendRequest('activateExtension', { extensionId })
    extension.isActive = true

    this.emit(ExtensionHostEvents.extensionActivated, extensionId)
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${extensionId}`)
    }

    if (!extension.isActive) {
      return
    }

    await this.sendRequest('deactivateExtension', { extensionId })
    extension.isActive = false

    this.emit(ExtensionHostEvents.extensionDeactivated, extensionId)
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return this.sendRequest('executeCommand', { command, args })
  }

  getExtensions(): ExtensionInfo[] {
    return Array.from(this.extensions.values())
  }

  getExtension(extensionId: string): ExtensionInfo | undefined {
    return this.extensions.get(extensionId)
  }

  private setupChildProcessHandlers(): void {
    if (!this.childProcess) return

    this.childProcess.on('message', (message: any) => {
      this.handleMessage(message)
    })

    this.childProcess.on('error', (error: Error) => {
      console.error('Extension host error:', error)
      this.emit('error', error)
    })

    this.childProcess.on('exit', (code: number, signal: string) => {
      console.log(`Extension host exited with code ${code}, signal ${signal}`)
      this.isStarted = false
      this.emit('exited', { code, signal })
    })

    this.childProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`Extension host stdout: ${data.toString()}`)
    })

    this.childProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Extension host stderr: ${data.toString()}`)
    })
  }

  private handleMessage(message: any): void {
    if (message.type === 'response') {
      const request = this.pendingRequests.get(message.id)
      if (request) {
        clearTimeout(request.timeout)
        this.pendingRequests.delete(message.id)

        if (message.error) {
          request.reject(new Error(message.error))
        } else {
          request.resolve(message.result)
        }
      }
    } else if (message.type === 'notification') {
      this.handleNotification(message)
    }
  }

  private handleNotification(message: any): void {
    switch (message.method) {
      case ExtensionHostEvents.contributionsChanged:
        this.emit(ExtensionHostEvents.contributionsChanged, message.params)
        break
      case ExtensionHostEvents.extensionError:
        this.emit(ExtensionHostEvents.extensionError, message.params)
        break
      case 'log':
        console.log(`Extension: ${message.params.message}`)
        break
      default:
        console.warn('Unknown notification:', message)
    }
  }

  private async sendRequest(method: string, params: any, timeoutMs?: number): Promise<any> {
    if (!this.childProcess) {
      throw new Error('Extension host not started')
    }

    const id = ++this.messageId
    const timeout = timeoutMs || this.options.timeoutMs

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, timeout)

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: timeoutHandle
      })

      this.childProcess!.send({
        type: 'request',
        id,
        method,
        params
      })
    })
  }
}
