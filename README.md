# LLM Canvas


## Architecture



### 1\. Architecture Overview

The application is designed around a multi-process architecture to ensure stability and security. Extensions, MiniApps, and UI components run in isolated processes, preventing a single faulty component from crashing the entire application.

#### Core Concepts

  * **Extensions**: These are powerful scripts running in a Node.js environment that can deeply integrate with the application. They can contribute UI elements, add commands, interact with the workspace, and provide new services. They are ideal for complex, background-heavy, or deeply integrated features.
  * **MiniApps**: These are lightweight, web-based applications running in a sandboxed environment (WebView). They have a more restricted API, focused on accessing core services and presenting a user interface. They are suitable for self-contained tools, dashboards, or content-centric experiences.
  * **Service Provider Protocol (SPP)**: A formal contract for creating standalone, out-of-process services. These services can be written in any language and communicate with the application over a standardized JSON-RPC protocol, allowing for heavy-duty background tasks like AI processing or data analysis without blocking the main application.

#### Process Model

The application is split into several key processes:

  * **Main Process (Application Host)**: The central coordinator. It manages the application's lifecycle, windows, and orchestrates communication between all other processes.
  * **Renderer Process (UI)**: Responsible for rendering the main application window and user interface. It hosts the UI contribution points where extensions can add elements.
  * **Extension Host Process**: An isolated Node.js process where all extensions are loaded and executed. This sandboxing prevents extensions from interfering with the main application's performance or stability.
  * **MiniApp Runtime Process**: Each MiniApp runs within its own dedicated process, containing a Node.js backend and a WebView for its UI, ensuring complete isolation.

-----

### 2\. Extension System API

Extensions are the primary way to add rich functionality to the application.

#### 2.1. Extension Manifest (`package.json`)

Every extension must have a `package.json` file that defines its metadata, activation events, and contributions.

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "type": "extension",
  "displayName": "My Extension",
  "description": "A brief description of my extension.",
  "publisher": "your-publisher-name",
  "engines": {
    "app": "^1.0.0"
  },
  "main": "./out/extension.js",
  "icon": "icon.png",
  "activationEvents": [
    "onCommand:extension.myCommand",
    "onView:extension.myView",
    "onStartup"
  ],
  "contributes": {
    "commands": [{
      "command": "extension.myCommand",
      "title": "Run My Command"
    }],
    "views": {
      "sidebar": [{
        "id": "extension.myView",
        "name": "My Custom View"
      }]
    },
    "menus": {},
    "statusBar": [],
    "settings": {}
  },
  "permissions": [
    "filesystem:read",
    "network:http",
    "system:notifications"
  ]
}
```

  * **`activationEvents`**: An array of events that will cause the extension to be activated (loaded). This lazy activation is crucial for performance.
  * **`contributes`**: An object defining all the static contributions the extension makes to the UI, such as commands, views, menus, and settings.
  * **`permissions`**: An array of permissions the extension requires to function, which will be presented to the user.

#### 2.2. Extension Lifecycle

The core of an extension is its `activate` and `deactivate` functions, exported from the `main` script.

```typescript
import { ExtensionContext, Disposable } from 'app';

// This function is called when the extension is activated.
export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension is now active!');

  // Register a command and add its disposable to the context subscriptions.
  const disposable = commands.registerCommand('extension.myCommand', () => {
    window.showInformationMessage('Hello from My Extension!');
  });

  context.subscriptions.push(disposable);
}

// This function is called when the extension is deactivated.
export function deactivate() {
  console.log('Your extension has been deactivated.');
}
```

  * **`activate(context)`**: The entry point of your extension. The `ExtensionContext` provides access to utilities and state management.
  * **`deactivate()`**: A chance to clean up any resources before the extension is shut down.

#### 2.3. Commands API

The **`commands`** namespace allows for registering and executing commands, which are the foundation of user interactions.

```typescript
// Register a new command in your activate function
const disposable = commands.registerCommand('my.command.id', (arg1) => {
  // ... command logic
});

// Execute an existing command programmatically
commands.executeCommand('another.command.id', 'someArgument');
```

#### 2.4. UI Contribution Points

Extensions can contribute to various parts of the application's UI.

  * **Views & Panels**: Create custom views in the sidebar or bottom panel, often populated with a `TreeView` or a fully custom `WebviewPanel`.
    ```typescript
    // Create a webview panel
    const panel = ui.createWebviewPanel(
      'myWebview',
      'My Custom Panel',
      ui.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = `<h1>Hello Webview!</h1>`;
    ```
  * **Status Bar**: Add items to the status bar to display information or provide quick actions.
    ```typescript
    const myItem = statusBar.createStatusBarItem(statusBar.Alignment.Left, 100);
    myItem.text = `$(rocket) My Status`;
    myItem.command = 'my.command.id';
    myItem.show();
    ```
  * **Menus**: Add items to various context menus or the main command palette through the `contributes.menus` section in `package.json`.

#### 2.5. Window and Notification API

The **`window`** namespace provides APIs for interacting with the user through messages, input dialogs, and progress indicators.

```typescript
// Show an information message with action buttons
const selection = await window.showInformationMessage(
  'Is this a great feature?',
  'Yes',
  'No'
);

// Show a quick pick dialog
const selectedItem = await window.showQuickPick(
  ['Option 1', 'Option 2'],
  { placeHolder: 'Choose an option' }
);

// Show a progress indicator for a long-running task
await window.withProgress({
  location: ProgressLocation.Notification,
  title: "Processing data...",
}, (progress) => {
  progress.report({ increment: 50 });
  // ... perform task
});
```

#### 2.6. Workspace API

The **`workspace`** namespace provides access to workspace information, configuration, and a virtualized file system API.

```typescript
// Get a configuration value
const mySetting = workspace.getConfiguration('myExtension').get('mySetting');

// Read a file
const fileUri = 'file:///path/to/your/file.txt';
const contentBytes = await workspace.fs.readFile(fileUri);
const content = new TextDecoder().decode(contentBytes);

// Watch for file changes
const watcher = workspace.createFileSystemWatcher('**/*.js');
watcher.onDidChange(uri => {
  console.log(`File changed: ${uri}`);
});
```

-----

### 3\. MiniApp System API

MiniApps are self-contained web applications that run within the main app, offering a sandboxed but powerful way to extend functionality.

#### 3.1. MiniApp Manifest (`miniapp.json`)

Similar to extensions, MiniApps require a manifest file.

```json
{
  "name": "my-miniapp",
  "version": "1.0.0",
  "type": "miniapp",
  "displayName": "My Mini App",
  "main": "./index.html",
  "icon": "icon.png",
  "permissions": [
    "storage:local",
    "network:http"
  ],
  "services": [
    "storage",
    "http"
  ],
  "lifecycle": {
    "preload": "./preload.js"
  }
}
```

  * **`main`**: The entry point HTML file for the MiniApp's UI.
  * **`services`**: A list of core services the MiniApp requires access to.
  * **`lifecycle.preload`**: A script that runs in a privileged context to bridge the sandboxed MiniApp world with the application's APIs.

#### 3.2. MiniApp Runtime API

Inside the MiniApp's web context (`window`), a global `MiniAppAPI` object is exposed.

```javascript
// In your MiniApp's JavaScript file

// Access a core service
const httpService = await MiniAppAPI.services.get('http');
const response = await httpService.get('https://api.example.com/data');

// Store data locally
await MiniAppAPI.storage.local.set('myKey', { value: 42 });

// Send a message to the main app host
MiniAppAPI.ipc.send('my-custom-channel', { payload: 'hello' });
```

-----

### 4\. Service Provider Protocol (SPP)

SPP is designed for creating robust, high-performance, out-of-process background services. A service provider is an independent executable that communicates with the main application via a JSON-RPC 2.0 protocol over `stdio`.

#### 4.1. Service Provider Manifest

A service provider defines its capabilities in a manifest file.

```json
{
  "name": "data-processor-service",
  "version": "1.0.0",
  "type": "service-provider",
  "displayName": "Data Processor",
  "main": "./bin/service.js",
  "capabilities": {
    "provides": ["data.processor"],
    "protocols": ["stdio"],
    "features": {
      "streaming": true,
      "progress": true
    },
    "dataTypes": ["application/json", "text/csv"]
  }
}
```

#### 4.2. Service Communication

Communication follows the JSON-RPC 2.0 specification, similar to the Language Server Protocol (LSP).

  * **Requests**: Calls that expect a response (`service/initialize`).
  * **Notifications**: Calls that do not expect a response (`service/initialized`).
  * **Lifecycle Methods**: A standard set of methods (`initialize`, `shutdown`, `exit`) must be implemented for managing the service's lifecycle.
  * **Progress Reporting**: Services can report progress on long-running tasks back to the main UI.

#### 4.3. Service Client API

Extensions or other components can discover and interact with these services using the `serviceClient` API.

```typescript
// Discover available services
const services = await serviceClient.getAvailableServices('data');

if (services.length > 0) {
  // Create a client for the first discovered service
  const client = await serviceClient.createServiceClient(services[0].id);

  // Send a request to the service
  const result = await client.request('data/process', {
    input: { some: 'data' },
    operation: 'transform'
  });

  console.log('Service processing result:', result);

  await client.disconnect();
}
```

-----

### 5\. Shared Systems

These systems are available to both extensions and internal components.

#### 5.1. Event System

A global publish-subscribe event bus facilitates communication between different parts of the application without direct coupling.

```typescript
// Subscribe to an event
const disposable = events.bus.on('ui:theme-changed', (data) => {
  console.log(`Theme changed to: ${data.theme.label}`);
});

// Emit an event
events.bus.emit('my-extension:custom-event', { payload: 123 });
```

#### 5.2. Security and Permissions

The permission system ensures user security and privacy. Extensions and MiniApps must declare required permissions in their manifest. The application can then prompt the user for consent.

  * **Permissions**: Granular permissions for filesystem access, network requests, system notifications, etc. (`filesystem:read`, `network:http`).
  * **Sandboxing**: The Extension Host and MiniApp Runtimes are heavily sandboxed to restrict their access to the underlying system, only exposing functionality through the official APIs.

-----

### 6\. Developer Experience

Tools are provided to streamline the development, testing, and packaging process.

#### 6.1. Development API

The **`dev`** namespace provides utilities for a smoother development workflow.

```typescript
// Create a namespaced logger for your extension
const logger = dev.createLogger('MyExtension');
logger.info('Initializing extension...');
logger.error('Failed to load resource.', new Error('Network timeout'));
```

#### 6.2. Build and Packaging

A command-line tool or build script API helps compile, watch, and package your extension for distribution.

```typescript
import { build } from 'app-build-tools';

// Programmatically package your extension into a single distributable file
async function packageExtension() {
  const packagePath = await build.package('/path/to/my-extension');
  console.log(`Extension packaged at: ${packagePath}`);
}
```


## Features Roadmap

### 🏗 Core Foundation (Base Platform)

1. **Core API & App Shell**

* [ ] Sidebar (navigation)
* [ ] Left/Right panels
* [ ] Center panel (workspace)
* [ ] Title bar (contributions, menus)
* [ ] Status bar (contributions, system info)
* [ ] Settings system (workspace + global)

2. **Extension System (with SPP bundled)**

* [ ] Extension Host (manifest parsing, lifecycle)
* [ ] Contribution points: commands, menus, views, panels, status/title bar
* [ ] Service Provider integration (services defined in extension manifest)
* [ ] Service Registry (discover, call, monitor services)
* [ ] Extension sandboxing (permissions, resource limits)

3. **MiniApp Runtime**

* [ ] MiniApp manifest
* [ ] Sandboxed webview container (contextIsolation, preload)
* [ ] Service API bridge (storage, http, notifications)
* [ ] Permissions check

4. **Python + Virtualenv Support**

* [ ] Detect system Python / bundled runtime
* [ ] Virtualenv create/activate/delete
* [ ] Package installation (pip/uv)
* [ ] Python Service Provider (exec code, run scripts)
* [ ] Per-workspace env binding

5. **Workspace System**

* [ ] Workspace folders/projects
* [ ] Workspace + global state separation
* [ ] File system watcher
* [ ] Config management

6. **LLM Inference (Local + Hosted)**

* [ ] Model adapter abstraction (local vs remote)
* [ ] Local model runners (llama.cpp, vLLM, etc)
* [ ] Remote API clients (OpenAI, Anthropic, etc)
* [ ] Streaming responses
* [ ] Resource monitoring

7. **Model Server (OpenAI-style API)**

* [ ] REST endpoints `/v1/completions`, `/v1/chat/completions`
* [ ] API key support
* [ ] Token usage logging
* [ ] Basic rate limiting

8. **Chat Playground**

* [ ] Playground UI (chat history, input box, streaming output)
* [ ] Parameter controls (temperature, top\_p, max\_tokens)
* [ ] Conversation persistence
* [ ] Export transcript

9. **Model Comparison**

* [ ] Run same prompt across multiple models
* [ ] Side-by-side comparison UI
* [ ] Feedback (vote/annotate)
* [ ] Basic metrics (tokens, latency, length)

10. **Prompt Library**

* [ ] Prompt CRUD (create, edit, delete)
* [ ] Tagging & categorization
* [ ] Insert prompt into Playground
* [ ] Import/export JSON
* [ ] Versioned prompts (optional)

11. **Permission System**

* [ ] Permissions registry (filesystem, network, system, storage, ui)
* [ ] Manifest-declared permissions for extensions/miniapps
* [ ] User approval dialog (first run)
* [ ] Check/revoke API
* [ ] Persistent permission store

---

### 🚀 Phase 2 (Expand & Integrate)

12. **Agent Workflow Builder**

* [ ] Visual DAG editor (drag & drop)
* [ ] Node types (model, prompt, tool, control flow)
* [ ] Save/load workflows
* [ ] Run & debug workflows

13. **MCP Support**

* [ ] Act as MCP server (expose models/tools)
* [ ] Act as MCP client (consume tools/context)
* [ ] Channel communication (IPC/websocket)
* [ ] Discovery UI

14. **Browser Controller**

* [ ] Headless/visible modes
* [ ] Actions: goto, click, type, scrape
* [ ] Logs + screenshots per action
* [ ] User confirmation for sensitive actions

15. **Tool Calling**

* [ ] Tool registry (discoverable functions)
* [ ] JSON schema for tool definitions
* [ ] Auto-response routing back to model
* [ ] Logs for transparency

16. **RAG Toolkit**

* [ ] Document ingestion & chunking
* [ ] Embeddings pipeline (local/remote models)
* [ ] Vector store (FAISS/Qdrant)
* [ ] Query interface (top-k retrieval)
* [ ] RAG workflow node & miniapp

17. **Gradio MiniApp Support**

* [ ] Import local Gradio app (Python file)
* [ ] Pull from GitHub/Hugging Face Space
* [ ] Run Gradio in sandboxed Python env
* [ ] Embed UI in MiniApp webview
* [ ] Package as `.miniapp`

18. **UI Contribution Points 2.0 (Core UI Augmentation)**

* [ ] Playground input actions (buttons/icons near chat input)
* [ ] Playground input interceptors (modify prompt text)
* [ ] Playground output decorators (annotate responses)
* [ ] Workflow builder custom nodes + node toolbar actions
* [ ] Notebook LLM custom cell types + output decorators
* [ ] RAG toolkit loaders/retrievers/query decorators

19. **Marketplace Search**

* [ ] Search models, extensions, miniapps
* [ ] Install/uninstall flow
* [ ] Versioning + signatures

20. **Agent Server (REST)**

* [ ] Register agents
* [ ] Start/stop/observe agents
* [ ] Logs & results API

21. **Experiment Tracking**

* [ ] Versioned runs (params, outputs, metrics)
* [ ] Diff runs
* [ ] Export results

---

### 🌟 Phase 3 (Scale & Research)

22. **Marimo Integration**

* [ ] Launch Marimo notebooks in MiniApp runtime
* [ ] Link to Python virtualenvs
* [ ] Save/share reactive notebooks
* [ ] Export to HTML/PDF

23. **Notebook LLM**

* [ ] Cell types: markdown, Python, prompt, workflow
* [ ] Run all / run selected cells
* [ ] Execution trace (inputs/outputs)
* [ ] Export `.notebook.json` / `.ipynb`

24. **RBAC & Audit Logs**

* [ ] Role-based access control
* [ ] Audit logging of actions
* [ ] Admin dashboard

25. **Marketplace Curation**

* [ ] Ratings/reviews
* [ ] Moderation tools
* [ ] Digital signatures for integrity

---

### 🔄 Cross-cutting (applies everywhere)

* [ ] Telemetry & monitoring (service metrics, dashboards)
* [ ] Secrets management (encrypted storage, KMS integration)
* [ ] Packaging & updates (build system, hot reload, extension signing)
* [ ] Developer utilities (logger, test runner, hot reload toggle)
* [ ] Docs & tutorials (sample notebooks, workflows, extensions, miniapps)

---


