import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ViewManager, ViewRegistry, ContributionRegistry } from '@llm-canvas/sdk'

describe('ViewManager', () => {
  let viewManager: ViewManager
  let mockContributionRegistry: ContributionRegistry
  let mockViewRegistry: ViewRegistry
  let mockContextEvaluator: any

  beforeEach(() => {
    mockContributionRegistry = {
      getViewContainers: vi.fn(),
      getViews: vi.fn(),
      getViewContainer: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    } as any

    mockViewRegistry = {
      registerView: vi.fn(),
      unregisterView: vi.fn(),
      getView: vi.fn(),
      setViewVisibility: vi.fn(),
      setViewActive: vi.fn(),
      on: vi.fn(),
      dispose: vi.fn()
    } as any

    mockContextEvaluator = {
      registerContextKey: vi.fn(),
      setContext: vi.fn(),
      evaluate: vi.fn().mockReturnValue(true)
    }

    viewManager = new ViewManager({
      contributionRegistry: mockContributionRegistry,
      viewRegistry: mockViewRegistry,
      contextEvaluator: mockContextEvaluator
    })
  })

  describe('showView', () => {
    it('should show view when when condition is met', async () => {
      const mockView = {
        id: 'test.view',
        when: 'workspaceHasFiles',
        containerId: 'test.container'
      }

      mockViewRegistry.getView = vi.fn().mockReturnValue(mockView)
      mockContributionRegistry.getViewContainer = vi.fn().mockReturnValue({
        id: 'test.container'
      })

      await viewManager.showView('test.view')

      expect(mockViewRegistry.setViewVisibility).toHaveBeenCalledWith('test.view', true)
      expect(mockContextEvaluator.evaluate).toHaveBeenCalledWith('workspaceHasFiles')
    })

    it('should not show view when when condition is not met', async () => {
      const mockView = {
        id: 'test.view',
        when: 'extensionDevelopment',
        containerId: 'test.container'
      }

      mockViewRegistry.getView = vi.fn().mockReturnValue(mockView)
      mockContextEvaluator.evaluate = vi.fn().mockReturnValue(false)

      await viewManager.showView('test.view')

      expect(mockViewRegistry.setViewVisibility).not.toHaveBeenCalled()
    })

    it('should throw error for non-existent view', async () => {
      mockViewRegistry.getView = vi.fn().mockReturnValue(null)

      await expect(viewManager.showView('non.existent')).rejects.toThrow(
        'View not found: non.existent'
      )
    })
  })

  describe('setActiveView', () => {
    it('should set active view and update context', async () => {
      const mockView = { id: 'test.view' }
      mockViewRegistry.getView = vi.fn().mockReturnValue(mockView)

      await viewManager.setActiveView('test.view')

      expect(mockViewRegistry.setViewActive).toHaveBeenCalledWith('test.view', true)
      expect(mockContextEvaluator.setContext).toHaveBeenCalledWith('view', 'test.view')
    })
  })
})