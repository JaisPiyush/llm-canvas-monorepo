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

export interface ViewSystemAPI {
  // View management
  showView: (viewId: string, containerId?: string) => Promise<any>,
  hideView: (viewId: string) => Promise<any>,
  toggleView: (viewId: string) => Promise<any>,
  setActiveView: (viewId: string) => Promise<any>,
  refreshView: (viewId: string) => Promise<any>,
  revealView: (viewId: string, element?: any, options?: any) =>
    Promise<any>,

  // Layout management
  getViewLayout: (containerId: string) => Promise<any>,
  getViewsInContainer: (containerId: string) =>
    Promise<any>,
  getActiveView: () => Promise<any>,
  getViewContext: (viewId: string) => Promise<any>,

  // Tree view operations
  treeView: {
    getChildren: (viewId: string, element?: any) =>
      Promise<any>,
    getTreeItem: (viewId: string, element: any) =>
      Promise<any>,
    reveal: (viewId: string, element: any, options?: any) =>
      Promise<any>
  },

  // Webview operations
  webview: {
    postMessage: (viewId: string, message: any) =>
      Promise<any>,
    setHtml: (viewId: string, html: string) => Promise<any>
  }
}

export interface CanvasAPI {
  // Extension management
  views: ViewSystemAPI,
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
  extensionError = 'extensionError',
}

export interface ViewRegistryOptions {
  enableValidation?: boolean
  maxViewsPerContainer?: number
}

export interface ViewInstance {
  id: string
  extensionId: string
  viewId: string
  containerId: string
  type: ViewType
  isVisible: boolean
  isActive: boolean
  title: string
  description?: string
  when?: string
  provider?: ViewProvider
  webview?: WebviewView
  treeView?: TreeView
  element?: HTMLElement
  state: ViewState
  disposables: Array<{ dispose(): void }>
}

export interface ViewState {
  collapsed: boolean
  size?: number
  position?: number
  customData?: Record<string, any>
}

export interface ViewProvider {
  readonly viewType: string
  readonly canResolveView?: boolean
  resolveView?(view: ViewInstance): Promise<void> | void
  refresh?(): Promise<void> | void
  dispose?(): void
}

export interface WebviewView {
  readonly webview: Webview
  readonly viewType: string
  readonly title?: string
  readonly description?: string
  show(preserveFocus?: boolean): void
  dispose(): void
}

export interface TreeView<T = any> {
  readonly dataProvider: TreeDataProvider<T>
  readonly selection: readonly T[]
  readonly visible: boolean
  readonly onDidChangeSelection: DisposableEvent<TreeViewSelectionChangeEvent<T>>
  readonly onDidChangeVisibility: DisposableEvent<TreeViewVisibilityChangeEvent>
  reveal(element: T, options?: { select?: boolean; focus?: boolean; expand?: boolean | number }): Promise<void>
  dispose(): void
}

export interface TreeDataProvider<T = any> {
  readonly onDidChangeTreeData?: DisposableEvent<T | undefined | null | void>
  getTreeItem(element: T): TreeItem | Promise<TreeItem>
  getChildren(element?: T): T[] | Promise<T[]>
  getParent?(element: T): T | Promise<T | undefined>
  resolveTreeItem?(item: TreeItem, element: T): TreeItem | Promise<TreeItem>
}

export interface TreeItem {
  readonly id?: string
  readonly label?: string | TreeItemLabel
  readonly description?: string | boolean
  readonly tooltip?: string | MarkdownString
  readonly command?: Command
  readonly collapsibleState?: TreeItemCollapsibleState
  readonly contextValue?: string
  readonly iconPath?: string | Uri | { light: string | Uri; dark: string | Uri } | ThemeIcon
  readonly resourceUri?: Uri
  readonly accessibilityInformation?: AccessibilityInformation
}

export interface TreeItemLabel {
  readonly label: string
  readonly highlights?: [number, number][]
}

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2
}

export interface TreeViewSelectionChangeEvent<T> {
  readonly selection: readonly T[]
}

export interface TreeViewVisibilityChangeEvent {
  readonly visible: boolean
}

export interface Webview {
  readonly options: WebviewOptions
  html: string
  readonly onDidReceiveMessage: DisposableEvent<any>
  postMessage(message: any): Promise<boolean>
  dispose(): void
}

export interface WebviewOptions {
  readonly enableScripts?: boolean
  readonly enableForms?: boolean
  readonly enableCommandUris?: boolean | readonly string[]
  readonly localResourceRoots?: readonly Uri[]
  readonly portMapping?: readonly WebviewPortMapping[]
}

export interface WebviewPortMapping {
  readonly webviewPort: number
  readonly extensionHostPort: number
}

// Common interfaces
export interface DisposableEvent<T> {
  (listener: (e: T) => any, thisArg?: any): { dispose(): void }
}

export interface Command {
  readonly command: string
  readonly title: string
  readonly arguments?: any[]
  readonly tooltip?: string
}

export interface Uri {
  readonly scheme: string
  readonly authority: string
  readonly path: string
  readonly query: string
  readonly fragment: string
  readonly fsPath: string
  toString(skipEncoding?: boolean): string
  toJSON(): any
}

export interface MarkdownString {
  readonly value: string
  readonly isTrusted?: boolean
  readonly supportThemeIcons?: boolean
  appendText(value: string): MarkdownString
  appendMarkdown(value: string): MarkdownString
  appendCodeblock(value: string, language?: string): MarkdownString
}

export interface ThemeIcon {
  readonly id: string
  readonly color?: ThemeColor
}

export interface ThemeColor {
  readonly id: string
}

export interface AccessibilityInformation {
  readonly label: string
  readonly role?: string
}

