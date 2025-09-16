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