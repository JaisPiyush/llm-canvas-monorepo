/* eslint-disable @typescript-eslint/no-explicit-any */
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { ContributionRegistry, ContributionLoader, ExtensionHostEvents } from '@llm-canvas/sdk'
import { ExtensionHost, ExtensionInfo } from '../extensions/extensionHost'
import { BrowserWindow } from 'electron'

export interface ContributionManagerOptions {
  extensionsPath: string
  enableDevelopmentMode?: boolean
}

export class ContributionManager extends SafeEventEmitter {
  private readonly contributionRegistry: ContributionRegistry
  private readonly contributionLoader: ContributionLoader
  private readonly extensionHost: ExtensionHost
  private mainWindow: BrowserWindow | null = null

  constructor(options: ContributionManagerOptions) {
    super()

    this.contributionRegistry = new ContributionRegistry({
      enableValidation: true,
      enableConflictResolution: true
    })

    this.contributionLoader = new ContributionLoader(this.contributionRegistry)

    this.extensionHost = new ExtensionHost({
      extensionsPath: options.extensionsPath,
      enableDevelopmentMode: options.enableDevelopmentMode
    })

    this.setupEventHandlers()
  }

  async initialize(mainWindow: BrowserWindow): Promise<void> {
    this.mainWindow = mainWindow

    // Start extension host
    await this.extensionHost.start()

    // Load extensions
    const extensions = await this.extensionHost.loadExtensions()

    // Process contributions from loaded extensions
    for (const extension of extensions) {
      try {
        await this.contributionLoader.loadContributions(extension.manifest)
      } catch (error) {
        console.error(`Failed to load contributions for ${extension.id}:`, error)
      }
    }

    // Auto-activate extensions based on activation events
    await this.processActivationEvents(['onStartup'])

    console.log(`Loaded ${extensions.length} extensions with contributions`)
  }

  async shutdown(): Promise<void> {
    await this.extensionHost.stop()
    this.contributionRegistry.dispose()
  }

  async activateExtension(extensionId: string): Promise<void> {
    await this.extensionHost.activateExtension(extensionId)
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    await this.extensionHost.deactivateExtension(extensionId)
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return this.extensionHost.executeCommand(command, ...args)
  }

  getContributionRegistry(): ContributionRegistry {
    return this.contributionRegistry
  }

  getExtensions(): ExtensionInfo[] {
    return this.extensionHost.getExtensions()
  }

  private setupEventHandlers(): void {
    // Listen for contribution changes from extension host
    this.extensionHost.on(ExtensionHostEvents.contributionsChanged, (event) => {
      this.handleContributionChange(event)
    })

    // Listen for contribution registry changes
    this.contributionRegistry.on(ExtensionHostEvents.contributionsRegistered, (event) => {
      this.notifyRenderer(ExtensionHostEvents.contributionsChanged, event)
    })

    this.contributionRegistry.on(ExtensionHostEvents.contributionsUnregistered, (event) => {
      this.notifyRenderer(ExtensionHostEvents.contributionsChanged, event)
    })

    // Listen for extension activation events
    this.extensionHost.on(ExtensionHostEvents.extensionActivated, (extensionId) => {
      this.notifyRenderer(ExtensionHostEvents.extensionActivated, { extensionId })
    })

    this.extensionHost.on(ExtensionHostEvents.extensionDeactivated, (extensionId) => {
      this.notifyRenderer(ExtensionHostEvents.extensionDeactivated, { extensionId })
    })
  }

  private handleContributionChange(event: any): void {
    // Process contribution changes from extension host
    if (event.type === 'added') {
      // Extension was activated, contributions were already loaded during initialization
      console.log(`Contributions activated for extension: ${event.extensionId}`)
    } else if (event.type === 'removed') {
      // Extension was deactivated, remove its contributions
      this.contributionRegistry.unregisterExtensionContributions(event.extensionId)
    }
  }

  private async processActivationEvents(events: string[]): Promise<void> {
    const extensions = this.extensionHost.getExtensions()

    for (const extension of extensions) {
      if (extension.isActive) continue

      const shouldActivate = extension.activationEvents.some((event) => events.includes(event))

      if (shouldActivate) {
        try {
          await this.extensionHost.activateExtension(extension.id)
        } catch (error) {
          console.error(`Failed to activate extension ${extension.id}:`, error)
        }
      }
    }
  }

  private notifyRenderer(channel: string, data: any): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}
