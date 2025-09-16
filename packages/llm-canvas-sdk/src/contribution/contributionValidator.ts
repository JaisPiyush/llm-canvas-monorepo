import {
    ContributionPoints,
    ViewContainerContribution,
    ViewContribution,
    CommandContribution,
    MenuContribution,
    KeybindingContribution,
    StatusBarContribution  } from '../types';
  
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }
  
  export class ContributionValidator {
    /**
     * Validate all contributions
     */
    validate(_extensionId: string, contributions: ContributionPoints): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      try {
        // Validate view containers
        if (contributions.viewContainers) {
          const viewContainerResult = this.validateViewContainers(contributions.viewContainers);
          errors.push(...viewContainerResult.errors);
          warnings.push(...viewContainerResult.warnings);
        }
  
        // Validate views
        if (contributions.views) {
          const viewResult = this.validateViews(contributions.views, contributions.viewContainers);
          errors.push(...viewResult.errors);
          warnings.push(...viewResult.warnings);
        }
  
        // Validate commands
        if (contributions.commands) {
          const commandResult = this.validateCommands(contributions.commands);
          errors.push(...commandResult.errors);
          warnings.push(...commandResult.warnings);
        }
  
        // Validate menus
        if (contributions.menus) {
          const menuResult = this.validateMenus(contributions.menus, contributions.commands);
          errors.push(...menuResult.errors);
          warnings.push(...menuResult.warnings);
        }
  
        // Validate keybindings
        if (contributions.keybindings) {
          const keybindingResult = this.validateKeybindings(contributions.keybindings, contributions.commands);
          errors.push(...keybindingResult.errors);
          warnings.push(...keybindingResult.warnings);
        }
  
        // Validate status bar
        if (contributions.statusBar) {
          const statusBarResult = this.validateStatusBar(contributions.statusBar, contributions.commands);
          errors.push(...statusBarResult.errors);
          warnings.push(...statusBarResult.warnings);
        }
  
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
  
      } catch (error) {
        return {
          isValid: false,
          errors: [`Validation failed: ${(error as any).message}`],
          warnings
        } ;
      }
    }
  
    private validateViewContainers(viewContainers: ContributionPoints['viewContainers']): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      for (const [location, containers] of Object.entries(viewContainers!)) {
        if (!['sidebar', 'panel', 'auxiliaryBar', 'mainView'].includes(location)) {
          errors.push(`Invalid view container location: ${location}`);
          continue;
        }
  
        if (!containers) continue;
        for (const container of containers) {
          const containerErrors = this.validateViewContainer(container);
          errors.push(...containerErrors);
        }
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateViewContainer(container: ViewContainerContribution): string[] {
      const errors: string[] = [];
  
      if (!container.id) {
        errors.push('View container ID is required');
      } else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(container.id)) {
        errors.push(`Invalid view container ID format: ${container.id}`);
      }
  
      if (!container.title) {
        errors.push(`View container ${container.id} title is required`);
      }
  
      if (container.order !== undefined && (container.order < 0 || !Number.isInteger(container.order))) {
        errors.push(`View container ${container.id} order must be a non-negative integer`);
      }
  
      return errors;
    }
  
    private validateViews(
      views: ContributionPoints['views'],
      viewContainers?: ContributionPoints['viewContainers']
    ): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      // Get all valid container IDs
      const validContainerIds = new Set<string>();
      if (viewContainers) {
        for (const containers of Object.values(viewContainers)) {
          if (!containers) continue;
          for (const container of containers) {
            validContainerIds.add(container.id);
          }
        }
      }
  
      for (const [containerId, viewList] of Object.entries(views!)) {
        if (!validContainerIds.has(containerId)) {
          warnings.push(`View container ${containerId} is not defined in viewContainers`);
        }
  
        for (const view of viewList) {
          const viewErrors = this.validateView(view, containerId);
          errors.push(...viewErrors);
        }
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateView(view: ViewContribution, _containerId: string): string[] {
      const errors: string[] = [];
  
      if (!view.id) {
        errors.push('View ID is required');
      } else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(view.id)) {
        errors.push(`Invalid view ID format: ${view.id}`);
      }
  
      if (!view.name) {
        errors.push(`View ${view.id} name is required`);
      }
  
      if (view.type && !['tree', 'webview', 'custom'].includes(view.type)) {
        errors.push(`Invalid view type for ${view.id}: ${view.type}`);
      }
  
      if (view.visibility && !['visible', 'hidden', 'collapsed'].includes(view.visibility)) {
        errors.push(`Invalid visibility value for view ${view.id}: ${view.visibility}`);
      }
  
      if (view.size !== undefined && (view.size < 0 || view.size > 100)) {
        errors.push(`View ${view.id} size must be between 0 and 100`);
      }
  
      if (view.order !== undefined && (view.order < 0 || !Number.isInteger(view.order))) {
        errors.push(`View ${view.id} order must be a non-negative integer`);
      }
  
      return errors;
    }
  
    private validateCommands(commands: CommandContribution[]): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
      const commandIds = new Set<string>();
  
      for (const command of commands) {
        const commandErrors = this.validateCommand(command);
        errors.push(...commandErrors);
  
        if (commandIds.has(command.command)) {
          errors.push(`Duplicate command ID: ${command.command}`);
        } else {
          commandIds.add(command.command);
        }
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateCommand(command: CommandContribution): string[] {
      const errors: string[] = [];
  
      if (!command.command) {
        errors.push('Command ID is required');
      } else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(command.command)) {
        errors.push(`Invalid command ID format: ${command.command}`);
      }
  
      if (!command.title) {
        errors.push(`Command ${command.command} title is required`);
      }
  
      return errors;
    }
  
    private validateMenus(
      menus: ContributionPoints['menus'],
      commands?: CommandContribution[]
    ): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      const commandIds = new Set(commands?.map(c => c.command) || []);
  
      for (const [menuId, menuItems] of Object.entries(menus!)) {
        for (const item of menuItems) {
          const itemErrors = this.validateMenuItem(item, menuId, commandIds);
          errors.push(...itemErrors);
        }
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateMenuItem(
      item: MenuContribution,
      menuId: string,
      validCommandIds: Set<string>
    ): string[] {
      const errors: string[] = [];
  
      if (!item.command && !item.submenu) {
        errors.push(`Menu item in ${menuId} must have either command or submenu`);
      }
  
      if (item.command && item.submenu) {
        errors.push(`Menu item in ${menuId} cannot have both command and submenu`);
      }
  
      if (item.command && !validCommandIds.has(item.command)) {
        errors.push(`Menu item references unknown command: ${item.command}`);
      }
  
      if (item.order !== undefined && (item.order < 0 || !Number.isInteger(item.order))) {
        errors.push(`Menu item order must be a non-negative integer`);
      }
  
      return errors;
    }
  
    private validateKeybindings(
      keybindings: KeybindingContribution[],
      commands?: CommandContribution[]
    ): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      const commandIds = new Set(commands?.map(c => c.command) || []);
  
      for (const keybinding of keybindings) {
        const keybindingErrors = this.validateKeybinding(keybinding, commandIds);
        errors.push(...keybindingErrors);
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateKeybinding(
      keybinding: KeybindingContribution,
      validCommandIds: Set<string>
    ): string[] {
      const errors: string[] = [];
  
      if (!keybinding.key) {
        errors.push('Keybinding key is required');
      }
  
      if (!keybinding.command) {
        errors.push('Keybinding command is required');
      } else if (!validCommandIds.has(keybinding.command)) {
        errors.push(`Keybinding references unknown command: ${keybinding.command}`);
      }
  
      // Basic key format validation
      if (keybinding.key && !/^(ctrl|cmd|shift|alt|meta)\+/.test(keybinding.key.toLowerCase())) {
        // Allow simple keys without modifiers for now
      }
  
      return errors;
    }
  
    private validateStatusBar(
      statusBarItems: StatusBarContribution[],
      commands?: CommandContribution[]
    ): ValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];
  
      const commandIds = new Set(commands?.map(c => c.command) || []);
      const itemIds = new Set<string>();
  
      for (const item of statusBarItems) {
        const itemErrors = this.validateStatusBarItem(item, commandIds);
        errors.push(...itemErrors);
  
        if (itemIds.has(item.id)) {
          errors.push(`Duplicate status bar item ID: ${item.id}`);
        } else {
          itemIds.add(item.id);
        }
      }
  
      return { isValid: errors.length === 0, errors, warnings };
    }
  
    private validateStatusBarItem(
      item: StatusBarContribution,
      validCommandIds: Set<string>
    ): string[] {
      const errors: string[] = [];
  
      if (!item.id) {
        errors.push('Status bar item ID is required');
      } else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(item.id)) {
        errors.push(`Invalid status bar item ID format: ${item.id}`);
      }
  
      if (!item.text) {
        errors.push(`Status bar item ${item.id} text is required`);
      }
  
      if (!['left', 'right'].includes(item.alignment)) {
        errors.push(`Status bar item ${item.id} alignment must be 'left' or 'right'`);
      }
  
      if (item.command && !validCommandIds.has(item.command)) {
        errors.push(`Status bar item ${item.id} references unknown command: ${item.command}`);
      }
  
      if (item.priority !== undefined && (item.priority < 0 || !Number.isInteger(item.priority))) {
        errors.push(`Status bar item ${item.id} priority must be a non-negative integer`);
      }
  
      return errors;
    }
  }
  
  // Default validator instance
  export const contributionValidator = new ContributionValidator();