/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'

export function useCommandExecution<T = any>(): {
  executeCommand: (command: string, ...args: any[]) => Promise<T>
  loading: boolean
  error: string | null
} {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeCommand = useCallback(async (command: string, ...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await window.canvas.contributions.executeCommand<T>(command, ...args)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute command'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { executeCommand, loading, error }
}
