import SafeEventEmitter  from '@metamask/safe-event-emitter';
import {
  ContributionPoints,
  ResolvedViewContainerContribution,
  ResolvedViewContribution,
  ResolvedCommandContribution,
  ResolvedMenuContribution,
  ResolvedKeybindingContribution,
  ResolvedStatusBarContribution,
  ContributionChangeEvent,
  ContributionError,
  ContributionValidationError,
  ViewContainerLocation,
  ExtensionHostEvents,
} from '../types';

export interface ContributionRegistryOptions {
  enableValidation?: boolean;
  enableConflictResolution?: boolean;
  maxContributionsPerExtension?: number;
}

export class ContributionRegistry extends SafeEventEmitter {
  private readonly options: Required<ContributionRegistryOptions>;
  
  // Storage for contributions by type
  private readonly viewContainers = new Map<string, ResolvedViewContainerContribution>();
  private readonly views = new Map<string, ResolvedViewContribution>();
  private readonly commands = new Map<string, ResolvedCommandContribution>();
  private readonly menus = new Map<string, ResolvedMenuContribution[]>();
  private readonly keybindings = new Map<string, ResolvedKeybindingContribution[]>();
  private readonly statusBarItems = new Map<string, ResolvedStatusBarContribution>();
  
  // Extension tracking
  private readonly extensionContributions = new Map<string, Set<string>>();
  private readonly contributionExtensions = new Map<string, string>();
  
  // State tracking
  private readonly conflictRegistry = new Map<string, string[]>();
  private isDisposed = false;

  constructor(options: ContributionRegistryOptions = {}) {
    super();
    this.options = {
      enableValidation: true,
      enableConflictResolution: true,
      maxContributionsPerExtension: 1000,
      ...options
    };
  }

  // Typed event overloads for stronger typing and to avoid mismatched emit signatures
  public on(event: ExtensionHostEvents.contributionsRegistered, listener: (event: ContributionChangeEvent) => void): this;
  public on(event: ExtensionHostEvents.contributionsUnregistered, listener: (event: ContributionChangeEvent) => void): this;
  public on(
    event: 'contributionConflict',
    listener: (event: { contributionId: string; type: string; existingExtensionId: string; conflictingExtensionId: string }) => void
  ): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public emit(event: ExtensionHostEvents.contributionsRegistered, eventData: ContributionChangeEvent): boolean;
  public emit(event: ExtensionHostEvents.contributionsUnregistered, eventData: ContributionChangeEvent): boolean;
  public emit(
    event: 'contributionConflict',
    eventData: { contributionId: string; type: string; existingExtensionId: string; conflictingExtensionId: string }
  ): boolean;


  public emit(event: string , ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Register contributions from an extension
   */
  registerExtensionContributions(
    extensionId: string,
    contributions: ContributionPoints
  ): void {
    if (this.isDisposed) {
      throw new Error('ContributionRegistry has been disposed');
    }

    this.validateExtensionId(extensionId);
    
    if (this.options.enableValidation) {
      this.validateContributions(extensionId, contributions);
    }

    try {
      this.processViewContainers(extensionId, contributions.viewContainers);
      this.processViews(extensionId, contributions.views);
      this.processCommands(extensionId, contributions.commands);
      this.processMenus(extensionId, contributions.menus);
      this.processKeybindings(extensionId, contributions.keybindings);
      this.processStatusBar(extensionId, contributions.statusBar);

      const contributionRegisteredEvent: ContributionChangeEvent = {
        extensionId,
        type: 'added',
        contributionType: 'all',
        data: contributions
      }

      this.emit(ExtensionHostEvents.contributionsRegistered, contributionRegisteredEvent);

    } catch (error) {
      // Rollback any partial registrations
      this.unregisterExtensionContributions(extensionId);
      throw error;
    }
  }

  /**
   * Unregister all contributions from an extension
   */
  unregisterExtensionContributions(extensionId: string): void {
    const contributionIds = this.extensionContributions.get(extensionId);
    if (!contributionIds) {
      return;
    }

    // Remove all contributions for this extension
    contributionIds.forEach((contributionId) => {
      this.removeContribution(contributionId);
    });

    this.extensionContributions.delete(extensionId);

    this.emit(ExtensionHostEvents.contributionsUnregistered, {
      extensionId,
      type: 'removed',
      contributionType: 'all'
    } as ContributionChangeEvent);
  }

  /**
   * Get view containers by location
   */
  getViewContainers(location?: ViewContainerLocation): ResolvedViewContainerContribution[] {
    const containers = Array.from(this.viewContainers.values());
    return location 
      ? containers.filter(c => c.location === location)
      : containers;
  }

  /**
   * Get view container by ID
   */
  getViewContainer(id: string): ResolvedViewContainerContribution | undefined {
    return this.viewContainers.get(id);
  }

  /**
   * Get views by container ID
   */
  getViews(containerId?: string): ResolvedViewContribution[] {
    const views = Array.from(this.views.values());
    return containerId
      ? views.filter(v => v.containerId === containerId)
      : views;
  }

  /**
   * Get view by ID
   */
  getView(id: string): ResolvedViewContribution | undefined {
    return this.views.get(id);
  }

  /**
   * Get all commands
   */
  getCommands(): ResolvedCommandContribution[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get command by ID
   */
  getCommand(commandId: string): ResolvedCommandContribution | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Get menu contributions for a specific menu
   */
  getMenuContributions(menuId: string): ResolvedMenuContribution[] {
    return this.menus.get(menuId) || [];
  }

  /**
   * Get all menu contributions
   */
  getAllMenuContributions(): Map<string, ResolvedMenuContribution[]> {
    return new Map(this.menus);
  }

  /**
   * Get keybinding contributions for a command
   */
  getKeybindings(commandId?: string): ResolvedKeybindingContribution[] {
    const allKeybindings = Array.from(this.keybindings.values()).flat();
    return commandId
      ? allKeybindings.filter(k => k.command === commandId)
      : allKeybindings;
  }

  /**
   * Get status bar items
   */
  getStatusBarItems(): ResolvedStatusBarContribution[] {
    return Array.from(this.statusBarItems.values());
  }

  /**
   * Get status bar item by ID
   */
  getStatusBarItem(id: string): ResolvedStatusBarContribution | undefined {
    return this.statusBarItems.get(id);
  }

  /**
   * Get all contributions for an extension
   */
  getExtensionContributions(extensionId: string): {
    viewContainers: ResolvedViewContainerContribution[];
    views: ResolvedViewContribution[];
    commands: ResolvedCommandContribution[];
    menus: ResolvedMenuContribution[];
    keybindings: ResolvedKeybindingContribution[];
    statusBarItems: ResolvedStatusBarContribution[];
  } {
    return {
      viewContainers: this.getViewContainers().filter(c => c.extensionId === extensionId),
      views: this.getViews().filter(v => v.extensionId === extensionId),
      commands: this.getCommands().filter(c => c.extensionId === extensionId),
      menus: Array.from(this.menus.values()).flat().filter(m => m.extensionId === extensionId),
      keybindings: this.getKeybindings().filter(k => k.extensionId === extensionId),
      statusBarItems: this.getStatusBarItems().filter(s => s.extensionId === extensionId)
    };
  }

  /**
   * Check if a contribution exists
   */
  hasContribution(id: string): boolean {
    return this.contributionExtensions.has(id);
  }

  /**
   * Get conflicts for a contribution ID
   */
  getConflicts(id: string): string[] {
    return this.conflictRegistry.get(id) || [];
  }

  /**
   * Dispose the registry
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.viewContainers.clear();
    this.views.clear();
    this.commands.clear();
    this.menus.clear();
    this.keybindings.clear();
    this.statusBarItems.clear();
    this.extensionContributions.clear();
    this.contributionExtensions.clear();
    this.conflictRegistry.clear();
    
    this.removeAllListeners();
    this.isDisposed = true;
  }

  // Private methods

  private validateExtensionId(extensionId: string): void {
    if (!extensionId || typeof extensionId !== 'string') {
      throw new ContributionError('Invalid extension ID', extensionId, 'validation');
    }
  }

  private validateContributions(extensionId: string, contributions: ContributionPoints): void {
    const totalContributions = this.countContributions(contributions);
    
    if (totalContributions > this.options.maxContributionsPerExtension) {
      throw new ContributionValidationError(
        `Extension ${extensionId} exceeds maximum allowed contributions (${this.options.maxContributionsPerExtension})`,
        extensionId,
        'validation',
        undefined,
        [`Total contributions: ${totalContributions}`]
      );
    }
  }

  private countContributions(contributions: ContributionPoints): number {
    let count = 0;
    
    if (contributions.viewContainers != undefined) {
      Object.values(contributions.viewContainers!).forEach(containers => {
        count += containers?.length ?? 0;
      });
    }
    
    if (contributions.views != undefined) {
      Object.values(contributions.views).forEach(views => {
        count += views.length;
      });
    }
    
    count += (contributions.commands?.length || 0);
    
    if (contributions.menus) {
      Object.values(contributions.menus).forEach(menuItems => {
        count += menuItems.length;
      });
    }
    
    count += (contributions.keybindings?.length || 0);
    count += (contributions.statusBar?.length || 0);
    
    return count;
  }

  private processViewContainers(
    extensionId: string,
    viewContainers?: ContributionPoints['viewContainers']
  ): void {
    if (!viewContainers) return;

    for (const [location, containers] of Object.entries(viewContainers)) {
      if (!containers) continue;
      for (const container of containers) {
        const resolvedContainer: ResolvedViewContainerContribution = {
          ...container,
          extensionId,
          location: location as ViewContainerLocation
        };

        this.registerContribution(container.id, extensionId);
        
        if (this.viewContainers.has(container.id)) {
          this.handleConflict('viewContainer', container.id, extensionId);
        }
        
        this.viewContainers.set(container.id, resolvedContainer);
      }
    }
  }

  private processViews(
    extensionId: string,
    views?: ContributionPoints['views']
  ): void {
    if (!views) return;

    for (const [containerId, viewList] of Object.entries(views)) {
      for (const view of viewList) {
        const resolvedView: ResolvedViewContribution = {
          ...view,
          extensionId,
          containerId
        };

        this.registerContribution(view.id, extensionId);
        
        if (this.views.has(view.id)) {
          this.handleConflict('view', view.id, extensionId);
        }
        
        this.views.set(view.id, resolvedView);
      }
    }
  }

  private processCommands(
    extensionId: string,
    commands?: ContributionPoints['commands']
  ): void {
    if (!commands) return;

    for (const command of commands) {
      const resolvedCommand: ResolvedCommandContribution = {
        ...command,
        extensionId
      };

      this.registerContribution(command.command, extensionId);
      
      if (this.commands.has(command.command)) {
        this.handleConflict('command', command.command, extensionId);
      }
      
      this.commands.set(command.command, resolvedCommand);
    }
  }

  private processMenus(
    extensionId: string,
    menus?: ContributionPoints['menus']
  ): void {
    if (!menus) return;

    for (const [menuId, menuItems] of Object.entries(menus)) {
      const resolvedMenuItems: ResolvedMenuContribution[] = menuItems.map(item => ({
        ...item,
        extensionId,
        menuId
      }));

      for (const item of resolvedMenuItems) {
        const itemId = `${menuId}:${item.command || item.submenu || 'separator'}:${extensionId}`;
        this.registerContribution(itemId, extensionId);
      }

      const existingItems = this.menus.get(menuId) || [];
      this.menus.set(menuId, [...existingItems, ...resolvedMenuItems]);
    }
  }

  private processKeybindings(
    extensionId: string,
    keybindings?: ContributionPoints['keybindings']
  ): void {
    if (!keybindings) return;

    for (const keybinding of keybindings) {
      const resolvedKeybinding: ResolvedKeybindingContribution = {
        ...keybinding,
        extensionId
      };

      const keybindingId = `${keybinding.command}:${keybinding.key}:${extensionId}`;
      this.registerContribution(keybindingId, extensionId);

      const existingKeybindings = this.keybindings.get(keybinding.command) || [];
      this.keybindings.set(keybinding.command, [...existingKeybindings, resolvedKeybinding]);
    }
  }

  private processStatusBar(
    extensionId: string,
    statusBarItems?: ContributionPoints['statusBar']
  ): void {
    if (!statusBarItems) return;

    for (const item of statusBarItems) {
      const resolvedItem: ResolvedStatusBarContribution = {
        ...item,
        extensionId
      };

      this.registerContribution(item.id, extensionId);
      
      if (this.statusBarItems.has(item.id)) {
        this.handleConflict('statusBarItem', item.id, extensionId);
      }
      
      this.statusBarItems.set(item.id, resolvedItem);
    }
  }

  private registerContribution(contributionId: string, extensionId: string): void {
    if (!this.extensionContributions.has(extensionId)) {
      this.extensionContributions.set(extensionId, new Set());
    }
    
    this.extensionContributions.get(extensionId)!.add(contributionId);
    this.contributionExtensions.set(contributionId, extensionId);
  }

  private removeContribution(contributionId: string): void {
    const extensionId = this.contributionExtensions.get(contributionId);
    if (!extensionId) return;

    // Remove from type-specific registries
    this.viewContainers.delete(contributionId);
    this.views.delete(contributionId);
    this.commands.delete(contributionId);
    this.statusBarItems.delete(contributionId);

    // Remove from menu and keybinding arrays
    this.menus.forEach((items, menuId) => {
      const filtered = items.filter(item => {
        const itemId = `${menuId}:${item.command || item.submenu || 'separator'}:${item.extensionId}`;
        return itemId !== contributionId;
      });
      if (filtered.length !== items.length) {
        this.menus.set(menuId, filtered);
      }
    });

    this.keybindings.forEach((bindings, command) => {
      const filtered = bindings.filter(binding => {
        const bindingId = `${binding.command}:${binding.key}:${binding.extensionId}`;
        return bindingId !== contributionId;
      });
      if (filtered.length !== bindings.length) {
        this.keybindings.set(command, filtered);
      }
    });

    // Clean up tracking
    this.extensionContributions.get(extensionId)?.delete(contributionId);
    this.contributionExtensions.delete(contributionId);
    this.conflictRegistry.delete(contributionId);
  }

  private handleConflict(type: string, id: string, extensionId: string): void {
    if (!this.options.enableConflictResolution) {
      throw new ContributionError(
        `Contribution conflict: ${type} '${id}' is already registered`,
        extensionId,
        type,
        id
      );
    }

    const existingExtensionId = this.contributionExtensions.get(id);
    if (existingExtensionId) {
      const conflicts = this.conflictRegistry.get(id) || [];
      conflicts.push(extensionId);
      this.conflictRegistry.set(id, conflicts);

      this.emit('contributionConflict', {
        contributionId: id,
        type,
        existingExtensionId,
        conflictingExtensionId: extensionId
      });
    }
  }
}

// Singleton instance
export const contributionRegistry = new ContributionRegistry();