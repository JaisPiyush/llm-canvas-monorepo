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