import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ViewInstance,
  ViewLayout,
  ViewContext,
  ExtensionHostEvents,
  ViewContainerLocation
} from '@llm-canvas/sdk'

interface ViewManagerHookResult {
  // View management
  getViewsInContainer: (containerId: string) => Promise<ViewInstance[]>
  showView: (viewId: string, containerId?: string) => Promise<void>
  hideView: (viewId: string) => Promise<void>
  toggleView: (viewId: string) => Promise<void>
  setActiveView: (viewId: string) => Promise<void>
  refreshView: (viewId: string) => Promise<void>

  // Layout management
  getViewLayout: (containerId: string) => Promise<ViewLayout | undefined>

  // State
  activeView: ViewInstance | null
  viewContexts: Map<string, ViewContext>

  // Status
  loading: boolean
  error: string | null
}

export function useViewManager(): ViewManagerHookResult {
  const [activeView, setActiveView] = useState<ViewInstance | null>(null)
  const [viewContexts, setViewContexts] = useState<Map<string, ViewContext>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getViewsInContainer = useCallback(async (containerId: string): Promise<ViewInstance[]> => {
    try {
      setError(null)
      // This would be implemented to call the main process
      // For now, we'll use the canvas API
      const views = await window.canvas.contributions.getViews(containerId)

      // Convert to ViewInstance format (this would be handled by the view manager)
      return views.map(
        (view) =>
          ({
            id: `${view.extensionId}.${view.id}`,
            extensionId: view.extensionId,
            viewId: view.id,
            containerId: view.containerId,
            type: view.type || 'custom',
            isVisible: true,
            isActive: false,
            title: view.name,
            description: view.contextualTitle,
            when: view.when,
            state: {
              collapsed: view.visibility === 'collapsed',
              size: view.size,
              position: view.order
            },
            disposables: []
          }) as ViewInstance
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get views'
      setError(errorMessage)
      throw err
    }
  }, [])

  const showView = useCallback(async (viewId: string, containerId?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      // Implementation would call view manager
      console.log(`Showing view ${viewId} in container ${containerId}`)

      // For now, simulate the operation
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show view'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const hideView = useCallback(async (viewId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Hiding view ${viewId}`)
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to hide view'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleView = useCallback(
    async (viewId: string): Promise<void> => {
      // Implementation would check current visibility and toggle
      await showView(viewId)
    },
    [showView]
  )

  const setActiveViewHandler = useCallback(
    async (viewId: string): Promise<void> => {
      try {
        setError(null)

        // Find the view (this would be done through view manager)
        const views = await getViewsInContainer('') // This needs proper container ID
        const view = views.find((v) => v.id === viewId)

        if (view) {
          setActiveView(view)

          // Update context
          const newContexts = new Map(viewContexts)
          for (const [id, context] of newContexts) {
            context.active = id === viewId
            context.focused = id === viewId
          }
          setViewContexts(newContexts)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set active view'
        setError(errorMessage)
        throw err
      }
    },
    [getViewsInContainer, viewContexts]
  )

  const refreshView = useCallback(async (viewId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Refreshing view ${viewId}`)
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh view'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getViewLayout = useCallback(
    async (containerId: string): Promise<ViewLayout | undefined> => {
      try {
        setError(null)

        // This would call the view manager to get layout
        const views = await getViewsInContainer(containerId)

        return {
          containerId,
          location: ViewContainerLocation.Sidebar, // This would come from container
          collapsed: false,
          views: views.map((view, index) => ({
            viewId: view.id,
            size: view.state.size,
            collapsed: view.state.collapsed,
            visible: view.isVisible,
            position: view.state.position || index
          }))
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get view layout'
        setError(errorMessage)
        return undefined
      }
    },
    [getViewsInContainer]
  )

  // Listen for view system events
  useEffect(() => {
    const handleViewChange = (): void => {
      // Refresh view state when contributions change
      setViewContexts(new Map())
    }

    window.canvas.events.on(ExtensionHostEvents.contributionsChanged, handleViewChange)

    return () => {
      window.canvas.events.off(ExtensionHostEvents.contributionsChanged, handleViewChange)
    }
  }, [])

  return useMemo(
    () => ({
      getViewsInContainer,
      showView,
      hideView,
      toggleView,
      setActiveView: setActiveViewHandler,
      refreshView,
      getViewLayout,
      activeView,
      viewContexts,
      loading,
      error
    }),
    [
      getViewsInContainer,
      showView,
      hideView,
      toggleView,
      setActiveViewHandler,
      refreshView,
      getViewLayout,
      activeView,
      viewContexts,
      loading,
      error
    ]
  )
}
