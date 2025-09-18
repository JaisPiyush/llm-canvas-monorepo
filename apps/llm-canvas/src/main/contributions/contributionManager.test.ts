import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContributionManager } from './contributionManager'
import { BrowserWindow } from 'electron'

// Mock the ExtensionHost
vi.mock('../extensions/extensionHost', () => ({
  ExtensionHost: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    loadExtensions: vi.fn().mockResolvedValue([]),
    activateExtension: vi.fn().mockResolvedValue(undefined),
    deactivateExtension: vi.fn().mockResolvedValue(undefined),
    executeCommand: vi.fn().mockResolvedValue('command result'),
    getExtensions: vi.fn().mockReturnValue([]),
    on: vi.fn()
  }))
}))

describe('ContributionManager', () => {
  let contributionManager: ContributionManager
  let mockWindow: BrowserWindow

  beforeEach(() => {
    contributionManager = new ContributionManager({
      extensionsPath: '/mock/extensions',
      enableDevelopmentMode: true
    })

    mockWindow = new BrowserWindow({
      width: 800,
      height: 600
    })
  })

  it('should initialize successfully', async () => {
    await expect(contributionManager.initialize(mockWindow)).resolves.not.toThrow()
  })

  it('should activate extension', async () => {
    await contributionManager.initialize(mockWindow)
    await expect(contributionManager.activateExtension('test.extension')).resolves.not.toThrow()
  })

  it('should execute commands', async () => {
    await contributionManager.initialize(mockWindow)
    const result = await contributionManager.executeCommand('test.command', 'arg1', 'arg2')
    expect(result).toBe('command result')
  })

  it('should get extension list', async () => {
    await contributionManager.initialize(mockWindow)
    const extensions = contributionManager.getExtensions()
    expect(Array.isArray(extensions)).toBe(true)
  })

  it('should shutdown gracefully', async () => {
    await contributionManager.initialize(mockWindow)
    await expect(contributionManager.shutdown()).resolves.not.toThrow()
  })
})