import {
  ExtensionManifest,
  ContributionPoints,
  ContributionValidationError
} from '../types'
import { ContributionRegistry } from './contributionRegistry'

export interface ContributionLoaderOptions {
  enableStrictValidation?: boolean
  allowDuplicateContributions?: boolean
}

export class ContributionLoader {
  private readonly options: Required<ContributionLoaderOptions>

  constructor(
    private readonly registry: ContributionRegistry,
    options: ContributionLoaderOptions = {}
  ) {
    this.options = {
      enableStrictValidation: true,
      allowDuplicateContributions: false,
      ...options
    }
  }

  /**
   * Load contributions from an extension manifest
   */
  async loadContributions(manifest: ExtensionManifest): Promise<void> {
    const extensionId = this.getExtensionId(manifest)

    if (this.options.enableStrictValidation) {
      this.validateManifest(manifest)
    }

    if (!manifest.contributes) {
      // Extension has no contributions
      return
    }

    try {
      await this.processContributions(extensionId, manifest.contributes)
    } catch (error) {
      throw new ContributionValidationError(
        `Failed to load contributions for extension ${extensionId}: ${(error as any).message}`,
        extensionId,
        'loading',
        undefined,
        [(error as any).message]
      )
    }
  }

  /**
   * Unload contributions for an extension
   */
  async unloadContributions(manifest: ExtensionManifest): Promise<void> {
    const extensionId = this.getExtensionId(manifest)
    this.registry.unregisterExtensionContributions(extensionId)
  }

  /**
   * Reload contributions for an extension
   */
  async reloadContributions(manifest: ExtensionManifest): Promise<void> {
    await this.unloadContributions(manifest)
    await this.loadContributions(manifest)
  }

  private getExtensionId(manifest: ExtensionManifest): string {
    return manifest.name
  }

  private validateManifest(manifest: ExtensionManifest): void {
    const errors: string[] = []

    if (!manifest.name) {
      errors.push('Extension name is required')
    }


    if (!manifest.version) {
      errors.push('Extension version is required')
    }

    if (!manifest.engines?.app) {
      errors.push('Extension engines.app is required')
    }

    if (errors.length > 0) {
      throw new ContributionValidationError(
        'Invalid extension manifest',
        this.getExtensionId(manifest),
        'manifest',
        undefined,
        errors
      )
    }
  }

  private async processContributions(
    extensionId: string,
    contributions: ContributionPoints
  ): Promise<void> {
    // Validate contribution structure
    this.validateContributionStructure(extensionId, contributions)

    // Process conditional contributions (when clauses)
    const processedContributions = await this.processConditionalContributions(
      extensionId,
      contributions
    )

    // Register with the registry
    this.registry.registerExtensionContributions(extensionId, processedContributions)
  }

  private validateContributionStructure(
    extensionId: string,
    contributions: ContributionPoints
  ): void {
    const errors: string[] = []

    // Validate view containers
    if (contributions.viewContainers) {
      for (const [location, containers] of Object.entries(contributions.viewContainers!)) {
        if (!['sidebar', 'panel', 'auxiliaryBar', 'mainView'].includes(location)) {
          errors.push(`Invalid view container location: ${location}`)
        }

        if (!containers) continue
        for (const container of containers) {
          if (!container.id) {
            errors.push('View container ID is required')
          }
          if (!container.title) {
            errors.push(`View container ${container.id} title is required`)
          }
        }
      }
    }

    // Validate views
    if (contributions.views) {
      for (const [, views] of Object.entries(contributions.views)) {
        for (const view of views) {
          if (!view.id) {
            errors.push('View ID is required')
          }
          if (!view.name) {
            errors.push(`View ${view.id} name is required`)
          }
        }
      }
    }

    // Validate commands
    if (contributions.commands) {
      for (const command of contributions.commands) {
        if (!command.command) {
          errors.push('Command ID is required')
        }
        if (!command.title) {
          errors.push(`Command ${command.command} title is required`)
        }
      }
    }

    // Validate menus
    if (contributions.menus) {
      for (const [menuId, menuItems] of Object.entries(contributions.menus)) {
        for (const item of menuItems) {
          if (!item.command && !item.submenu) {
            errors.push(`Menu item in ${menuId} must have either command or submenu`)
          }
        }
      }
    }

    // Validate keybindings
    if (contributions.keybindings) {
      for (const keybinding of contributions.keybindings) {
        if (!keybinding.key) {
          errors.push('Keybinding key is required')
        }
        if (!keybinding.command) {
          errors.push('Keybinding command is required')
        }
      }
    }

    // Validate status bar items
    if (contributions.statusBar) {
      for (const item of contributions.statusBar) {
        if (!item.id) {
          errors.push('Status bar item ID is required')
        }
        if (!item.text) {
          errors.push(`Status bar item ${item.id} text is required`)
        }
        if (!['left', 'right'].includes(item.alignment)) {
          errors.push(`Status bar item ${item.id} alignment must be 'left' or 'right'`)
        }
      }
    }

    if (errors.length > 0) {
      throw new ContributionValidationError(
        'Invalid contribution structure',
        extensionId,
        'structure',
        undefined,
        errors
      )
    }
  }

  private async processConditionalContributions(
    _extensionId: string,
    contributions: ContributionPoints
  ): Promise<ContributionPoints> {
    // For now, return contributions as-is
    // In the future, this would evaluate 'when' clauses and filter contributions
    return contributions
  }
}
