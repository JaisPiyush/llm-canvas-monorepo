import { useState, useEffect, useCallback } from 'react'
import { ExtensionHostEvents, ResolvedViewContainerContribution } from '@llm-canvas/sdk'
import {
  resolvedViewContainerContributionSignal,
  setResolvedViewContainerContribution
} from '@renderer/signals/contribution'

interface ContributionHookResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useViewContainers(
  location?: string
): ContributionHookResult<ResolvedViewContainerContribution> {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const containers = await window.canvas.contributions.getViewContainers(location)
      setResolvedViewContainerContribution(containers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load view containers')
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    refresh()

    // Listen for contribution changes
    const handleContributionChange = (): Promise<void> => {
      return refresh()
    }

    window.canvas.events.on(ExtensionHostEvents.contributionsChanged, handleContributionChange)

    return () => {
      window.canvas.events.off(ExtensionHostEvents.contributionsChanged, handleContributionChange)
    }
  }, [refresh])

  return { data: resolvedViewContainerContributionSignal.value, loading, error, refresh }
}
