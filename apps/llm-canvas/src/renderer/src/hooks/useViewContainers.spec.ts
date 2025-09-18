import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useViewContainers } from './useViewContainers'
import { ViewContainerLocation, type ResolvedViewContainerContribution } from '@llm-canvas/sdk'

describe('useViewContainers', () => {
  const mockViewContainers: ResolvedViewContainerContribution[] = [
    {
      id: 'test.container1',
      title: 'Test Container 1',
      icon: '$(folder)',
      location: ViewContainerLocation.Sidebar,
      extensionId: 'test.extension'
    },
    {
      id: 'test.container2',
      title: 'Test Container 2',
      icon: '$(gear)',
      location: ViewContainerLocation.Panel,
      extensionId: 'test.extension'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockCanvas.contributions.getViewContainers.mockResolvedValue(mockViewContainers)
  })

  it('should fetch view containers on mount', async () => {
    const { result } = renderHook(() => useViewContainers())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockCanvas.contributions.getViewContainers).toHaveBeenCalledWith(undefined)
    expect(result.current.data).toEqual(mockViewContainers)
    expect(result.current.error).toBe(null)
  })

  it('should filter view containers by location', async () => {
    const { result } = renderHook(() => useViewContainers('sidebar'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockCanvas.contributions.getViewContainers).toHaveBeenCalledWith('sidebar')
  })

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to load view containers'
    mockCanvas.contributions.getViewContainers.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useViewContainers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.data).toEqual([])
  })

  it('should refresh data when refresh function is called', async () => {
    const { result } = renderHook(() => useViewContainers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    mockCanvas.contributions.getViewContainers.mockClear()
    await result.current.refresh()

    expect(mockCanvas.contributions.getViewContainers).toHaveBeenCalledTimes(1)
  })

  it('should listen for contribution changes', async () => {
    const { result } = renderHook(() => useViewContainers())

    expect(mockCanvas.events.on).toHaveBeenCalledWith('contributionsChanged', expect.any(Function))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useViewContainers())

    unmount()

    expect(mockCanvas.events.off).toHaveBeenCalledWith('contributionsChanged', expect.any(Function))
  })
})
