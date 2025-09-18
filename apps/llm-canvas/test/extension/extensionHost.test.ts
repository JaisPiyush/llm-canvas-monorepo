/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExtensionHost } from '../../src/main/extensions/extensionHost'
import { ChildProcess, fork } from 'child_process'

// Mock child_process
const mockFork = vi.fn()

vi.mock('child_process', () => ({
  fork: mockFork
}))

describe('ExtensionHost', () => {
  let extensionHost: ExtensionHost
  let mockChildProcess: Partial<ChildProcess>

  beforeEach(() => {
    vi.clearAllMocks()
    mockChildProcess = {
      send: vi.fn(),
      on: vi.fn(),
      kill: vi.fn(),
      stdout: { on: vi.fn() } as any,
      stderr: { on: vi.fn() } as any
    }

    mockFork.mockReturnValue(mockChildProcess as ChildProcess)

    extensionHost = new ExtensionHost({
      extensionsPath: '/test/extensions',
      enableDevelopmentMode: true
    })
  })

  afterEach(async () => {
    await extensionHost.stop()
  })

  describe('start', () => {
    it('should start extension host process', async () => {
      await extensionHost.start()

      expect(mockFork).toHaveBeenCalledWith(
        expect.stringContaining('extensionHostProcess.js'),
        [],
        expect.objectContaining({
          stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        })
      )
    })

    it('should set up message handlers', async () => {
      await extensionHost.start()

      expect(mockChildProcess.on).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockChildProcess.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockChildProcess.on).toHaveBeenCalledWith('exit', expect.any(Function))
    })
  })

  describe('sendRequest', () => {
    it(
      'should handle request timeout',
      async () => {
        await extensionHost.start()

        const requestPromise = (extensionHost as any).sendRequest('slow.method', {})

        await expect(requestPromise).rejects.toThrow('Request timeout: slow.method')
      },
      { timeout: 5000 }
    )
  })
})
