import {
  TreeDataProvider,
  TreeView,
  ViewProvider,
  WebviewOptions,
  WebviewView
} from '@llm-canvas/sdk'
import { MainProcessViewManager } from '../contributions/views/viewManager'

export class ExtensionViewAPI {
  constructor(
    private extensionId: string,
    private viewManager: MainProcessViewManager
  ) {}

  /**
   * Create a tree view
   */
  createTreeView<T>(
    viewId: string,
    options: {
      treeDataProvider: TreeDataProvider<T>
      showCollapseAll?: boolean
      canSelectMany?: boolean
    }
  ): TreeView<T> {
    const fullViewId = `${this.extensionId}.${viewId}`
    return this.viewManager.getViewManager().createTreeView(fullViewId, options)
  }

  /**
   * Create a webview view
   */
  createWebviewView(viewId: string, options: WebviewOptions = {}): WebviewView {
    const fullViewId = `${this.extensionId}.${viewId}`
    return this.viewManager.getViewManager().createWebviewView(fullViewId, options)
  }

  /**
   * Register a view provider
   */
  registerViewProvider<T>(
    viewType: string,
    provider: ViewProvider,
    options?: {
      webviewOptions?: WebviewOptions
      treeDataProvider?: TreeDataProvider<T>
    }
  ): { dispose: () => void } {
    return this.viewManager.getViewManager().registerViewProvider(viewType, provider, options)
  }

  /**
   * Show a view
   */
  async showView(viewId: string, containerId?: string): Promise<void> {
    const fullViewId = `${this.extensionId}.${viewId}`
    return this.viewManager.getViewManager().showView(fullViewId, containerId)
  }

  /**
   * Hide a view
   */
  async hideView(viewId: string): Promise<void> {
    const fullViewId = `${this.extensionId}.${viewId}`
    return this.viewManager.getViewManager().hideView(fullViewId)
  }

  /**
   * Reveal an element in a tree view
   */
  async revealInView<T>(
    viewId: string,
    element: T,
    options?: {
      select?: boolean
      focus?: boolean
      expand?: boolean | number
    }
  ): Promise<void> {
    const fullViewId = `${this.extensionId}.${viewId}`
    return this.viewManager.getViewManager().revealView(fullViewId, element, options)
  }
}
