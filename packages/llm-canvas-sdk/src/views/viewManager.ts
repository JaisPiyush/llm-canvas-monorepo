
import EventEmitter from 'eventemitter3'
import {
  ViewRegistry,

} from './viewRegistry'

import { ContributionRegistry } from '../contribution'

import {
  ViewContainerLocation,
  ViewInstance,
  ViewProvider,
  TreeDataProvider,
  WebviewOptions,
  TreeView,
  WebviewView,
  ExtensionHostEvents
} from '../types'
import { ContextEvaluator } from '../contribution/contextEvaluator'

export interface ViewManagerOptions {
  contributionRegistry: ContributionRegistry
  viewRegistry: ViewRegistry
  contextEvaluator: ContextEvaluator
}

export interface ViewLayout {
  containerId: string
  location: ViewContainerLocation
  views: ViewLayoutItem[]
  collapsed: boolean
  size?: number
}

export interface ViewLayoutItem {
  viewId: string
  size?: number
  collapsed: boolean
  visible: boolean
  position: number
}

export interface ViewContext {
  viewId: string
  containerId: string
  extensionId: string
  active: boolean
  visible: boolean
  focused: boolean
}

export class ViewManager extends EventEmitter {
  private readonly contributionRegistry: ContributionRegistry
  private readonly viewRegistry: ViewRegistry
  private readonly contextEvaluator: ContextEvaluator
  private readonly activeViews = new Map<string, ViewInstance>()
  private readonly viewContexts = new Map<string, ViewContext>()
  private currentLayout = new Map<string, ViewLayout>()
  private focusedViewId: string | null = null

  constructor(options: ViewManagerOptions) {
    super()
    this.contributionRegistry = options.contributionRegistry
    this.viewRegistry = options.viewRegistry
    this.contextEvaluator = options.contextEvaluator

    this.setupEventHandlers()
  }

  /**
   * Initialize view manager
   */
  async initialize(): Promise<void> {
    // Load existing view contributions
    await this.refreshViews()

    // Set up context keys for views
    this.contextEvaluator.registerContextKey({
      key: 'view',
      type: 'string',
      description: 'Currently active view ID',
      defaultValue: ''
    })

    this.contextEvaluator.registerContextKey({
      key: 'viewItem',
      type: 'string',
      description: 'Selected view item context value',
      defaultValue: ''
    })
  }

  /**
   * Register a view provider
   */
  registerViewProvider<T = any>(
    viewType: string,
    provider: ViewProvider,
    options?: {
      webviewOptions?: WebviewOptions
      treeDataProvider?: TreeDataProvider<T>
    }
  ): { dispose(): void } {
    return this.viewRegistry.registerViewProvider(viewType, provider, options)
  }

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
    const treeView = this.viewRegistry.createTreeView(viewId, options)

    // Update context when selection changes
    const disposable = treeView.onDidChangeSelection(event => {
      if (event.selection.length > 0) {
        // Assume first selected item has contextValue
        const contextValue = (event.selection[0] as any)?.contextValue || ''
        this.contextEvaluator.setContext('viewItem', contextValue)
      }
    })

    const view = this.viewRegistry.getView(viewId)
    if (view) {
      view.disposables.push(disposable)
    }

    return treeView
  }

  /**
   * Create a webview view
   */
  createWebviewView(viewId: string, options: WebviewOptions = {}): WebviewView {
    return this.viewRegistry.createWebviewView(viewId, options)
  }

  /**
   * Show view in specified container
   */
  async showView(viewId: string, containerId?: string, options?: {
    preserveFocus?: boolean
    reveal?: boolean
  }): Promise<void> {
    const view = this.viewRegistry.getView(viewId)
    if (!view) {
      throw new Error(`View not found: ${viewId}`)
    }

    // Check when condition
    if (view.when && !this.contextEvaluator.evaluate(view.when)) {
      console.log(`View ${viewId} when condition not met: ${view.when}`)
      return
    }

    // Use provided container or view's default container
    const targetContainerId = containerId || view.containerId

    // Ensure container exists
    const container = this.contributionRegistry.getViewContainer(targetContainerId)
    if (!container) {
      throw new Error(`View container not found: ${targetContainerId}`)
    }

    // Update view visibility and activation
    this.viewRegistry.setViewVisibility(viewId, true)
    
    if (!options?.preserveFocus) {
      await this.setActiveView(viewId)
    }

    // Update layout
    await this.updateViewLayout(viewId, targetContainerId, {
      visible: true,
      collapsed: false
    })

    this.emit('viewShown', { viewId, containerId: targetContainerId })
  }

  /**
   * Hide view
   */
  async hideView(viewId: string): Promise<void> {
    const view = this.viewRegistry.getView(viewId)
    if (!view) return

    this.viewRegistry.setViewVisibility(viewId, false)
    
    // If this was the active view, deactivate it
    if (this.focusedViewId === viewId) {
      this.focusedViewId = null
      this.contextEvaluator.setContext('view', '')
    }

    // Update layout
    await this.updateViewLayout(viewId, view.containerId, {
      visible: false
    })

    this.emit('viewHidden', { viewId })
  }

  /**
   * Set active view (focused)
   */
  async setActiveView(viewId: string): Promise<void> {
    const view = this.viewRegistry.getView(viewId)
    if (!view) return

    // Deactivate previous active view
    if (this.focusedViewId) {
      this.viewRegistry.setViewActive(this.focusedViewId, false)
      const prevContext = this.viewContexts.get(this.focusedViewId)
      if (prevContext) {
        prevContext.active = false
        prevContext.focused = false
      }
    }

    // Activate new view
    this.focusedViewId = viewId
    this.viewRegistry.setViewActive(viewId, true)
    this.contextEvaluator.setContext('view', viewId)

    // Update context
    const context = this.viewContexts.get(viewId) || this.createViewContext(view)
    context.active = true
    context.focused = true
    this.viewContexts.set(viewId, context)

    this.emit('activeViewChanged', { viewId, view })
  }

  /**
   * Toggle view visibility
   */
  async toggleView(viewId: string): Promise<void> {
    const view = this.viewRegistry.getView(viewId)
    if (!view) return

    if (view.isVisible) {
      await this.hideView(viewId)
    } else {
      await this.showView(viewId)
    }
  }

  /**
   * Reveal view and optionally focus element
   */
  async revealView<T>(
    viewId: string,
    element?: T,
    options?: {
      select?: boolean
      focus?: boolean
      expand?: boolean | number
    }
  ): Promise<void> {
    await this.showView(viewId, undefined, { reveal: true })

    const view = this.viewRegistry.getView(viewId)
    if (view?.treeView && element) {
      await view.treeView.reveal(element, options)
    }
  }

  /**
   * Get view layout for container
   */
  getViewLayout(containerId: string): ViewLayout | undefined {
    return this.currentLayout.get(containerId)
  }

  /**
   * Update view layout
   */
  private async updateViewLayout(
    viewId: string,
    containerId: string,
    changes: Partial<ViewLayoutItem>
  ): Promise<void> {
    let layout = this.currentLayout.get(containerId)
    
    if (!layout) {
      layout = {
        containerId,
        location: this.getContainerLocation(containerId),
        views: [],
        collapsed: false
      }
      this.currentLayout.set(containerId, layout)
    }

    // Find or create view layout item
    let viewItem = layout.views.find(v => v.viewId === viewId)
    if (!viewItem) {
      const view = this.viewRegistry.getView(viewId)
      viewItem = {
        viewId,
        size: view?.state?.size,
        collapsed: view?.state?.collapsed || false,
        visible: view?.isVisible || false,
        position: view?.state?.position || layout.views.length
      }
      layout.views.push(viewItem)
    }

    // Apply changes
    Object.assign(viewItem, changes)

    // Sort views by position
    layout.views.sort((a, b) => a.position - b.position)

    this.emit('layoutChanged', { containerId, layout })
  }

  /**
   * Refresh all views from contributions
   */
  async refreshViews(): Promise<void> {
    // Get all view contributions
    const containers = this.contributionRegistry.getViewContainers()
    
    for (const container of containers) {
      const views = this.contributionRegistry.getViews(container.id)
      
      for (const viewContribution of views) {
        // Check if view already exists
        const existingView = this.viewRegistry.getView(
          `${viewContribution.extensionId}.${viewContribution.id}`
        )

        if (!existingView) {
          // Register new view
          const viewInstance = this.viewRegistry.registerView(
            viewContribution.extensionId,
            viewContribution
          )

          // Create view context
          this.viewContexts.set(viewInstance.id, this.createViewContext(viewInstance))

          // Update layout
          await this.updateViewLayout(viewInstance.id, container.id, {
            visible: viewContribution.visibility !== 'hidden',
            collapsed: viewContribution.visibility === 'collapsed',
            position: viewContribution.order || 0
          })
        }
      }
    }
  }

  /**
   * Handle view refresh
   */
  async refreshView(viewId: string): Promise<void> {
    await this.viewRegistry.refreshView(viewId)
    this.emit('viewRefreshed', { viewId })
  }

  /**
   * Get all views in container
   */
  getViewsInContainer(containerId: string): ViewInstance[] {
    return this.viewRegistry.getViewsByContainer(containerId)
  }

  /**
   * Get active view
   */
  getActiveView(): ViewInstance | null {
    return this.focusedViewId ? this.viewRegistry.getView(this.focusedViewId) || null : null
  }

  /**
   * Get view context
   */
  getViewContext(viewId: string): ViewContext | undefined {
    return this.viewContexts.get(viewId)
  }

  /**
   * Dispose view manager
   */
  dispose(): void {
    this.viewRegistry.dispose()
    this.currentLayout.clear()
    this.viewContexts.clear()
    this.activeViews.clear()
    this.removeAllListeners()
  }

  private setupEventHandlers(): void {
    // Listen to contribution changes
    this.contributionRegistry.on(ExtensionHostEvents.contributionsRegistered, () => {
      this.refreshViews()
    })

    this.contributionRegistry.on(ExtensionHostEvents.contributionsUnregistered, (event) => {
      // Remove views from unregistered extension
      const viewsToRemove = this.viewRegistry.getAllViews()
        .filter(view => view.extensionId === event.extensionId)

      for (const view of viewsToRemove) {
        this.viewRegistry.unregisterView(view.id)
        this.viewContexts.delete(view.id)
        
        // Update layout
        const layout = this.currentLayout.get(view.containerId)
        if (layout) {
          layout.views = layout.views.filter(v => v.viewId !== view.id)
        }
      }
    })

    // Listen to view registry events
    this.viewRegistry.on('viewRegistered', ({ view }) => {
      this.emit('viewRegistered', { view })
    })

    this.viewRegistry.on('viewUnregistered', ({ view }) => {
      this.emit('viewUnregistered', { view })
    })

    this.viewRegistry.on('viewVisibilityChanged', ({ view, visible }) => {
      const context = this.viewContexts.get(view.id)
      if (context) {
        context.visible = visible
      }
      this.emit('viewVisibilityChanged', { view, visible })
    })

    this.viewRegistry.on('viewActiveChanged', ({ view, active }) => {
      const context = this.viewContexts.get(view.id)
      if (context) {
        context.active = active
      }
      this.emit('viewActiveChanged', { view, active })
    })
  }

  private createViewContext(view: ViewInstance): ViewContext {
    return {
      viewId: view.id,
      containerId: view.containerId,
      extensionId: view.extensionId,
      active: view.isActive,
      visible: view.isVisible,
      focused: false
    }
  }

  private getContainerLocation(containerId: string): ViewContainerLocation {
    const container = this.contributionRegistry.getViewContainer(containerId)
    return container?.location || ViewContainerLocation.Sidebar
  }
}