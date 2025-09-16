/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ContributionManager } from '../contributions/contributionManager'
import { ViewContainerLocation } from '@llm-canvas/sdk'

export function setupContributionIpcHandlers(contributionManager: ContributionManager): void {
  // Get view containers
  ipcMain.handle(
    'contributions:getViewContainers',
    async (_event: IpcMainInvokeEvent, location?: ViewContainerLocation) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getViewContainers(location as ViewContainerLocation | undefined)
    }
  )

  // Get views
  ipcMain.handle(
    'contributions:getViews',
    async (_event: IpcMainInvokeEvent, containerId?: string) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getViews(containerId)
    }
  )

  // Get commands
  ipcMain.handle('contributions:getCommands', async () => {
    const registry = contributionManager.getContributionRegistry()
    return registry.getCommands()
  })

  // Get menu contributions
  ipcMain.handle(
    'contributions:getMenuContributions',
    async (_event: IpcMainInvokeEvent, menuId: string) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getMenuContributions(menuId)
    }
  )

  // Get status bar items
  ipcMain.handle('contributions:getStatusBarItems', async () => {
    const registry = contributionManager.getContributionRegistry()
    return registry.getStatusBarItems()
  })

  // Execute command
  ipcMain.handle(
    'contributions:executeCommand',
    async (_event: IpcMainInvokeEvent, command: string, ...args: any[]) => {
      return contributionManager.executeCommand(command, ...args)
    }
  )

  // Extension management
  ipcMain.handle('extensions:list', async () => {
    return contributionManager.getExtensions()
  })

  ipcMain.handle('extensions:activate', async (_event: IpcMainInvokeEvent, extensionId: string) => {
    return contributionManager.activateExtension(extensionId)
  })

  ipcMain.handle(
    'extensions:deactivate',
    async (_event: IpcMainInvokeEvent, extensionId: string) => {
      return contributionManager.deactivateExtension(extensionId)
    }
  )
}
