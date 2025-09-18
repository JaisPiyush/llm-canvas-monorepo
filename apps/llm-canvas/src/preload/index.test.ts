import { describe, it, expect, vi } from 'vitest'

// Import the preload script to execute it
import './index'


describe('Preload Script', () => {
  it('should expose canvas API to window', () => {
    // Check if contextBridge.exposeInMainWorld was called with 'canvas'
    expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith('canvas', expect.any(Object))
  })

  it('should expose version to window', () => {
    expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      'LLMCANVAS_VERSION',
      expect.any(String)
    )
  })

  it('should create canvas API with correct structure', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([])
    mockIpcRenderer.invoke.mockImplementation(mockInvoke)

    // Test that the API structure is correct
    const calls = mockContextBridge.exposeInMainWorld.mock.calls
    const canvasApiCall = calls.find((call) => call[0] === 'canvas')

    if (canvasApiCall) {
      const canvasApi = canvasApiCall[1]

      expect(canvasApi).toHaveProperty('extensions')
      expect(canvasApi).toHaveProperty('commands')
      expect(canvasApi).toHaveProperty('workspace')
      expect(canvasApi).toHaveProperty('contributions')
      expect(canvasApi).toHaveProperty('events')
      expect(canvasApi).toHaveProperty('system')
    }
  })

  it('should handle IPC communication correctly', async () => {
    const mockResult = ['extension1', 'extension2']
    mockIpcRenderer.invoke.mockResolvedValue(mockResult)

    const calls = mockContextBridge.exposeInMainWorld.mock.calls
    const canvasApiCall = calls.find((call) => call[0] === 'canvas')

    if (canvasApiCall) {
      const canvasApi = canvasApiCall[1]
      const result = await canvasApi.extensions.list()

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('extensions:list')
      expect(result).toEqual(mockResult)
    }
  })

  it('should validate event channel names', () => {
    const calls = mockContextBridge.exposeInMainWorld.mock.calls
    const canvasApiCall = calls.find((call) => call[0] === 'canvas')

    if (canvasApiCall) {
      const canvasApi = canvasApiCall[1]

      // Test valid channel
      canvasApi.events.on('contributionsChanged', () => {})
      expect(mockIpcRenderer.on).toHaveBeenCalled()

      // Test invalid channel - should not call ipcRenderer.on
      mockIpcRenderer.on.mockClear()
      canvasApi.events.on('invalid-channel', () => {})
      expect(mockIpcRenderer.on).not.toHaveBeenCalled()
    }
  })
})
