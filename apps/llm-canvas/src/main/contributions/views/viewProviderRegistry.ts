/* eslint-disable @typescript-eslint/no-explicit-any */
import { ViewProvider, TreeDataProvider, WebviewOptions } from '@llm-canvas/sdk'

export interface ViewProviderRegistration<T = any> {
  viewType: string
  provider: ViewProvider
  options?: {
    webviewOptions?: WebviewOptions
    treeDataProvider?: TreeDataProvider<T>
  }
}

export class ViewProviderRegistry {
  private providers = new Map<string, ViewProviderRegistration>()

  /**
   * Register a view provider
   */
  registerProvider(
    viewType: string,
    provider: ViewProvider,
    options?: ViewProviderRegistration['options']
  ): { dispose(): void } {
    if (this.providers.has(viewType)) {
      throw new Error(`View provider already registered for type: ${viewType}`)
    }

    const registration: ViewProviderRegistration = {
      viewType,
      provider,
      options
    }

    this.providers.set(viewType, registration)

    return {
      dispose: () => {
        this.providers.delete(viewType)
        provider.dispose?.()
      }
    }
  }

  /**
   * Get provider registration
   */
  getProvider(viewType: string): ViewProviderRegistration | undefined {
    return this.providers.get(viewType)
  }

  /**
   * Get all providers
   */
  getAllProviders(): ViewProviderRegistration[] {
    return Array.from(this.providers.values())
  }

  /**
   * Check if provider exists
   */
  hasProvider(viewType: string): boolean {
    return this.providers.has(viewType)
  }

  /**
   * Dispose all providers
   */
  dispose(): void {
    for (const registration of this.providers.values()) {
      registration.provider.dispose?.()
    }
    this.providers.clear()
  }
}