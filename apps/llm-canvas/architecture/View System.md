---
sidebar_position: 2
---

# View System Component Documentation

## 🏛️ Core Classes

### **ViewRegistry**
**Purpose**: Central registry that manages the lifecycle and state of all view instances in the application.

**Key Responsibilities**:
- **View Instance Management**: Creates, tracks, and disposes view instances from extension contributions
- **Provider Integration**: Links view instances with their corresponding providers (TreeDataProvider, ViewProvider)
- **Type-Specific Views**: Handles creation of TreeView and WebviewView instances with proper initialization
- **State Management**: Tracks visibility, activation state, and custom state for each view
- **Event Emission**: Notifies other parts of the system when views are registered, unregistered, or state changes
- **Resource Cleanup**: Ensures proper disposal of view resources when extensions are unloaded

**When to Use**: This is the foundational class that other components interact with. Extensions don't use this directly - it's used by the ViewManager.

---

### **ViewManager**
**Purpose**: High-level orchestrator that coordinates between the contribution system, view registry, and UI layer.

**Key Responsibilities**:
- **Layout Management**: Manages how views are arranged within containers and their sizing
- **Context Integration**: Evaluates `when` clauses to determine view visibility based on application context
- **View Operations**: Provides high-level operations like show/hide/toggle/activate views
- **Container Coordination**: Manages relationships between view containers and their child views
- **Extension API Bridge**: Provides the main API that extensions use to interact with views
- **Event Coordination**: Coordinates events between different parts of the view system

**When to Use**: This is the main API that both the UI layer and extensions interact with for view operations.

---

### **ViewInstance**
**Purpose**: Represents a single view instance with its complete state and metadata.

**Key Properties**:
- **Identity**: Unique ID, extension owner, view type
- **State Management**: Visibility, activation, collapse state, size, position
- **Content References**: Links to TreeView, WebviewView, or custom DOM elements
- **Lifecycle Management**: Disposables array for cleanup when view is destroyed
- **UI Metadata**: Title, description, icon for display purposes

**When to Use**: This is the data structure that represents views throughout the system. Components receive ViewInstance objects to render views.

---

### **MainProcessViewManager**
**Purpose**: Electron main process counterpart that handles view operations and bridges with the renderer process.

**Key Responsibilities**:
- **IPC Handling**: Sets up IPC handlers for all view-related operations from renderer
- **Process Bridging**: Coordinates between main process view logic and renderer UI
- **Extension Integration**: Works with the extension host to provide view APIs to extensions
- **Event Forwarding**: Forwards view events from main process to renderer for UI updates
- **Security**: Ensures view operations respect extension permissions and security boundaries

**When to Use**: This runs in the Electron main process and is automatically initialized. Extensions and UI components don't interact with it directly.

---

### **ViewProviderRegistry**
**Purpose**: Manages registration and lookup of view providers that supply content and behavior to views.

**Key Responsibilities**:
- **Provider Registration**: Allows extensions to register custom view providers
- **Type-Based Lookup**: Maps view types to their corresponding providers
- **Options Management**: Stores provider-specific configuration (webview options, tree data providers)
- **Lifecycle Management**: Handles provider disposal when extensions are unloaded
- **Conflict Prevention**: Ensures only one provider per view type

**When to Use**: Extensions use this indirectly through the ViewManager API when registering custom view providers.

---

## 🎣 React Hooks

### **useViewManager**
**Purpose**: Primary hook for managing view operations and accessing view state in React components.

**What It Provides**:
- **View Operations**: Functions to show, hide, toggle, activate, and refresh views
- **Layout Access**: Get view layouts and container contents
- **State Access**: Access to active view and view contexts
- **Async Operations**: All operations return promises for proper async handling
- **Error Handling**: Built-in error states and loading indicators

**Best Use Cases**:
```tsx
// In a sidebar component that needs to manage multiple views
const { showView, getViewsInContainer, activeView } = useViewManager()

// Show a specific view when user clicks a button
const handleShowExplorer = () => showView('myExtension.fileExplorer')
```

---

### **useTreeView**
**Purpose**: Specialized hook for managing tree view data, selection, and operations.

**What It Provides**:
- **Data Management**: Loads and caches tree data from TreeDataProvider
- **Selection Handling**: Multi-select support with keyboard/mouse interactions
- **Expansion State**: Tracks which nodes are expanded/collapsed
- **Lazy Loading**: Loads child nodes on-demand when expanded
- **Operations**: Expand, collapse, reveal, refresh operations
- **Event Handling**: Responds to data provider changes automatically

**Best Use Cases**:
```tsx
// In a custom tree component that needs full control over tree behavior
const { 
  rootNodes, 
  selectedElements, 
  expandElement, 
  selectElement 
} = useTreeView(myTreeDataProvider)

// Handle node selection
const handleNodeClick = (element) => {
  selectElement(element, event.ctrlKey) // Multi-select if Ctrl held
}
```

---

### **useWebview**
**Purpose**: Manages webview content, security, and communication between webview and parent.

**What It Provides**:
- **Content Management**: Set and update HTML content safely
- **Message Passing**: Bi-directional communication with webview content
- **Security**: CSP enforcement and sandbox configuration
- **Lifecycle**: Loading states, error handling, ready notifications
- **DOM Integration**: Provides iframe ref for direct DOM access when needed

**Best Use Cases**:
```tsx
// In a webview component that needs to display dynamic content
const { setHtml, postMessage, onMessage, ready } = useWebview({
  enableScripts: true,
  enableForms: false
})

// Send data to webview
useEffect(() => {
  if (ready) {
    postMessage({ type: 'updateData', data: myData })
  }
}, [ready, myData])

// Listen for messages from webview
useEffect(() => {
  return onMessage((message) => {
    if (message.type === 'buttonClicked') {
      handleWebviewAction(message.payload)
    }
  })
}, [])
```

---

### **useViewContainers**
**Purpose**: Manages loading and accessing view containers for a specific location.

**What It Provides**:
- **Container Loading**: Fetches view containers for sidebar, panel, etc.
- **Auto-Refresh**: Automatically updates when contributions change
- **Error Handling**: Loading states and error management
- **Filtering**: Can filter containers by location
- **Event Subscription**: Listens for contribution system changes

**Best Use Cases**:
```tsx
// In a layout component that renders a specific area
const { data: containers, loading, error } = useViewContainers('sidebar')

return (
  <div className="sidebar">
    {containers.map(container => (
      <ViewContainer key={container.id} container={container} />
    ))}
  </div>
)
```

---

## 🎨 UI Components

### **ViewContainer**
**Purpose**: Renders a complete view container with header, tabs, and content area.

**Key Features**:
- **Resizable**: Integrates with ResizablePanel for drag-to-resize functionality
- **Collapsible**: Can collapse/expand with header controls
- **Tabbed Interface**: Shows tabs when container has multiple views
- **View Management**: Handles view activation and switching
- **Responsive**: Adapts layout based on container location (sidebar vs panel)

**Props Breakdown**:
- `container`: The container configuration from contributions
- `defaultSize`, `minSize`, `maxSize`: Sizing constraints for resizable behavior
- `className`: Additional CSS classes for styling

**Usage Pattern**:
```tsx
// Automatically handles all container functionality
<ViewContainer 
  container={sidebarContainer}
  defaultSize={300}
  minSize={200}
  maxSize={600}
/>
```

---

### **ViewComponent**
**Purpose**: Universal view renderer that displays the appropriate content based on view type.

**Key Features**:
- **Multi-Type Support**: Handles TreeView, WebviewView, and Custom views
- **Header Management**: Shows view title, description, and action buttons
- **Error Boundaries**: Graceful error handling with retry functionality
- **Loading States**: Shows loading indicators during operations
- **Action Integration**: Refresh buttons and other view-specific actions

**Rendering Logic**:
- **TreeView**: Renders TreeViewComponent with tree data
- **WebviewView**: Renders WebviewComponent with secure iframe
- **Custom**: Provides mount point for custom extension UI
- **Error State**: Shows error message with retry option
- **Loading State**: Shows spinner during refresh operations

**Usage Pattern**:
```tsx
// Handles all view types automatically
<ViewComponent 
  view={viewInstance}
  active={isActive}
  className="custom-view-styles"
/>
```

---

### **TreeViewComponent**
**Purpose**: Full-featured tree view implementation with all standard tree interactions.

**Key Features**:
- **Hierarchical Display**: Nested tree structure with proper indentation
- **Interactive Elements**: Click to select, toggle to expand/collapse
- **Multi-Select**: Ctrl+Click for multiple selection
- **Keyboard Navigation**: Arrow keys, Enter, Space for accessibility
- **Command Integration**: Executes commands when tree items are clicked
- **Icon Support**: Displays icons from tree item metadata
- **Context Menus**: Right-click support for item-specific actions

**Visual Elements**:
- **Toggle Buttons**: ▶/▼ arrows for expandable items
- **Icons**: File/folder icons or custom icons from TreeItem
- **Labels**: Main text with optional description
- **Selection Highlighting**: Visual feedback for selected items
- **Indentation**: Shows hierarchy depth

**Data Flow**:
```
TreeDataProvider → useTreeView → TreeViewComponent → DOM
```

---

### **WebviewComponent**
**Purpose**: Secure iframe wrapper for displaying extension-provided web content.

**Key Features**:
- **Security First**: CSP headers, sandboxing, restricted permissions
- **Message Bridge**: Safe communication channel with parent window
- **Content Updates**: Dynamic HTML updates from extension
- **Loading Management**: Shows loading states during content changes
- **Error Recovery**: Handles webview failures gracefully
- **Responsive**: Adapts to container size changes

**Security Measures**:
- **Content Security Policy**: Restricts script sources and capabilities
- **Sandbox Attributes**: Limits what webview content can access
- **Message Filtering**: Validates messages from webview content
- **Resource Restrictions**: Controls which external resources can load

**Communication Flow**:
```
Extension → ViewManager → WebviewComponent → iframe → webview content
                    ↖ messages ↙
```

---

### **ResizablePanel**
**Purpose**: Provides drag-to-resize functionality for view containers and panels.

**Key Features**:
- **Drag Handle**: Visual resize handle with proper cursor feedback
- **Constraints**: Enforces minimum and maximum size limits
- **Direction Support**: Horizontal (width) and vertical (height) resizing
- **Visual Feedback**: Shows resize indicator during drag operations
- **Smooth Interaction**: Prevents text selection and provides smooth dragging
- **Event Callbacks**: Notifies parent components of size changes

**Interaction States**:
- **Normal**: Transparent handle, resize cursor on hover
- **Dragging**: Highlighted handle, disabled text selection, resize cursor
- **Disabled**: No interaction, handle hidden

**Usage Pattern**:
```tsx
<ResizablePanel 
  defaultSize={250}
  minSize={150}
  maxSize={500}
  direction="horizontal"
  onResize={(newSize) => saveLayoutPreference(newSize)}
>
  <ViewContent />
</ResizablePanel>
```

---

### **ViewContainerLayout**
**Purpose**: Layout manager that renders all view containers for a specific location.

**Key Features**:
- **Location-Specific**: Handles sidebar, panel, or auxiliary bar layouts
- **Auto-Loading**: Fetches and displays containers automatically
- **Contribution Integration**: Updates when extensions add/remove containers
- **Order Management**: Sorts containers by their order property
- **Visibility Logic**: Filters containers based on when conditions

**Layout Behavior**:
- **Sidebar**: Vertical stack of resizable containers
- **Panel**: Horizontal tabs or accordion-style containers
- **Auxiliary Bar**: Similar to sidebar but typically on the right side
- **Main View**: Content area containers with different arrangement

---

### **ViewLayout**
**Purpose**: Root layout component that orchestrates the entire view system UI.

**Key Features**:
- **Complete Layout**: Manages sidebar, main area, panel, and auxiliary bar
- **Responsive Design**: Adapts to different window sizes
- **Container Coordination**: Ensures containers don't overlap or conflict
- **Persistence**: Can save/restore layout preferences
- **Integration Point**: Where the view system connects to your main app

**Layout Structure**:
```
┌─sidebar─┬─────main─────┬─auxiliary─┐
│         │              │           │
│ views   │  main views  │   views   │
│         │              │           │
│         ├─────panel────┤           │
│         │   bottom     │           │
└─────────┴──────────────┴───────────┘
```

---

### **ContextMenu**
**Purpose**: Displays context-sensitive menu items for views and tree items.

**Key Features**:
- **Dynamic Content**: Shows menu items based on current context
- **Grouping**: Organizes items into logical groups with separators
- **Command Integration**: Executes commands when items are clicked
- **Positioning**: Smart positioning to stay within viewport
- **Keyboard Support**: Arrow navigation and Enter/Escape handling
- **Submenu Support**: Hierarchical menus for complex actions

**Menu Structure**:
- **Groups**: Items organized by group property
- **Separators**: Visual dividers between groups
- **Icons**: Optional icons for menu items
- **Shortcuts**: Keyboard shortcut display
- **Disabled States**: Items that are not currently available

This comprehensive view system provides the foundation for rich, extensible UI components that extensions can contribute to, similar to VS Code's architecture but tailored for your LLM Canvas application's needs.