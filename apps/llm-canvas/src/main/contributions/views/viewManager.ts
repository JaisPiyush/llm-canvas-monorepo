/* eslint-disable @typescript-eslint/no-explicit-any */
import { ViewManager as SDKViewManager, ViewRegistry } from '@llm-canvas/sdk'
import { ContributionManager } from '../contributionManager'
import { BrowserWindow, ipcMain } from 'electron'

export class MainProcessViewManager {
  private viewManager: SDKViewManager
  private viewRegistry: ViewRegistry

  constructor(
    private contributionManager: ContributionManager,
    private mainWindow: BrowserWindow
  ) {
    this.viewRegistry = new ViewRegistry()
    this.viewManager = new SDKViewManager({
      contributionRegistry: contributionManager.getContributionRegistry(),
      viewRegistry: this.viewRegistry,
      contextEvaluator: contributionManager.getContributionRegistry().contextEvaluator
    })

    this.setupIpcHandlers()
    this.setupEventForwarding()
  }

  async initialize(): Promise<void> {
    await this.viewManager.initialize()
  }

  private setupIpcHandlers(): void {
    // View management
    ipcMain.handle('views:show', async (_, viewId: string, containerId?: string) => {
      return this.viewManager.showView(viewId, containerId)
    })

    ipcMain.handle('views:hide', async (_, viewId: string) => {
      return this.viewManager.hideView(viewId)
    })

    ipcMain.handle('views:toggle', async (_, viewId: string) => {
      return this.viewManager.toggleView(viewId)
    })

    ipcMain.handle('views:setActive', async (_, viewId: string) => {
      return this.viewManager.setActiveView(viewId)
    })

    ipcMain.handle('views:refresh', async (_, viewId: string) => {
      return this.viewManager.refreshView(viewId)
    })

    ipcMain.handle('views:reveal', async (_, viewId: string, element?: any, options?: any) => {
      return this.viewManager.revealView(viewId, element, options)
    })

    // Layout management
    ipcMain.handle('views:getLayout', async (_, containerId: string) => {
      return this.viewManager.getViewLayout(containerId)
    })

    ipcMain.handle('views:getViewsInContainer', async (_, containerId: string) => {
      return this.viewManager.getViewsInContainer(containerId)
    })

    ipcMain.handle('views:getActiveView', async () => {
      return this.viewManager.getActiveView()
    })

    ipcMain.handle('views:getViewContext', async (_, viewId: string) => {
      return this.viewManager.getViewContext(viewId)
    })

    // Tree view operations
    ipcMain.handle('treeView:getChildren', async (_, viewId: string, element?: any) => {
      const view = this.viewRegistry.getView(viewId)
      if (view?.treeView) {
        return view.treeView.dataProvider.getChildren(element)
      }
      return []
    })

    ipcMain.handle('treeView:getTreeItem', async (_, viewId: string, element: any) => {
      const view = this.viewRegistry.getView(viewId)
      if (view?.treeView) {
        return view.treeView.dataProvider.getTreeItem(element)
      }
      return null
    })

    ipcMain.handle('treeView:reveal', async (_, viewId: string, element: any, options?: any) => {
      const view = this.viewRegistry.getView(viewId)
      if (view?.treeView) {
        return view.treeView.reveal(element, options)
      }
    })

    // Webview operations
    ipcMain.handle('webview:postMessage', async (_, viewId: string, message: any) => {
      const view = this.viewRegistry.getView(viewId)
      if (view?.webview) {
        return view.webview.webview.postMessage(message)
      }
      return false
    })

    ipcMain.handle('webview:setHtml', async (_, viewId: string, html: string) => {
      const view = this.viewRegistry.getView(viewId)
      if (view?.webview) {
        view.webview.webview.html = html
        return true
      }
      return false
    })
  }

  private setupEventForwarding(): void {
    // Forward view events to renderer
    this.viewManager.on('viewShown', (data) => {
      this.mainWindow.webContents.send('views:viewShown', data)
    })

    this.viewManager.on('viewHidden', (data) => {
      this.mainWindow.webContents.send('views:viewHidden', data)
    })

    this.viewManager.on('activeViewChanged', (data) => {
      this.mainWindow.webContents.send('views:activeViewChanged', data)
    })

    this.viewManager.on('viewRegistered', (data) => {
      this.mainWindow.webContents.send('views:viewRegistered', data)
    })

    this.viewManager.on('viewUnregistered', (data) => {
      this.mainWindow.webContents.send('views:viewUnregistered', data)
    })

    this.viewManager.on('layoutChanged', (data) => {
      this.mainWindow.webContents.send('views:layoutChanged', data)
    })

    this.viewManager.on('viewRefreshed', (data) => {
      this.mainWindow.webContents.send('views:viewRefreshed', data)
    })

    this.viewManager.on('viewVisibilityChanged', (data) => {
      this.mainWindow.webContents.send('views:visibilityChanged', data)
    })

    this.viewManager.on('viewActiveChanged', (data) => {
      this.mainWindow.webContents.send('views:activeChanged', data)
    })
  }

  getViewManager(): SDKViewManager {
    return this.viewManager
  }

  getViewRegistry(): ViewRegistry {
    return this.viewRegistry
  }

  dispose(): void {
    this.viewManager.dispose()
  }
}