#### package.json
- *Path*: packages/llm-canvas-sdk/package.json
```json
  
   { "name": "@llm-canvas/sdk",
    "author": "Piyush Jaiswal",
    "module": "dist/llm-cavas-sdk.esm.js",
    "version": "0.1.0",
    "license": "MIT",
    "main": "dist/index.js",
    "typings": "dist/index.d.ts",
    "files": [
      "dist",
      "src"
    ],
    "engines": {
      "node": ">=10"
    },
    "scripts": {
      "start": "tsdx watch",
      "build": "tsdx build",
      "test": "tsdx test",
      "lint": "tsdx lint",
      "prepare": "tsdx build",
      "size": "size-limit",
      "analyze": "size-limit --why"
    },
    "husky": {
      "hooks": {
        "pre-commit": "tsdx lint"
      }
    },
    "prettier": {
      "printWidth": 80,
      "semi": true,
      "singleQuote": true,
      "trailingComma": "es5"
    },
    "size-limit": [
      {
        "path": "dist/llm-cavas-sdk.cjs.production.min.js",
        "limit": "10 KB"
      },
      {
        "path": "dist/llm-cavas-sdk.esm.js",
        "limit": "10 KB"
      }
    ],
    "dependencies": {
      "@metamask/safe-event-emitter": "^3.1.2"
    }
  }
```

#### tsconfig.json
- *Path*: packages/llm-canvas-sdk/tsconfig.json
```json
{
  // see https://www.typescriptlang.org/tsconfig to better understand tsconfigs
  "include": ["src", "types"],
  "compilerOptions": {
    "module": "esnext",
    "lib": ["dom", "esnext"],
    "importHelpers": true,
    // output .d.ts declaration files for consumers
    "declaration": true,
    // output .js.map sourcemap files for consumers
    "sourceMap": true,
    // match output dir to input dir. e.g. dist/index instead of dist/src/index
    "rootDir": "./src",
    // stricter type-checking for stronger correctness. Recommended by TS
    "strict": true,
    // linter checks for common issues
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    // noUnused* overlap with @typescript-eslint/no-unused-vars, can disable if duplicative
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    // use Node's module resolution algorithm, instead of the legacy TS one
    "moduleResolution": "node",
    // transpile JSX to React.createElement
    "jsx": "react",
    // interop between ESM and CJS modules. Recommended by TS
    "esModuleInterop": true,
    // significant perf increase by skipping checking .d.ts files, particularly those in node_modules. Recommended by TS
    "skipLibCheck": true,
    // error out if import and file system have a casing mismatch. Recommended by TS
    "forceConsistentCasingInFileNames": true,
    // `tsdx build` ignores this option, but it is commonly used when type-checking separately with `tsc`
    "noEmit": true,
  }
}

```

#### types.ts
- *Path*: packages/llm-canvas-sdk/src/types.ts
```ts
export interface CanvasManifest {
  name: string,
  version: string,
  publisher: string,
  email?: string,
  homepage?: string,
  extensions?: ExtensionManifest[],
  app?: AppManifest
}

export interface AppManifest {
  name: string;
    version: string;
    type: 'app';
    displayName?: string;
    description?: string;
    main?: string;
    icon: {
      sm: string,
      md: string,
      lg: string,
      xl?: string,
      xxl?: string
    }
}


export interface ExtensionManifest {
    name: string;
    version: string;
    type: 'extension';
    displayName?: string;
    description?: string;
    main?: string;
    icon?: string;
    engines: {
      app: string;
    };
    activationEvents?: string[];
    contributes?: ContributionPoints;
    permissions?: string[];
  }
  
  export interface ContributionPoints {
    viewContainers?: {
      [location in ViewContainerLocation]?: ViewContainerContribution[];
    };
    views?: {
      [containerId: string]: ViewContribution[];
    };
    commands?: CommandContribution[];
    menus?: {
      [menuId: string]: MenuContribution[];
    };
    keybindings?: KeybindingContribution[];
    statusBar?: StatusBarContribution[];
    configuration?: ConfigurationContribution[];
    themes?: ThemeContribution[];
    iconThemes?: IconThemeContribution[];
    languages?: LanguageContribution[];
  }
  
  // View Containers
  export enum ViewContainerLocation {
    Sidebar = 'sidebar',
    Panel = 'panel',
    AuxiliaryBar = 'auxiliaryBar',
    MainView = 'mainView'

  }
  
  export interface ViewContainerContribution {
    id: string;
    title: string;
    icon?: string;
    order?: number;
    when?: string;
  }
  
  // Views
  export enum ViewType {
    Tree = 'tree',
    Webview = 'webview',
    Custom = 'custom'
  }
  
  export interface ViewContribution {
    id: string;
    name: string;
    type?: ViewType;
    when?: string;
    icon?: string;
    contextualTitle?: string;
    visibility?: 'visible' | 'hidden' | 'collapsed';
    size?: number;
    order?: number;
    canToggleVisibility?: boolean;
    canMoveViews?: boolean;
    hideByDefault?: boolean;
    focusCommand?: string;
    initialSize?: number;
    minimumSize?: number;
  }
  
  // Commands
  export interface CommandContribution {
    command: string;
    title: string;
    icon?: string | { light: string; dark: string };
    category?: string;
    enablement?: string;
    when?: string;
    shortTitle?: string;
  }
  
  // Menus
  export interface MenuContribution {
    command?: string;
    submenu?: string;
    title?: string;
    // View id
    group?: string;
    order?: number;
    when?: string;
    alt?: string;
  }
  
  // TODO: Update menue according to need
  export const MenuId = {
    CommandPalette: 'commandPalette',
    ViewTitle: 'view/title',
    ViewItemContext: 'view/item/context',
    MainViewContext: 'editor/context',
    MainViewTitle: 'editor/title',
    MenubarFileMenu: 'menubar/file',
    MenubarEditMenu: 'menubar/edit',
    MenubarViewMenu: 'menubar/view',
    MenubarHelpMenu: 'menubar/help',

  } as const;
  
  export type MenuId = typeof MenuId[keyof typeof MenuId];
  
  // Keybindings
  export interface KeybindingContribution {
    key: string;
    command: string;
    when?: string;
    args?: any;
    mac?: string;
    linux?: string;
    win?: string;
  }
  
  // Status Bar
  export interface StatusBarContribution {
    id: string;
    text: string;
    tooltip?: string;
    command?: string;
    alignment: 'left' | 'right';
    priority?: number;
    when?: string;
    backgroundColor?: string;
    color?: string;
    accessibilityInformation?: {
      label: string;
      role?: string;
    };
  }
  
  // Configuration
  export interface ConfigurationContribution {
    title?: string;
    properties: {
      [key: string]: ConfigurationPropertySchema;
    };
  }
  
  export interface ConfigurationPropertySchema {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    default?: any;
    enum?: any[];
    enumDescriptions?: string[];
    minimum?: number;
    maximum?: number;
    pattern?: string;
    format?: string;
    items?: ConfigurationPropertySchema;
    properties?: { [key: string]: ConfigurationPropertySchema };
    additionalProperties?: boolean | ConfigurationPropertySchema;
    scope?: 'application' | 'window' | 'resource' | 'language-overridable';
    deprecationMessage?: string;
    markdownDescription?: string;
  }
  
  // Themes
  export interface ThemeContribution {
    id: string;
    label: string;
    uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
    path: string;
  }
  
  export interface IconThemeContribution {
    id: string;
    label: string;
    path: string;
  }
  
  // Languages
  export interface LanguageContribution {
    id: string;
    aliases?: string[];
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    mimetypes?: string[];
    configuration?: string;
  }
  
  // Resolved contributions (after processing)
  export interface ResolvedViewContainerContribution extends ViewContainerContribution {
    extensionId: string;
    location: ViewContainerLocation;
  }
  
  export interface ResolvedViewContribution extends ViewContribution {
    extensionId: string;
    containerId: string;
  }
  
  export interface ResolvedCommandContribution extends CommandContribution {
    extensionId: string;
  }
  
  export interface ResolvedMenuContribution extends MenuContribution {
    extensionId: string;
    menuId: string;
  }
  
  export interface ResolvedKeybindingContribution extends KeybindingContribution {
    extensionId: string;
  }
  
  export interface ResolvedStatusBarContribution extends StatusBarContribution {
    extensionId: string;
  }
  
  // Events
  export interface ContributionChangeEvent {
    extensionId: string;
    type: 'added' | 'removed' | 'updated';
    contributionType: keyof ContributionPoints | 'all';
    data?: any;
  }
  
  // Error types
  export class ContributionError extends Error {
    constructor(
      message: string,
      public readonly extensionId: string,
      public readonly contributionType: string,
      public readonly contributionId?: string
    ) {
      super(message);
      this.name = 'ContributionError';
    }
  }
  
  export class ContributionValidationError extends ContributionError {
    constructor(
      message: string,
      extensionId: string,
      contributionType: string,
      contributionId?: string,
      public readonly validationErrors?: string[]
    ) {
      super(message, extensionId, contributionType, contributionId);
      this.name = 'ContributionValidationError';
    }
  }


export interface CanvasAPI {
  // Extension management
  extensions: {
    list: () => Promise<any>,
    activate: (extensionId: string) => Promise<any>,
    deactivate: (extensionId: string) => Promise<any>
  },

  // Command execution
  commands: {
    execute: (command: string, ...args: any[]) =>
      Promise<any>,
    list: () => Promise<any>
  },

  // Workspace management
  workspace: {
    openFolder: (folderPath: string) => Promise<any>,
    getFolders: () => Promise<any>,
    getConfiguration: (section?: string) =>
      Promise<any>
  },

  // Service management
  services: {
    list: () => Promise<any>,
    call: (serviceId: string, method: string, params: any) =>
      Promise<any>
  },

  // Permission management
  permissions: {
    request: (extensionId: string, permissions: string[]) =>
      Promise<any>,
    check: (extensionId: string, permission: string) =>
      Promise<any>
  },

  // Window management
  window: {
    showMessage: (type: string, message: string, buttons?: string[]) =>
      Promise<any>
  },

  // Contribution system
  contributions: {
    getViewContainers: (location?: string) =>
      Promise<ResolvedViewContainerContribution[]>,
    getViews: (containerId?: string) => Promise<ResolvedViewContribution[]>,
    getCommands: () => Promise<ResolvedCommandContribution[]>,
    getMenuContributions: (menuId: string) =>
      Promise<ResolvedMenuContribution[]>,
    getStatusBarItems: () => Promise<ResolvedStatusBarContribution[]>,
    executeCommand: <T = any>(command: string, ...args: any[]) =>
      Promise<T>
  },

  // Event handling
  events: {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void,

    off: (channel: string, listener: (event: any, ...args: any[]) => void) => void,

    once: (channel: string, listener: (event: any, ...args: any[]) => void) => void
  },

  // File system operations
  fs: {
    readFile: (filepath: string, options?: { encoding?: string }) => Promise<any>,

    writeFile:  (filepath: string, data: Uint8Array | string) => Promise<any>,

    exists:  (filepath: string) => Promise<any>,

    mkdir: (dirpath: string, options?: { recursive?: boolean }) => Promise<any>,

    readdir: (dirpath: string) => Promise<any>,

    stat: (filepath: string) => Promise<any>
  },

  // System info
  system: {
    platform: string,
    arch: string,
    version: string
  }
}


export enum ExtensionHostEvents {
  contributionsChanged = 'contributionsChanged',
  contributionsRegistered = 'contributionsRegistered',
  contributionsUnregistered = 'contributionsUnregistered',
  extensionActivated = 'extensionActivated',
  extensionDeactivated = 'extensionDeactivated',
  extensionError = 'extensionError'
}
```

#### index.ts
- *Path*: packages/llm-canvas-sdk/src/index.ts
```ts
export  * from "./types"
export * from "./contribution"
```

#### contextEvaluator.ts
- *Path*: packages/llm-canvas-sdk/src/contribution/contextEvaluator.ts
```ts
export interface Context {
    [key: string]: any;
  }
  
  export interface ContextKey {
    key: string;
    type: 'boolean' | 'string' | 'number';
    description: string;
    defaultValue?: any;
  }
  
  /**
   * Evaluates 'when' clause expressions against a context
   */
  export class ContextEvaluator {
    private readonly contextKeys = new Map<string, ContextKey>();
    private readonly context = new Map<string, any>();
  
    /**
     * Register a context key
     */
    registerContextKey(contextKey: ContextKey): void {
      this.contextKeys.set(contextKey.key, contextKey);
      
      if (contextKey.defaultValue !== undefined) {
        this.context.set(contextKey.key, contextKey.defaultValue);
      }
    }
  
    /**
     * Set a context value
     */
    setContext(key: string, value: any): void {
      const contextKey = this.contextKeys.get(key);
      if (contextKey) {
        // Type validation
        if (!this.isValidType(value, contextKey.type)) {
          throw new Error(`Invalid type for context key '${key}'. Expected ${contextKey.type}, got ${typeof value}`);
        }
      }
      
      this.context.set(key, value);
    }
  
    /**
     * Get a context value
     */
    getContext(key: string): any {
      return this.context.get(key);
    }
  
    /**
     * Evaluate a 'when' clause expression
     */
    evaluate(expression: string): boolean {
      if (!expression || expression.trim() === '') {
        return true;
      }
  
      try {
        return this.evaluateExpression(expression.trim());
      } catch (error) {
        console.warn(`Failed to evaluate when clause '${expression}':`, error);
        return false;
      }
    }
  
    /**
     * Get all registered context keys
     */
    getContextKeys(): ContextKey[] {
      return Array.from(this.contextKeys.values());
    }
  
    /**
     * Get current context
     */
    getCurrentContext(): Map<string, any> {
      return new Map(this.context);
    }
  
    private isValidType(value: any, expectedType: string): boolean {
      switch (expectedType) {
        case 'boolean':
          return typeof value === 'boolean';
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number';
        default:
          return true;
      }
    }
  
    private evaluateExpression(expression: string): boolean {
      // Handle simple cases
      if (expression === 'true') return true;
      if (expression === 'false') return false;
  
      // Handle negation
      if (expression.startsWith('!')) {
        return !this.evaluateExpression(expression.slice(1).trim());
      }
  
      // Handle logical operators
      if (expression.includes('&&')) {
        const parts = expression.split('&&').map(p => p.trim());
        return parts.every(part => this.evaluateExpression(part));
      }
  
      if (expression.includes('||')) {
        const parts = expression.split('||').map(p => p.trim());
        return parts.some(part => this.evaluateExpression(part));
      }
  
      // Handle comparison operators
      const comparisonMatch = expression.match(/^(.+?)\s*(==|!=|<|>|<=|>=)\s*(.+)$/);
      if (comparisonMatch) {
        const [, left, operator, right] = comparisonMatch;
        return this.evaluateComparison(left.trim(), operator, right.trim());
      }
  
      // Handle context key lookup
      if (expression.includes('.')) {
        return this.evaluateContextKey(expression);
      }
  
      // Simple context key
      const value = this.context.get(expression);
      return Boolean(value);
    }
  
    private evaluateComparison(left: string, operator: string, right: string): boolean {
      const leftValue = this.getExpressionValue(left);
      const rightValue = this.getExpressionValue(right);
  
      switch (operator) {
        case '==':
          return leftValue === rightValue;
        case '!=':
          return leftValue !== rightValue;
        case '<':
          return leftValue < rightValue;
        case '>':
          return leftValue > rightValue;
        case '<=':
          return leftValue <= rightValue;
        case '>=':
          return leftValue >= rightValue;
        default:
          return false;
      }
    }
  
    private evaluateContextKey(expression: string): boolean {
      // Handle nested context keys like 'view.focused'
      const parts = expression.split('.');
      let value = this.context.get(parts[0]);
      
      for (let i = 1; i < parts.length && value != null; i++) {
        value = value[parts[i]];
      }
      
      return Boolean(value);
    }
  
    private getExpressionValue(expression: string): any {
      // Handle quoted strings
      if ((expression.startsWith('"') && expression.endsWith('"')) ||
          (expression.startsWith("'") && expression.endsWith("'"))) {
        return expression.slice(1, -1);
      }
  
      // Handle numbers
      if (/^\d+(\.\d+)?$/.test(expression)) {
        return parseFloat(expression);
      }
  
      // Handle booleans
      if (expression === 'true') return true;
      if (expression === 'false') return false;
  
      // Handle context keys
      if (expression.includes('.')) {
        const parts = expression.split('.');
        let value = this.context.get(parts[0]);
        
        for (let i = 1; i < parts.length && value != null; i++) {
          value = value[parts[i]];
        }
        
        return value;
      }
  
      // Simple context key
      return this.context.get(expression);
    }
  }
  
  // Default context evaluator instance
  export const contextEvaluator = new ContextEvaluator();
  
  // Register common context keys
  contextEvaluator.registerContextKey({
    key: 'extensionDevelopment',
    type: 'boolean',
    description: 'Whether the application is running in extension development mode',
    defaultValue: false
  });
  
  contextEvaluator.registerContextKey({
    key: 'workspaceHasFiles',
    type: 'boolean',
    description: 'Whether the workspace has any files',
    defaultValue: false
  });
  
  contextEvaluator.registerContextKey({
    key: 'view',
    type: 'string',
    description: 'The currently focused view ID',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'viewItem',
    type: 'string',
    description: 'The context value of the selected view item',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'resourceExtname',
    type: 'string',
    description: 'The file extension of the selected resource',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'resourceFilename',
    type: 'string',
    description: 'The filename of the selected resource',
    defaultValue: ''
  });
```

#### contributionLoader.ts
- *Path*: packages/llm-canvas-sdk/src/contribution/contributionLoader.ts
```ts
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

```

#### index.ts
- *Path*: packages/llm-canvas-sdk/src/contribution/index.ts
```ts
export { ContributionRegistry, contributionRegistry, ContributionRegistryOptions } from './contributionRegistry';
export { ContributionLoader } from './contributionLoader';
export { ContextEvaluator, contextEvaluator } from './contextEvaluator';
export { ContributionValidator, contributionValidator} from './contributionValidator'
export * from '../types';

import {ContributionRegistry, ContributionRegistryOptions} from "./contributionRegistry"
import {ContributionLoader, ContributionLoaderOptions} from "./contributionLoader"

// Utility functions
export function createContributionRegistry(options?: ContributionRegistryOptions) {
  return new ContributionRegistry(options);
}

export function createContributionLoader(
  registry: ContributionRegistry,
  options?: ContributionLoaderOptions
) {
  return new ContributionLoader(registry, options);
}
```

#### contributionValidator.ts
- *Path*: packages/llm-canvas-sdk/src/contribution/contributionValidator.ts
```ts
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
```

#### contributionRegistry.ts
- *Path*: packages/llm-canvas-sdk/src/contribution/contributionRegistry.ts
```ts
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
```

#### nextjs.json
- *Path*: packages/typescript-config/nextjs.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}

```

#### package.json
- *Path*: packages/typescript-config/package.json
```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}

```

#### react-library.json
- *Path*: packages/typescript-config/react-library.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}

```

#### base.json
- *Path*: packages/typescript-config/base.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}

```

#### electron.vite.config.ts
- *Path*: apps/llm-canvas/electron.vite.config.ts
```ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@shared': resolve('src/shared'),
        '@preload': resolve('src/preload')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})

```

#### tsconfig.node.json
- *Path*: apps/llm-canvas/tsconfig.node.json
```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "include": ["electron.vite.config.*", "src/main/**/*", "src/preload/**/*", "src/shared/**/*", "../../packages/llm-canvas-sdk/src/contribution/contributionLoader.ts"],
  "compilerOptions": {
    "composite": true,
    "types": ["electron-vite/node"],
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@shared/*": [
        "src/shared/*"
      ],
      "@main/*": [
        "src/main/*"
      ],
      "@preload/*": [
        "src/preload/*"
      ]
    }
  }
}

```

#### .npmrc
- *Path*: apps/llm-canvas/.npmrc
```txt
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/

```

#### .prettierignore
- *Path*: apps/llm-canvas/.prettierignore
```txt
out
dist
pnpm-lock.yaml
LICENSE.md
tsconfig.json
tsconfig.*.json

```

#### .editorconfig
- *Path*: apps/llm-canvas/.editorconfig
```txt
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
```

#### tsconfig.web.json
- *Path*: apps/llm-canvas/tsconfig.web.json
```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.web.json",
  "include": [
    "src/renderer/src/env.d.ts",
    "src/renderer/src/**/*",
    "src/renderer/src/**/*.tsx",
    "src/preload/*.d.ts",
    "src/shared/**/*"
  ],
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@renderer/*": [
        "src/renderer/src/*"
      ],
      "@shared/*": [
        "src/shared/*"
      ],
      "@preload/*": [
        "src/preload/*"
      ]
    }
  }
}

```

#### package.json
- *Path*: apps/llm-canvas/package.json
```json
{
  "name": "llm-canvas",
  "version": "1.0.0",
  "description": "An Electron application with React and TypeScript",
  "main": "./out/main/index.js",
  "author": "iampiyushjaiswal103@gmail.com",
  "homepage": "https://electron-vite.org",
  "scripts": {
    "format": "prettier --write .",
    "lint": "eslint --cache .",
    "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
    "typecheck:web": "tsc --noEmit -p tsconfig.web.json --composite false",
    "typecheck": "npm run typecheck:node && npm run typecheck:web",
    "start": "electron-vite preview",
    "dev": "electron-vite dev",
    "build": "npm run typecheck && electron-vite build",
    "postinstall": "electron-builder install-app-deps",
    "build:unpack": "npm run build && electron-builder --dir",
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "electron-vite build && electron-builder --mac",
    "build:linux": "electron-vite build && electron-builder --linux"
  },
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.2",
    "@electron-toolkit/utils": "^4.0.0",
    "@llm-canvas/sdk": "*",
    "@metamask/safe-event-emitter": "^3.1.2",
    "@preact/signals-react": "^3.3.0",
    "@tailwindcss/vite": "^4.1.13",
    "chokidar": "^4.0.3",
    "electron-updater": "^6.3.9",
    "tailwindcss": "^4.1.13",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@electron-toolkit/eslint-config-prettier": "^3.0.0",
    "@electron-toolkit/eslint-config-ts": "^3.0.0",
    "@electron-toolkit/tsconfig": "^1.0.1",
    "@types/chokidar": "^1.7.5",
    "@types/node": "^22.16.5",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.7.0",
    "electron": "37.2.3",
    "electron-builder": "^25.1.8",
    "electron-vite": "^4.0.0",
    "eslint": "^9.31.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "prettier": "^3.6.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.8.3",
    "vite": "^7.0.5"
  }
}

```

#### .prettierrc.yaml
- *Path*: apps/llm-canvas/.prettierrc.yaml
```yaml
singleQuote: true
semi: false
printWidth: 100
trailingComma: none

```

#### tsconfig.json
- *Path*: apps/llm-canvas/tsconfig.json
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }, { "path": "./tsconfig.web.json" }]
}

```

#### eslint.config.mjs
- *Path*: apps/llm-canvas/eslint.config.mjs
```mjs
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules
    }
  },
  eslintConfigPrettier
)

```

#### Contribution Point.md
- *Path*: apps/llm-canvas/architecture/Contribution Point.md
```md
# LLM Canvas Contribution Points Technical Specification

Based on your architecture and inspired by VS Code's contribution system, here's a comprehensive technical specification for implementing contribution points in your LLM Canvas application.

## Overview

The contribution points system will allow extensions to declaratively extend the UI through their `package.json` manifest, while providing runtime APIs for dynamic interactions. This follows VS Code's proven pattern of static declarations + dynamic runtime APIs.

## 1. Core Architecture Files

### 1.1 Contribution Registry (`packages/llm-canvas-sdk/src/contributions/`)

**`contributionRegistry.ts`**
- Central registry for all contribution points
- Manages registration/deregistration of contributions
- Validates contribution schemas
- Provides query APIs for the UI layer
- Handles contribution lifecycle events

**`contributionTypes.ts`**
- TypeScript interfaces for all contribution point types
- Validation schemas using Zod or similar
- Default values and constraints

**`contributionLoader.ts`**
- Loads contributions from extension manifests
- Validates against schemas
- Handles conditional contributions (`when` clauses)
- Processes contribution merging and conflicts

### 1.2 View System (`packages/llm-canvas-sdk/src/views/`)

**`viewContainerRegistry.ts`**
- Manages view containers (sidebar, panel, auxiliary bar)
- Handles container ordering and visibility
- Provides container lifecycle management

**`viewRegistry.ts`** (already exists, needs enhancement)
- Enhanced to integrate with contribution system
- Add contribution-based view registration
- Handle view ordering within containers

**`viewProviderRegistry.ts`**
- Manages tree data providers and webview providers
- Links providers to their corresponding views
- Handles provider lifecycle and error recovery

### 1.3 Command System (`packages/llm-canvas-sdk/src/commands/`)

**`commandRegistry.ts`**
- Central command registration and execution
- Command validation and error handling
- Command history and undo/redo support
- Command palette integration

**`commandContributions.ts`**
- Handles command contributions from extensions
- Manages command metadata (title, icon, category)
- Processes keybinding contributions

### 1.4 Menu System (`packages/llm-canvas-sdk/src/menus/`)

**`menuRegistry.ts`**
- Manages all menu contribution points
- Handles menu item ordering and grouping
- Processes conditional menu items

**`menuContributions.ts`**
- Loads menu contributions from manifests
- Validates menu item schemas
- Handles submenu creation and nesting

## 2. Extension Host Integration (`apps/llm-canvas/src/main/extensions/`)

### 2.1 Extension Host Process

**`extensionHost.ts`**
- Main extension host process manager
- Loads and sandboxes extensions
- Manages extension lifecycle
- Handles communication with main process

**`extensionLoader.ts`**
- Loads extension manifests
- Validates extension packages
- Handles extension dependencies
- Manages extension activation events

**`contributionProcessor.ts`**
- Processes contributions from loaded extensions
- Validates contribution schemas
- Sends contributions to main process registry
- Handles contribution updates and removals

### 2.2 Extension API Bridge

**`apiProvider.ts`**
- Provides the extension API to loaded extensions
- Implements the SDK interfaces in the extension context
- Handles API versioning and compatibility
- Manages extension permissions

## 3. Main Process Integration (`apps/llm-canvas/src/main/contributions/`)

### 3.1 Contribution Management

**`contributionManager.ts`**
- Coordinates between extension host and renderer
- Manages contribution state synchronization
- Handles contribution conflicts and merging
- Provides IPC handlers for contribution queries

**`contributionSynchronizer.ts`**
- Synchronizes contributions between processes
- Handles real-time contribution updates
- Manages contribution caching and persistence
- Provides optimistic updates for UI responsiveness

## 4. Renderer Process Integration (`apps/llm-canvas/src/renderer/src/contributions/`)

### 4.1 UI Integration

**`contributionProvider.tsx`**
- React context provider for contributions
- Provides contribution data to UI components
- Handles contribution updates and re-renders
- Manages contribution loading states

**`contributionHooks.ts`**
- React hooks for accessing contribution data
- `useViewContainers()`, `useViews()`, `useCommands()`, etc.
- Handles subscription to contribution changes
- Provides filtered and sorted contribution data

### 4.2 UI Components

**`ContributedViewContainer.tsx`**
- Renders view containers based on contributions
- Handles container resizing and layout
- Manages container visibility and state
- Integrates with drag-and-drop for view movement

**`ContributedView.tsx`**
- Renders individual views from contributions
- Handles view lifecycle (mount/unmount)
- Manages view state and persistence
- Provides view-specific context menus

**`ContributedMenu.tsx`**
- Renders menus from contributions
- Handles menu item actions and commands
- Manages menu visibility and conditional items
- Supports nested menus and separators

## 5. Contribution Point Specifications

### 5.1 View Containers

```typescript
interface ViewContainerContribution {
  id: string;
  title: string;
  icon?: string;
  order?: number;
  location: 'sidebar' | 'panel' | 'auxiliaryBar';
  when?: string; // condition expression
}
```

**Supported Locations:**
- `sidebar` - Left sidebar
- `panel` - Bottom panel
- `auxiliaryBar` - Right sidebar

### 5.2 Views

```typescript
interface ViewContribution {
  id: string;
  name: string;
  containerId: string;
  type: 'tree' | 'webview' | 'custom';
  when?: string;
  icon?: string;
  contextualTitle?: string;
  visibility?: 'visible' | 'hidden' | 'collapsed';
  size?: number;
  order?: number;
  canToggleVisibility?: boolean;
  canMoveViews?: boolean;
  hideByDefault?: boolean;
}
```

### 5.3 Commands

```typescript
interface CommandContribution {
  command: string;
  title: string;
  icon?: string;
  category?: string;
  enablement?: string; // condition expression
  when?: string;
}
```

### 5.4 Menus

```typescript
interface MenuContribution {
  id: string;
  label: string;
  icon?: string;
  command?: string;
  submenu?: string;
  group?: string;
  order?: number;
  when?: string;
  alt?: string; // alternative command for alt+click
}
```

**Menu Locations:**
- `commandPalette` - Command palette
- `view/title` - View title bar
- `view/item/context` - Tree view item context menu
- `explorer/context` - File explorer context menu
- `editor/context` - Editor context menu
- `menubar` - Top menu bar

### 5.5 Status Bar

```typescript
interface StatusBarContribution {
  id: string;
  text: string;
  tooltip?: string;
  command?: string;
  alignment: 'left' | 'right';
  priority?: number;
  when?: string;
  backgroundColor?: string;
  color?: string;
}
```

### 5.6 Keybindings

```typescript
interface KeybindingContribution {
  key: string;
  command: string;
  when?: string;
  args?: any;
  mac?: string;
  linux?: string;
  win?: string;
}
```

## 6. Implementation Phases

### Phase 1: Core Infrastructure
1. Implement contribution registry and loader
2. Create basic view container and view system
3. Set up extension host integration
4. Implement command system

### Phase 2: UI Integration
1. Create React components for contributed UI
2. Implement menu system
3. Add status bar contributions
4. Create contribution provider and hooks

### Phase 3: Advanced Features
1. Implement keybinding contributions
2. Add conditional expressions (`when` clauses)
3. Implement contribution validation and error handling
4. Add contribution hot-reloading during development

### Phase 4: Polish and Optimization
1. Add contribution conflict resolution
2. Implement contribution caching and persistence
3. Add comprehensive testing
4. Optimize performance for large numbers of contributions

## 7. Example Extension Manifest

```json
{
  "name": "my-extension",
  "contributes": {
    "viewContainers": {
      "sidebar": [
        {
          "id": "myExtension.explorer",
          "title": "My Explorer",
          "icon": "$(folder)",
          "order": 1
        }
      ]
    },
    "views": {
      "myExtension.explorer": [
        {
          "id": "myExtension.fileTree",
          "name": "Files",
          "type": "tree",
          "when": "workspaceHasFiles"
        },
        {
          "id": "myExtension.outline",
          "name": "Outline",
          "type": "webview"
        }
      ]
    },
    "commands": [
      {
        "command": "myExtension.refreshFiles",
        "title": "Refresh Files",
        "icon": "$(refresh)"
      }
    ],
    "menus": {
      "view/title": [
        {
          "command": "myExtension.refreshFiles",
          "when": "view == myExtension.fileTree",
          "group": "navigation"
        }
      ]
    },
    "keybindings": [
      {
        "command": "myExtension.refreshFiles",
        "key": "ctrl+shift+r",
        "when": "view == myExtension.fileTree"
      }
    ]
  }
}
```

This specification provides a solid foundation for implementing VS Code-style contribution points in your LLM Canvas application, ensuring extensibility while maintaining security and performance.
```

#### types.ts
- *Path*: apps/llm-canvas/src/types.ts
```ts

```

#### index.html
- *Path*: apps/llm-canvas/src/renderer/index.html
```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>LLM Canvas</title>
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
    />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

#### App.tsx
- *Path*: apps/llm-canvas/src/renderer/src/App.tsx
```tsx
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App

```

#### main.tsx
- *Path*: apps/llm-canvas/src/renderer/src/main.tsx
```tsx
import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import { CanvasAPI } from '@llm-canvas/sdk'

declare global {
  interface Window {
    // electronAPI: any
    LLMCANVAS_VERSION: string
    canvas: CanvasAPI
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

```

#### contribution.ts
- *Path*: apps/llm-canvas/src/renderer/src/signals/contribution.ts
```ts
import { ResolvedViewContainerContribution } from '@llm-canvas/sdk'
import { signal } from '@preact/signals-react'

export const resolvedViewContainerContributionSignal = signal<ResolvedViewContainerContribution[]>(
  []
)
export const setResolvedViewContainerContribution = (
  contributions: ResolvedViewContainerContribution[]
): void => {
  resolvedViewContainerContributionSignal.value = contributions
}

```

#### index.ts
- *Path*: apps/llm-canvas/src/renderer/src/signals/index.ts
```ts
export * from './contribution'

```

#### Versions.tsx
- *Path*: apps/llm-canvas/src/renderer/src/components/Versions.tsx
```tsx
import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions

```

#### ViewContainer.tsx
- *Path*: apps/llm-canvas/src/renderer/src/components/contributions/ViewContainer.tsx
```tsx
import React from 'react';
import { ResolvedViewContainerContribution } from '@llm-canvas/sdk';
import { useViewContainers } from '../../hooks/useViewContainers';
import { View } from './View';

interface ViewContainerProps {
  container: ResolvedViewContainerContribution;
  className?: string;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ container, className = '' }) => {
  const { data: views, loading, error } = useViewContainers(container.id)

  if (loading) {
    return (
      <div className={`view-container ${className}`}>
        <div className="view-container-header">
          <span className="view-container-title">{container.title}</span>
        </div>
        <div className="view-container-content">
          <div className="loading-spinner">Loading views...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`view-container ${className}`}>
        <div className="view-container-header">
          <span className="view-container-title">{container.title}</span>
        </div>
        <div className="view-container-content">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  const sortedViews = views.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`view-container ${className}`} data-container-id={container.id}>
      <div className="view-container-header">
        {container.icon && <span className="view-container-icon">{container.icon}</span>}
        <span className="view-container-title">{container.title}</span>
      </div>
      <div className="view-container-content">
        {sortedViews.map(view => (
          <View key={view.id} view={view} />
        ))}
      </div>
    </div>
  );
};
```

#### useCommandExecution.ts
- *Path*: apps/llm-canvas/src/renderer/src/hooks/useCommandExecution.ts
```ts
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

```

#### useViewContainers.ts
- *Path*: apps/llm-canvas/src/renderer/src/hooks/useViewContainers.ts
```ts
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

```

#### index.ts
- *Path*: apps/llm-canvas/src/main/index.ts
```ts
/* eslint-disable @typescript-eslint/no-this-alias */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ContributionManager } from './contributions/contributionManager'
import { setupContributionIpcHandlers } from './ipc/contributionHandler'
import fs from 'fs'

export class LLMCanvasApp {
  private mainWindow: BrowserWindow | null = null
  private contributionManager: ContributionManager | null = null

  constructor() {
    this.setupEventHandlers()
  }

  async initialize(): Promise<void> {
    console.log('Initializing LLM Canvas...')

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.llmcanvas')

    // Create main window
    await this.createMainWindow()

    // Initialize contribution system
    await this.initializeContributionSystem()

    // Setup IPC handlers
    this.setupIpcHandlers()

    console.log('LLM Canvas initialized successfully')
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      icon: icon,
      show: false
    })

    // Load the renderer
    const self = this
    this.mainWindow.on('ready-to-show', () => {
      self.mainWindow!.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private async initializeContributionSystem(): Promise<void> {
    if (!this.mainWindow) {
      throw new Error('Main window must be created before initializing contribution system')
    }

    // Get extensions path - in development, use a local extensions folder
    const extensionsPath = is.dev
      ? path.join(__dirname, '../../extensions')
      : path.join(process.resourcesPath, 'extensions')

    // Create extensions directory if it doesn't exist
    // const fs = import('fs')
    if (!fs.existsSync(extensionsPath)) {
      fs.mkdirSync(extensionsPath, { recursive: true })
    }

    this.contributionManager = new ContributionManager({
      extensionsPath,
      enableDevelopmentMode: is.dev
    })

    await this.contributionManager.initialize(this.mainWindow)
  }

  private setupEventHandlers(): void {
    app.whenReady().then(() => this.initialize())

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', async () => {
      if (this.mainWindow === null) {
        await this.createMainWindow()
      }
    })

    app.on('before-quit', async () => {
      if (this.contributionManager) {
        await this.contributionManager.shutdown()
      }
    })
  }

  private setupIpcHandlers(): void {
    if (!this.contributionManager) {
      throw new Error('Contribution manager not initialized')
    }

    // Setup contribution-specific IPC handlers
    setupContributionIpcHandlers(this.contributionManager)

    // Window management
    ipcMain.handle(
      'window:show-message',
      (_, type: string, message: string, buttons?: string[]) => {
        // This will be forwarded to the renderer for UI display
        this.mainWindow?.webContents.send('window:show-message', { type, message, buttons })
      }
    )

    // Development helpers
    if (is.dev) {
      ipcMain.handle('dev:reload-extensions', async () => {
        if (this.contributionManager) {
          // In a real implementation, this would reload all extensions
          console.log('Reloading extensions...')
        }
      })

      ipcMain.handle('dev:get-extension-logs', async () => {
        // Return extension logs for debugging
        return []
      })
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getContributionManager(): ContributionManager | null {
    return this.contributionManager
  }
}

// Initialize the application
const llmCanvasApp = new LLMCanvasApp()

// Handle app events
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

export default llmCanvasApp

```

#### contributionManager.ts
- *Path*: apps/llm-canvas/src/main/contributions/contributionManager.ts
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { ContributionRegistry, ContributionLoader, ExtensionHostEvents } from '@llm-canvas/sdk'
import { ExtensionHost, ExtensionInfo } from '../extensions/extensionHost'
import { BrowserWindow } from 'electron'

export interface ContributionManagerOptions {
  extensionsPath: string
  enableDevelopmentMode?: boolean
}

export class ContributionManager extends SafeEventEmitter {
  private readonly contributionRegistry: ContributionRegistry
  private readonly contributionLoader: ContributionLoader
  private readonly extensionHost: ExtensionHost
  private mainWindow: BrowserWindow | null = null

  constructor(options: ContributionManagerOptions) {
    super()

    this.contributionRegistry = new ContributionRegistry({
      enableValidation: true,
      enableConflictResolution: true
    })

    this.contributionLoader = new ContributionLoader(this.contributionRegistry)

    this.extensionHost = new ExtensionHost({
      extensionsPath: options.extensionsPath,
      enableDevelopmentMode: options.enableDevelopmentMode
    })

    this.setupEventHandlers()
  }

  async initialize(mainWindow: BrowserWindow): Promise<void> {
    this.mainWindow = mainWindow

    // Start extension host
    await this.extensionHost.start()

    // Load extensions
    const extensions = await this.extensionHost.loadExtensions()

    // Process contributions from loaded extensions
    for (const extension of extensions) {
      try {
        await this.contributionLoader.loadContributions(extension.manifest)
      } catch (error) {
        console.error(`Failed to load contributions for ${extension.id}:`, error)
      }
    }

    // Auto-activate extensions based on activation events
    await this.processActivationEvents(['onStartup'])

    console.log(`Loaded ${extensions.length} extensions with contributions`)
  }

  async shutdown(): Promise<void> {
    await this.extensionHost.stop()
    this.contributionRegistry.dispose()
  }

  async activateExtension(extensionId: string): Promise<void> {
    await this.extensionHost.activateExtension(extensionId)
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    await this.extensionHost.deactivateExtension(extensionId)
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return this.extensionHost.executeCommand(command, ...args)
  }

  getContributionRegistry(): ContributionRegistry {
    return this.contributionRegistry
  }

  getExtensions(): ExtensionInfo[] {
    return this.extensionHost.getExtensions()
  }

  private setupEventHandlers(): void {
    // Listen for contribution changes from extension host
    this.extensionHost.on(ExtensionHostEvents.contributionsChanged, (event) => {
      this.handleContributionChange(event)
    })

    // Listen for contribution registry changes
    this.contributionRegistry.on(ExtensionHostEvents.contributionsRegistered, (event) => {
      this.notifyRenderer(ExtensionHostEvents.contributionsChanged, event)
    })

    this.contributionRegistry.on(ExtensionHostEvents.contributionsUnregistered, (event) => {
      this.notifyRenderer(ExtensionHostEvents.contributionsChanged, event)
    })

    // Listen for extension activation events
    this.extensionHost.on(ExtensionHostEvents.extensionActivated, (extensionId) => {
      this.notifyRenderer(ExtensionHostEvents.extensionActivated, { extensionId })
    })

    this.extensionHost.on(ExtensionHostEvents.extensionDeactivated, (extensionId) => {
      this.notifyRenderer(ExtensionHostEvents.extensionDeactivated, { extensionId })
    })
  }

  private handleContributionChange(event: any): void {
    // Process contribution changes from extension host
    if (event.type === 'added') {
      // Extension was activated, contributions were already loaded during initialization
      console.log(`Contributions activated for extension: ${event.extensionId}`)
    } else if (event.type === 'removed') {
      // Extension was deactivated, remove its contributions
      this.contributionRegistry.unregisterExtensionContributions(event.extensionId)
    }
  }

  private async processActivationEvents(events: string[]): Promise<void> {
    const extensions = this.extensionHost.getExtensions()

    for (const extension of extensions) {
      if (extension.isActive) continue

      const shouldActivate = extension.activationEvents.some((event) => events.includes(event))

      if (shouldActivate) {
        try {
          await this.extensionHost.activateExtension(extension.id)
        } catch (error) {
          console.error(`Failed to activate extension ${extension.id}:`, error)
        }
      }
    }
  }

  private notifyRenderer(channel: string, data: any): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}

```

#### extensionHostProcess.ts
- *Path*: apps/llm-canvas/src/main/extensions/extensionHostProcess.ts
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as path from 'path'
import { ExtensionHostEvents, ExtensionManifest, CanvasManifest } from '@llm-canvas/sdk'

interface ExtensionContext {
  subscriptions: Array<{ dispose(): void }>
  extensionPath: string
  globalState: any
  workspaceState: any
}

interface LoadedExtension {
  id: string
  manifest: ExtensionManifest
  path: string
  context: ExtensionContext
  module: any
  isActive: boolean
}

class ExtensionHostProcess {
  private extensions = new Map<string, LoadedExtension>()
  private extensionsPath = ''
  private developmentMode = false
  private api: any

  async initialize(params: { extensionsPath: string; developmentMode: boolean }): Promise<void> {
    // TODO: Update this for using settings configuration
    this.extensionsPath = params.extensionsPath
    this.developmentMode = params.developmentMode

    // Create the extension API
    this.api = this.createExtensionAPI()

    // Set up global error handling
    process.on('uncaughtException', (error) => {
      this.sendNotification(ExtensionHostEvents.extensionError, {
        error: error.message,
        stack: error.stack
      })
    })

    console.log('Extension host initialized')
  }

  async loadExtensions(): Promise<any[]> {
    const extensionDirs = await this.findExtensionDirectories()
    const extensions: {
      id: string
      manifest: ExtensionManifest
      path: string
      isActive: boolean
      activationEvents: string[]
    }[] = []

    for (const dir of extensionDirs) {
      try {
        const manifestJsonPath = path.join(dir, 'manifest.json')
        const manifestJsonContent = await fs.promises.readFile(manifestJsonPath, 'utf8')
        const manifest: CanvasManifest = JSON.parse(manifestJsonContent)
        if (!manifest.name || !manifest.publisher) {
          throw new Error('Invalid extension manifest: missing name or publisher')
        }

        if (manifest.extensions === undefined || manifest.extensions!.length === 0) {
          continue
        }

        for (const extensionManifest of manifest.extensions) {
          extensionManifest.name = `${manifest.publisher}.${extensionManifest.name}`
          const extension = await this.loadExtension(extensionManifest, dir)
          if (extension) {
            extensions.push({
              id: extension.id,
              manifest: extension.manifest,
              path: extension.path,
              isActive: extension.isActive,
              activationEvents: extension.manifest.activationEvents || []
            })
          }
        }
      } catch (error) {
        console.error(`Failed to load extension from ${dir}:`, error)
        this.sendNotification(ExtensionHostEvents.extensionError, {
          path: dir,
          error: (error as any).message
        })
      }
    }

    return extensions
  }

  async activateExtension(params: { extensionId: string }): Promise<void> {
    const extension = this.extensions.get(params.extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${params.extensionId}`)
    }

    if (extension.isActive) {
      return
    }

    try {
      // Load the extension module
      const modulePath = path.join(extension.path, extension.manifest.main || 'extension.js')
      delete require.cache[modulePath] // Clear cache for hot reload

      // TODO: Advanced this to move away from package.json reliance to manifest.json. Write custom loader.
      extension.module = import(modulePath)

      // Call activate function
      if (typeof extension.module.activate === 'function') {
        await extension.module.activate(extension.context)
      }

      extension.isActive = true

      // Send contributions to main process
      if (extension.manifest.contributes) {
        this.sendNotification(ExtensionHostEvents.contributionsChanged, {
          extensionId: extension.id,
          type: 'added',
          contributions: extension.manifest.contributes
        })
      }

      console.log(`Extension activated: ${extension.id}`)
    } catch (error) {
      console.error(`Failed to activate extension ${extension.id}:`, error)
      throw error
    }
  }

  async deactivateExtension(params: { extensionId: string }): Promise<void> {
    const extension = this.extensions.get(params.extensionId)
    if (!extension || !extension.isActive) {
      return
    }

    try {
      // Call deactivate function
      if (extension.module && typeof extension.module.deactivate === 'function') {
        await extension.module.deactivate()
      }

      // Dispose all subscriptions
      for (const subscription of extension.context.subscriptions) {
        try {
          subscription.dispose()
        } catch (error) {
          console.error('Error disposing subscription:', error)
        }
      }
      extension.context.subscriptions = []

      extension.isActive = false
      extension.module = null

      // Notify main process
      this.sendNotification(ExtensionHostEvents.contributionsChanged, {
        extensionId: extension.id,
        type: 'removed'
      })

      console.log(`Extension deactivated: ${extension.id}`)
    } catch (error) {
      console.error(`Failed to deactivate extension ${extension.id}:`, error)
      throw error
    }
  }

  async executeCommand(params: { command: string; args: any[] }): Promise<any> {
    // Find the extension that provides this command
    for (const extension of this.extensions.values()) {
      if (extension.isActive && extension.manifest.contributes?.commands) {
        const commandDef = extension.manifest.contributes.commands.find(
          (c) => c.command === params.command
        )

        if (commandDef && extension.module) {
          // Execute the command through the extension's API
          return this.api.commands.executeCommand(params.command, ...params.args)
        }
      }
    }

    throw new Error(`Command not found: ${params.command}`)
  }

  private async findExtensionDirectories(): Promise<string[]> {
    if (!fs.existsSync(this.extensionsPath)) {
      return []
    }

    const entries = await fs.promises.readdir(this.extensionsPath, { withFileTypes: true })
    const directories: string[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const extensionPath = path.join(this.extensionsPath, entry.name)
        const manifestPath = path.join(extensionPath, 'manifest.json')

        if (fs.existsSync(manifestPath)) {
          directories.push(extensionPath)
        }
      }
    }

    return directories
  }

  private async loadExtension(
    extensionManifest: ExtensionManifest,
    extensionPath: string
  ): Promise<LoadedExtension | null> {
    try {
      const extensionId = extensionManifest.name

      // Create extension context
      const context: ExtensionContext = {
        subscriptions: [],
        extensionPath,
        globalState: new Map(),
        workspaceState: new Map()
      }

      const extension: LoadedExtension = {
        id: extensionId,
        manifest: extensionManifest,
        path: extensionPath,
        context,
        module: null,
        isActive: false
      }

      this.extensions.set(extensionId, extension)
      return extension
    } catch (error) {
      console.error(`Failed to load extension manifest from ${extensionPath}:`, error)
      return null
    }
  }

  private createExtensionAPI(): any {
    // This would be the full extension API implementation
    // For now, we'll create a basic stub
    return {
      commands: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        registerCommand: (command: string, _callback: (...args: any[]) => any) => {
          // Implementation would register command handler
          console.log(`Command registered: ${command}`)
          return { dispose: () => {} }
        },
        executeCommand: (command: string, ...args: any[]) => {
          // Implementation would execute command
          console.log(`Command executed: ${command}`, args)
        }
      },
      window: {
        showInformationMessage: (message: string) => {
          console.log(`Info: ${message}`)
        },
        showErrorMessage: (message: string) => {
          console.error(`Error: ${message}`)
        }
      }
    }
  }

  private sendNotification(method: string, params: any): void {
    if (process.send) {
      process.send({
        type: 'notification',
        method,
        params
      })
    }
  }

  private sendResponse(id: number, result?: any, error?: string): void {
    if (process.send) {
      process.send({
        type: 'response',
        id,
        result,
        error
      })
    }
  }
}

// Main message handler
const extensionHost = new ExtensionHostProcess()

process.on('message', async (message: any) => {
  if (message.type === 'request') {
    try {
      let result

      switch (message.method) {
        case 'initialize':
          result = await extensionHost.initialize(message.params)
          break
        case 'loadExtensions':
          result = await extensionHost.loadExtensions()
          break
        case 'activateExtension':
          result = await extensionHost.activateExtension(message.params)
          break
        case 'deactivateExtension':
          result = await extensionHost.deactivateExtension(message.params)
          break
        case 'executeCommand':
          result = await extensionHost.executeCommand(message.params)
          break
        case 'shutdown':
          process.exit(0)
          break
        default:
          throw new Error(`Unknown method: ${message.method}`)
      }

      process.send!({
        type: 'response',
        id: message.id,
        result
      })
    } catch (error) {
      process.send!({
        type: 'response',
        id: message.id,
        error: (error as any).message
      })
    }
  }
})

```

#### extensionHost.ts
- *Path*: apps/llm-canvas/src/main/extensions/extensionHost.ts
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { fork, ChildProcess } from 'child_process'
import * as path from 'path'
import SafeEventEmitter from '@metamask/safe-event-emitter'
import { ExtensionHostEvents, ExtensionManifest } from '@llm-canvas/sdk'

export interface ExtensionHostOptions {
  extensionsPath: string
  enableDevelopmentMode?: boolean
  maxExtensions?: number
  timeoutMs?: number
}

export interface ExtensionInfo {
  id: string
  manifest: ExtensionManifest
  path: string
  isActive: boolean
  activationEvents: string[]
}

export class ExtensionHost extends SafeEventEmitter {
  private childProcess: ChildProcess | null = null
  private readonly options: Required<ExtensionHostOptions>
  private readonly extensions = new Map<string, ExtensionInfo>()
  private isStarted = false
  private messageId = 0
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
      timeout: NodeJS.Timeout
    }
  >()

  constructor(options: ExtensionHostOptions) {
    super()
    this.options = {
      enableDevelopmentMode: false,
      maxExtensions: 100,
      timeoutMs: 30000,
      ...options
    }
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      return
    }

    const extensionHostScript = path.join(__dirname, 'extensionHostProcess.js')

    this.childProcess = fork(extensionHostScript, [], {
      silent: false,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        ...process.env,
        EXTENSION_HOST_MODE: 'true',
        EXTENSIONS_PATH: this.options.extensionsPath,
        DEVELOPMENT_MODE: this.options.enableDevelopmentMode.toString()
      }
    })

    this.setupChildProcessHandlers()

    // Initialize the extension host
    await this.sendRequest('initialize', {
      extensionsPath: this.options.extensionsPath,
      developmentMode: this.options.enableDevelopmentMode
    })

    this.isStarted = true
    this.emit('started')
  }

  async stop(): Promise<void> {
    if (!this.isStarted || !this.childProcess) {
      return
    }

    // Cancel pending requests
    for (const [, request] of this.pendingRequests.entries()) {
      clearTimeout(request.timeout)
      request.reject(new Error('Extension host stopped'))
    }
    this.pendingRequests.clear()

    // Send shutdown signal
    try {
      await this.sendRequest('shutdown', {}, 5000)
    } catch (error) {
      console.warn('Extension host shutdown timeout:', error)
    }

    // Kill the process
    this.childProcess.kill()
    this.childProcess = null
    this.isStarted = false
    this.emit('stopped')
  }

  async loadExtensions(): Promise<ExtensionInfo[]> {
    const extensions = await this.sendRequest('loadExtensions', {})

    for (const extension of extensions) {
      this.extensions.set(extension.id, extension)
    }

    this.emit('extensionsLoaded', extensions)
    return extensions
  }

  async activateExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${extensionId}`)
    }

    if (extension.isActive) {
      return
    }

    await this.sendRequest('activateExtension', { extensionId })
    extension.isActive = true

    this.emit(ExtensionHostEvents.extensionActivated, extensionId)
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension not found: ${extensionId}`)
    }

    if (!extension.isActive) {
      return
    }

    await this.sendRequest('deactivateExtension', { extensionId })
    extension.isActive = false

    this.emit(ExtensionHostEvents.extensionDeactivated, extensionId)
  }

  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return this.sendRequest('executeCommand', { command, args })
  }

  getExtensions(): ExtensionInfo[] {
    return Array.from(this.extensions.values())
  }

  getExtension(extensionId: string): ExtensionInfo | undefined {
    return this.extensions.get(extensionId)
  }

  private setupChildProcessHandlers(): void {
    if (!this.childProcess) return

    this.childProcess.on('message', (message: any) => {
      this.handleMessage(message)
    })

    this.childProcess.on('error', (error: Error) => {
      console.error('Extension host error:', error)
      this.emit('error', error)
    })

    this.childProcess.on('exit', (code: number, signal: string) => {
      console.log(`Extension host exited with code ${code}, signal ${signal}`)
      this.isStarted = false
      this.emit('exited', { code, signal })
    })

    this.childProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`Extension host stdout: ${data.toString()}`)
    })

    this.childProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Extension host stderr: ${data.toString()}`)
    })
  }

  private handleMessage(message: any): void {
    if (message.type === 'response') {
      const request = this.pendingRequests.get(message.id)
      if (request) {
        clearTimeout(request.timeout)
        this.pendingRequests.delete(message.id)

        if (message.error) {
          request.reject(new Error(message.error))
        } else {
          request.resolve(message.result)
        }
      }
    } else if (message.type === 'notification') {
      this.handleNotification(message)
    }
  }

  private handleNotification(message: any): void {
    switch (message.method) {
      case ExtensionHostEvents.contributionsChanged:
        this.emit(ExtensionHostEvents.contributionsChanged, message.params)
        break
      case ExtensionHostEvents.extensionError:
        this.emit(ExtensionHostEvents.extensionError, message.params)
        break
      case 'log':
        console.log(`Extension: ${message.params.message}`)
        break
      default:
        console.warn('Unknown notification:', message)
    }
  }

  private async sendRequest(method: string, params: any, timeoutMs?: number): Promise<any> {
    if (!this.childProcess) {
      throw new Error('Extension host not started')
    }

    const id = ++this.messageId
    const timeout = timeoutMs || this.options.timeoutMs

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, timeout)

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: timeoutHandle
      })

      this.childProcess!.send({
        type: 'request',
        id,
        method,
        params
      })
    })
  }
}

```

#### contributionHandler.ts
- *Path*: apps/llm-canvas/src/main/ipc/contributionHandler.ts
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ContributionManager } from '../contributions/contributionManager'
import { ViewContainerLocation } from '@llm-canvas/sdk'

export function setupContributionIpcHandlers(contributionManager: ContributionManager): void {
  // Get view containers
  ipcMain.handle(
    'contributions:getViewContainers',
    async (_event: IpcMainInvokeEvent, location?: ViewContainerLocation) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getViewContainers(location as ViewContainerLocation | undefined)
    }
  )

  // Get views
  ipcMain.handle(
    'contributions:getViews',
    async (_event: IpcMainInvokeEvent, containerId?: string) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getViews(containerId)
    }
  )

  // Get commands
  ipcMain.handle('contributions:getCommands', async () => {
    const registry = contributionManager.getContributionRegistry()
    return registry.getCommands()
  })

  // Get menu contributions
  ipcMain.handle(
    'contributions:getMenuContributions',
    async (_event: IpcMainInvokeEvent, menuId: string) => {
      const registry = contributionManager.getContributionRegistry()
      return registry.getMenuContributions(menuId)
    }
  )

  // Get status bar items
  ipcMain.handle('contributions:getStatusBarItems', async () => {
    const registry = contributionManager.getContributionRegistry()
    return registry.getStatusBarItems()
  })

  // Execute command
  ipcMain.handle(
    'contributions:executeCommand',
    async (_event: IpcMainInvokeEvent, command: string, ...args: any[]) => {
      return contributionManager.executeCommand(command, ...args)
    }
  )

  // Extension management
  ipcMain.handle('extensions:list', async () => {
    return contributionManager.getExtensions()
  })

  ipcMain.handle('extensions:activate', async (_event: IpcMainInvokeEvent, extensionId: string) => {
    return contributionManager.activateExtension(extensionId)
  })

  ipcMain.handle(
    'extensions:deactivate',
    async (_event: IpcMainInvokeEvent, extensionId: string) => {
      return contributionManager.deactivateExtension(extensionId)
    }
  )
}

```

#### index.ts
- *Path*: apps/llm-canvas/src/preload/index.ts
```ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'
import packageJson from '../../package.json'
import { CanvasAPI, ExtensionHostEvents } from '@llm-canvas/sdk'

// Implementation of the API
const canvasAPI: CanvasAPI = {
  // Extension management
  extensions: {
    list: () => ipcRenderer.invoke('extensions:list'),
    activate: (extensionId: string) => ipcRenderer.invoke('extensions:activate', extensionId),
    deactivate: (extensionId: string) => ipcRenderer.invoke('extensions:deactivate', extensionId)
  },

  // Command execution
  commands: {
    execute: (command: string, ...args: any[]) =>
      ipcRenderer.invoke('contributions:executeCommand', command, ...args),
    list: () => ipcRenderer.invoke('contributions:getCommands')
  },

  // Workspace management
  workspace: {
    openFolder: (folderPath: string) => ipcRenderer.invoke('workspace:open', folderPath),
    getFolders: () => ipcRenderer.invoke('workspace:get-folders'),
    getConfiguration: (section?: string) =>
      ipcRenderer.invoke('workspace:get-configuration', section)
  },

  // Service management
  services: {
    list: () => ipcRenderer.invoke('services:list'),
    call: (serviceId: string, method: string, params: any) =>
      ipcRenderer.invoke('services:call', serviceId, method, params)
  },

  // Permission management
  permissions: {
    request: (extensionId: string, permissions: string[]) =>
      ipcRenderer.invoke('permissions:request', extensionId, permissions),
    check: (extensionId: string, permission: string) =>
      ipcRenderer.invoke('permissions:check', extensionId, permission)
  },

  // Window management
  window: {
    showMessage: (type: string, message: string, buttons?: string[]) =>
      ipcRenderer.invoke('window:show-message', type, message, buttons)
  },

  // Contribution system
  contributions: {
    getViewContainers: (location?: string) =>
      ipcRenderer.invoke('contributions:getViewContainers', location),
    getViews: (containerId?: string) => ipcRenderer.invoke('contributions:getViews', containerId),
    getCommands: () => ipcRenderer.invoke('contributions:getCommands'),
    getMenuContributions: (menuId: string) =>
      ipcRenderer.invoke('contributions:getMenuContributions', menuId),
    getStatusBarItems: () => ipcRenderer.invoke('contributions:getStatusBarItems'),
    executeCommand: (command: string, ...args: any[]) =>
      ipcRenderer.invoke('contributions:executeCommand', command, ...args)
  },

  // Event handling
  events: {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      // Validate channel name to prevent arbitrary IPC access
      const allowedChannels: string[] = [
        ExtensionHostEvents.contributionsChanged,
        ExtensionHostEvents.extensionActivated,
        ExtensionHostEvents.extensionDeactivated,
        ExtensionHostEvents.extensionError,
        'window:show-message'
      ]

      if (allowedChannels.includes(channel)) {
        ipcRenderer.on(channel, listener)
      } else {
        console.warn(`Attempted to listen on unauthorized channel: ${channel}`)
      }
    },

    off: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, listener)
    },

    once: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      const allowedChannels: string[] = [
        ExtensionHostEvents.contributionsChanged,
        ExtensionHostEvents.extensionActivated,
        ExtensionHostEvents.extensionDeactivated,
        ExtensionHostEvents.extensionError,
        'window:show-message'
      ]

      if (allowedChannels.includes(channel)) {
        ipcRenderer.once(channel, listener)
      } else {
        console.warn(`Attempted to listen on unauthorized channel: ${channel}`)
      }
    }
  },

  // File system operations
  fs: {
    readFile: async (filepath: string, options?: { encoding?: string }) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    writeFile: async (filepath: string, data: Uint8Array | string) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    exists: async (filepath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      return false
    },

    mkdir: async (dirpath: string, options?: { recursive?: boolean }) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    },

    readdir: async (dirpath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      return []
    },

    stat: async (filepath: string) => {
      console.warn('File system operations should be handled by extensions or services')
      throw new Error('Direct file system access not available in renderer')
    }
  },

  // System info
  system: {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }
}

// Expose the API to the renderer process
// contextBridge.exposeInMainWorld('electronAPI', electronAPI)
contextBridge.exposeInMainWorld('LLMCANVAS_VERSION', packageJson.version)

// Log that preload script has loaded
console.log('LLM Canvas preload script loaded')

// Handle uncaught errors in the preload script
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in preload script:', error)
})

// Export the interface for TypeScript consumers
export default canvasAPI

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('canvas', canvasAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.canvas = canvasAPI
}

```

