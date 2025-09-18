
import EventEmitter from 'eventemitter3'
import {
  ResolvedViewContribution,
  ViewType,
  ContributionError,
  TreeDataProvider,
  TreeView,
  TreeViewSelectionChangeEvent,
  TreeViewVisibilityChangeEvent,
  ViewInstance,
  ViewProvider,
  ViewRegistryOptions,
  ViewState,
  Webview,
  WebviewOptions,
  WebviewView,
  DisposableEvent
} from '../types'
import { DisposableEventEmitter } from '../disposableEventEmitter'



export class ViewRegistry extends EventEmitter {
  private readonly options: Required<ViewRegistryOptions>
  private readonly views = new Map<string, ViewInstance>()
  private readonly viewsByContainer = new Map<string, Set<string>>()
  private readonly providers = new Map<string, ViewProvider>()
  private isDisposed = false

  constructor(options: ViewRegistryOptions = {}) {
    super()
    this.options = {
      enableValidation: true,
      maxViewsPerContainer: 50,
      ...options
    }
  }

  /**
   * Register a view from contribution
   */
  registerView(
    extensionId: string,
    contribution: ResolvedViewContribution
  ): ViewInstance {
    if (this.isDisposed) {
      throw new Error('ViewRegistry has been disposed')
    }

    if (this.options.enableValidation) {
      this.validateViewContribution(contribution)
    }

    const viewInstance: ViewInstance = {
      id: `${extensionId}.${contribution.id}`,
      extensionId,
      viewId: contribution.id,
      containerId: contribution.containerId,
      type: contribution.type || ViewType.Custom,
      isVisible: true,
      isActive: false,
      title: contribution.name,
      description: contribution.contextualTitle,
      when: contribution.when,
      state: {
        collapsed: contribution.visibility === 'collapsed',
        size: contribution.size,
        position: contribution.order
      },
      disposables: []
    }

    // Check container view limits
    const containerViews = this.viewsByContainer.get(contribution.containerId)
    if (containerViews && containerViews.size >= this.options.maxViewsPerContainer) {
      throw new ContributionError(
        `Container ${contribution.containerId} has reached maximum view limit`,
        extensionId,
        'view',
        contribution.id
      )
    }

    this.views.set(viewInstance.id, viewInstance)

    // Update container tracking
    if (!this.viewsByContainer.has(contribution.containerId)) {
      this.viewsByContainer.set(contribution.containerId, new Set())
    }
    this.viewsByContainer.get(contribution.containerId)!.add(viewInstance.id)

    this.emit('viewRegistered', { view: viewInstance })
    return viewInstance
  }

  /**
   * Unregister a view
   */
  unregisterView(viewId: string): void {
    const view = this.views.get(viewId)
    if (!view) return

    // Dispose view resources
    this.disposeView(view)

    // Remove from tracking
    this.views.delete(viewId)
    const containerViews = this.viewsByContainer.get(view.containerId)
    if (containerViews) {
      containerViews.delete(viewId)
      if (containerViews.size === 0) {
        this.viewsByContainer.delete(view.containerId)
      }
    }

    this.emit('viewUnregistered', { view })
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
  ): { dispose(): void } {
    if (this.providers.has(viewType)) {
      throw new Error(`View provider already registered for type: ${viewType}`)
    }

    this.providers.set(viewType, provider)

    // If there are existing views of this type, resolve them
    for (const view of this.views.values()) {
        if (view.type === viewType && !view.provider) {
            this.resolveViewProvider(view, provider, options)
          }
    }


    return {
      dispose: () => {
        this.providers.delete(viewType)
        provider.dispose?.()
      }
    }
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
      dragAndDropController?: TreeDragAndDropController<T>
    }
  ): TreeView<T> {
    const view = this.views.get(viewId)
    if (!view) {
      throw new Error(`View not found: ${viewId}`)
    }

    const treeView = new TreeViewImpl(view, options)
    view.treeView = treeView
    view.type = ViewType.Tree

    return treeView
  }

  /**
   * Create a webview view
   */
  createWebviewView(
    viewId: string,
    options: WebviewOptions = {}
  ): WebviewView {
    const view = this.views.get(viewId)
    if (!view) {
      throw new Error(`View not found: ${viewId}`)
    }

    const webviewView = new WebviewViewImpl(view, options)
    view.webview = webviewView
    view.type = ViewType.Webview

    return webviewView
  }

  /**
   * Get view by ID
   */
  getView(viewId: string): ViewInstance | undefined {
    return this.views.get(viewId)
  }

  /**
   * Get views by container
   */
  getViewsByContainer(containerId: string): ViewInstance[] {
    const viewIds = this.viewsByContainer.get(containerId)
    if (!viewIds) return []

    return Array.from(viewIds)
      .map(id => this.views.get(id))
      .filter((view): view is ViewInstance => view !== undefined)
      .sort((a, b) => (a.state.position || 0) - (b.state.position || 0))
  }

  /**
   * Get all views
   */
  getAllViews(): ViewInstance[] {
    return Array.from(this.views.values())
  }

  /**
   * Show/hide view
   */
  setViewVisibility(viewId: string, visible: boolean): void {
    const view = this.views.get(viewId)
    if (!view) return

    if (view.isVisible !== visible) {
      view.isVisible = visible
      this.emit('viewVisibilityChanged', { view, visible })
    }
  }

  /**
   * Activate/deactivate view
   */
  setViewActive(viewId: string, active: boolean): void {
    const view = this.views.get(viewId)
    if (!view) return

    if (view.isActive !== active) {
      view.isActive = active
      this.emit('viewActiveChanged', { view, active })
    }
  }

  /**
   * Update view state
   */
  updateViewState(viewId: string, state: Partial<ViewState>): void {
    const view = this.views.get(viewId)
    if (!view) return

    view.state = { ...view.state, ...state }
    this.emit('viewStateChanged', { view, state: view.state })
  }

  /**
   * Refresh view
   */
  async refreshView(viewId: string): Promise<void> {
    const view = this.views.get(viewId)
    if (!view || !view.provider) return

    if (view.provider.refresh) {
      await view.provider.refresh()
      this.emit('viewRefreshed', { view })
    }
  }

  /**
   * Dispose registry
   */
  dispose(): void {
    if (this.isDisposed) return

    // Dispose all views
    for (const view of this.views.values()) {
        this.disposeView(view)
    }

    for (const provider of this.providers.values()) {
        provider.dispose?.()
    }


    this.views.clear()
    this.viewsByContainer.clear()
    this.providers.clear()
    this.removeAllListeners()
    this.isDisposed = true
  }

  private validateViewContribution(contribution: ResolvedViewContribution): void {
    if (!contribution.id) {
      throw new ContributionError('View ID is required', contribution.extensionId, 'view')
    }

    if (!contribution.name) {
      throw new ContributionError(
        'View name is required',
        contribution.extensionId,
        'view',
        contribution.id
      )
    }

    if (!contribution.containerId) {
      throw new ContributionError(
        'View container ID is required',
        contribution.extensionId,
        'view',
        contribution.id
      )
    }
  }

  private async resolveViewProvider(
    view: ViewInstance,
    provider: ViewProvider,
    options?: any
  ): Promise<void> {
    view.provider = provider

    if (provider.canResolveView && provider.resolveView) {
      await provider.resolveView(view)
    }

    // Set up specific view types
    if (options?.treeDataProvider) {
      this.createTreeView(view.id, { treeDataProvider: options.treeDataProvider })
    }

    if (options?.webviewOptions) {
      this.createWebviewView(view.id, options.webviewOptions)
    }
  }

  private disposeView(view: ViewInstance): void {
    // Dispose all disposables
    for (const disposable of view.disposables) {
      try {
        disposable.dispose()
      } catch (error) {
        console.error('Error disposing view resource:', error)
      }
    }
    view.disposables = []

    // Dispose specific view types
    view.treeView?.dispose()
    view.webview?.dispose()
    view.provider?.dispose?.()
  }
}

// Implementation classes for TreeView and WebviewView would go here
class TreeViewImpl<T> implements TreeView<T> {
  private _selection: readonly T[] = []
  private _visible = true
  private _onDidChangeSelection = new DisposableEventEmitter<TreeViewSelectionChangeEvent<T>>()
  private _onDidChangeVisibility = new DisposableEventEmitter<TreeViewVisibilityChangeEvent>()

  constructor(
    private view: ViewInstance,
    private options: {
      treeDataProvider: TreeDataProvider<T>
      showCollapseAll?: boolean
      canSelectMany?: boolean
    }
  ) {}

  get viewType(): string {
    return this.view.type
  }

  get dataProvider(): TreeDataProvider<T> {
    return this.options.treeDataProvider
  }

  get selection(): readonly T[] {
    return this._selection
  }

  get visible(): boolean {
    return this._visible
  }

  get onDidChangeSelection(): DisposableEvent<TreeViewSelectionChangeEvent<T>> {
    return this._onDidChangeSelection.event
  }

  get onDidChangeVisibility(): DisposableEvent<TreeViewVisibilityChangeEvent> {
    return this._onDidChangeVisibility.event
  }

  async reveal(_element: T, _options?: { select?: boolean; focus?: boolean; expand?: boolean | number }): Promise<void> {
    // Implementation for revealing elements in tree
  }

  dispose(): void {
    this._onDidChangeSelection.dispose()
    this._onDidChangeVisibility.dispose()
  }
}

class WebviewViewImpl implements WebviewView {
  private _webview: Webview

  constructor(
    private view: ViewInstance,
    options: WebviewOptions
  ) {
    this._webview = new WebviewImpl(options)
  }

  get webview(): Webview {
    return this._webview
  }

  get viewType(): string {
    return this.view.type
  }

  get title(): string | undefined {
    return this.view.title
  }

  get description(): string | undefined {
    return this.view.description
  }

  show(_preserveFocus?: boolean): void {
    // Implementation for showing webview
  }

  dispose(): void {
    this._webview.dispose()
  }
}

class WebviewImpl implements Webview {
  private _html = ''
  private _onDidReceiveMessage = new DisposableEventEmitter<any>()

  constructor(public readonly options: WebviewOptions) {}

  get html(): string {
    return this._html
  }

  set html(value: string) {
    this._html = value
    // Implementation to update webview content
  }

  get onDidReceiveMessage(): DisposableEvent<any> {
    return this._onDidReceiveMessage.event
  }

  async postMessage(_message: any): Promise<boolean> {
    // Implementation for posting messages to webview
    return true
  }

  dispose(): void {
    this._onDidReceiveMessage.dispose()
  }
}

// Event emitter implementation


// Tree drag and drop controller interface
export interface TreeDragAndDropController<T> {
  readonly dropMimeTypes: readonly string[]
  readonly dragMimeTypes: readonly string[]
  handleDrag?(source: readonly T[], dataTransfer: DataTransfer): void | Promise<void>
  handleDrop?(target: T, dataTransfer: DataTransfer): void | Promise<void>
}

// Singleton instance
export const viewRegistry = new ViewRegistry()