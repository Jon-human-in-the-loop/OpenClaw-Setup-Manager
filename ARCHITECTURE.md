# Architecture Documentation

This document describes the system design, data flow, and component interactions in the OpenClaw Easy Installer.

## Table of Contents

1. [System Overview](#system-overview)
2. [Electron Architecture](#electron-architecture)
3. [React UI Architecture](#react-ui-architecture)
4. [IPC Communication](#ipc-communication)
5. [State Management](#state-management)
6. [Build Pipeline](#build-pipeline)
7. [Type System](#type-system)
8. [Security](#security)

---

## System Overview

The OpenClaw Easy Installer is a desktop application that guides users through installing OpenClaw in a structured wizard interface.

### High-Level Architecture

```
┌──────────────────────────────┐
│   Electron Main Process      │
│  (Node.js environment)       │
│  ┌──────────────────────┐    │
│  │ Handlers             │    │
│  │ - System Check       │    │
│  │ - Install Runner     │    │
│  │ - Config Manager     │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
           ↕ IPC
┌──────────────────────────────┐
│   Context Bridge (Secure)    │
│  - contextBridge.exposeInMainWorld
│  - Limited API surface       │
└──────────────────────────────┘
           ↕ IPC
┌──────────────────────────────┐
│  Electron Renderer (Browser) │
│  (React.js environment)      │
│  ┌──────────────────────┐    │
│  │ React Components     │    │
│  │ - Contexts           │    │
│  │ - Pages              │    │
│  │ - Validation         │    │
│  └──────────────────────┘    │
└──────────────────────────────┘
```

### Key Characteristics

- **Separate Processes** — Main and renderer isolated for security
- **Unidirectional Flow** — Renderer initiates, main responds
- **Real-time Updates** — Progress events stream back to UI
- **Type-Safe** — Full TypeScript across all layers
- **Stateless Main** — Render process drives state

---

## Electron Architecture

### Main Process (`src/main/index.ts`)

Entry point that:
1. Creates BrowserWindow
2. Registers IPC handlers
3. Manages app lifecycle
4. Handles native operations

```typescript
// Lifecycle
app.on('ready', () => {
  createWindow()
  registerHandlers()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### Window Creation

```typescript
const win = new BrowserWindow({
  width: 860,
  height: 620,
  frame: false,  // Frameless for custom titlebar
  webPreferences: {
    preload: join(__dirname, '../preload/preload.js'),
    contextIsolation: true,
    enableRemoteModule: false,
  },
  icon: path.join(__dirname, '../../resources/icon.png'),
})

// Load app
if (is.dev) {
  win.loadURL(`http://localhost:5173`) // Vite dev server
} else {
  win.loadFile(join(__dirname, '../renderer/index.html'))
}
```

### IPC Handlers

Three categories:

#### 1. System Handler (`src/main/handlers/system.handler.ts`)

```typescript
export interface SystemCheckResult {
  node: { ok: boolean; version?: string }
  port18789: { ok: boolean }
  diskSpace5GB: { ok: boolean; available?: number }
  git: { ok: boolean }
}

// Async handler
ipcMain.handle('system:check', async (): Promise<SystemCheckResult> => {
  return {
    node: await checkNodeVersion(),
    port18789: await checkPortAvailable(18789),
    diskSpace5GB: await checkDiskSpace(),
    git: await checkGitInstalled(),
  }
})
```

#### 2. Install Handler (`src/main/handlers/install.handler.ts`)

```typescript
// Spawns subprocess, streams progress
ipcMain.handle('install:start', async (event, config: InstallConfig) => {
  const process = spawn('npm', ['install', '-g', 'openclaw@latest'])

  process.stdout.on('data', (data) => {
    // Send progress back to renderer
    event.sender.send('install:progress', { log: data.toString() })
  })

  process.on('close', (code) => {
    // Run openclaw config
    // Send completion event
    event.sender.send('install:complete', { success: code === 0 })
  })
})
```

#### 3. Config Handler (`src/main/handlers/config.handler.ts`)

```typescript
// Persist configuration to userData directory
ipcMain.handle('config:save', async (event, config: InstallConfig) => {
  const configPath = join(app.getPath('userData'), 'openclaw-config.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  return { success: true }
})
```

---

## React UI Architecture

### Component Hierarchy

```
App
├── TitleBar
│   ├── (macOS native controls)
│   └── (Windows/Linux custom controls)
├── LanguageProvider
│   └── InstallationProvider
│       └── Wizard
│           ├── Welcome (step: "welcome")
│           ├── SystemCheck (step: "system-check")
│           ├── SetupType (step: "setup-type")
│           ├── AgentName (step: "agent-name")
│           ├── ModelSelection (step: "model")
│           ├── ApiKey (step: "api-key")
│           ├── Channels (step: "channels")
│           ├── ChannelCredentials (step: "credentials")
│           ├── Installing (step: "installing")
│           └── Success (step: "success")
```

### Page Components

Each page is a **motion component** that:
- Receives data via `useInstallation()`
- Updates state on user interaction
- Renders validated input fields
- Shows i18n text via `useLanguage()`
- Animates transitions via framer-motion

```typescript
export function MyPage() {
  const { myState, setMyState, goNext, goPrev } = useInstallation()
  const { language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <input onChange={(e) => setMyState(e.target.value)} />
      <button onClick={goNext}>Next</button>
    </motion.div>
  )
}
```

### Reusable Components

Small, focused components:

| Component | Purpose | Example Usage |
|-----------|---------|---------------|
| `TitleBar` | Window controls | Rendered in App root |
| `Wizard` | Step router | Routes by current step |
| `StepIndicator` | Visual progress | Shows 8 completed vs pending |
| `LanguageToggle` | ES/EN switcher | Rendered on every page |
| `GuideModal` | Step-by-step guide | Opened from channel pages |
| `ErrorBoundary` | Error handling | Wraps Wizard |
| `ChannelGuide/*` | Channel-specific guides | Imported by ChannelCredentials |

---

## IPC Communication

### Message Flow

#### Sending (Renderer → Main)

```typescript
// In React component
const result = await window.api.system.check()
// Waiting...
// Main process handles and returns
```

#### Receiving (Main → Renderer)

```typescript
// In main handler
event.sender.send('install:progress', { log: '...' })

// In React component
useEffect(() => {
  window.api.install.onProgress((data) => {
    setProgress(data.log)
  })
}, [])
```

### API Surface

Defined in `src/types/index.ts` and exposed via `src/preload/preload.ts`:

```typescript
export interface Api {
  system: {
    check: () => Promise<SystemCheckResult>
    openUrl: (url: string) => Promise<void>
  }
  install: {
    start: (config: InstallConfig) => Promise<void>
    onProgress: (callback: (data: ProgressData) => void) => void
    onComplete: (callback: (data: CompleteData) => void) => void
  }
  config: {
    save: (config: InstallConfig) => Promise<{ success: boolean }>
    load: () => Promise<InstallConfig | null>
    clear: () => Promise<{ success: boolean }>
  }
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}
```

### Security Considerations

1. **Context Isolation** — Main and renderer separate
2. **Limited Surface** — Only necessary APIs exposed
3. **Type Safety** — All IPC messages typed
4. **No eval()** — Never execute user code
5. **Preload Verification** — Uses `contextBridge.exposeInMainWorld`

---

## State Management

### InstallationContext

Single source of truth for wizard state:

```typescript
interface InstallationState {
  // Current step
  currentStep: WizardStep

  // User inputs (persisted to config)
  setupType: SetupType
  agentName: string
  agentEmoji: string
  primaryModel: string
  fallbackModel?: string
  apiKey?: string
  channels: Set<ChannelId>
  phoneNumber?: string
  telegramToken?: string
  discordToken?: string
  slackToken?: string

  // Installation state
  isInstalling: boolean
  installProgress: string
  installError?: string

  // Generated artifacts
  installConfig: InstallConfig
  dashboardUrl?: string
}
```

### State Management Pattern

**Actions:**
```typescript
const {
  goNext, goPrev, goToStep,           // Navigation
  setAgentName, setSetupType,          // Setters
  toggleChannel, setPhoneNumber,       // Complex updates
  startInstallation, completeInstall   // Lifecycle
} = useInstallation()
```

**Derived State:**
```typescript
const {
  installConfig,      // Generated from inputs
  canGoNext,          // Whether next button enabled
  needsApiKey,        // Skip api-key if local setup
  needsCredentials,   // Skip credentials if no channels
} = useInstallation()
```

### LanguageContext

Simpler context for language preference:

```typescript
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

// Auto-detects system language
// Persists to localStorage
// Available globally via useLanguage()
```

---

## Build Pipeline

### Vite Build (`electron-vite`)

Compiles three separate bundles:

#### 1. Main Process Build
```
src/main/** → TypeScript → out/main/index.js
- Node.js environment
- Module: commonjs (for Electron compatibility)
- Target: node22
```

#### 2. Preload Build
```
src/preload/** → TypeScript → out/preload/preload.js
- Node.js environment (but runs in renderer context)
- Minimal, isolated script
```

#### 3. Renderer Build
```
src/renderer/** → TypeScript + React → out/renderer/
- Browser environment
- SPA with route navigation
- Code splitting optimizations
- CSS bundled with Tailwind
```

### electron-builder Packaging

Takes compiled files and creates installers:

```
out/ → electron-builder → dist/
├── Windows: .exe (NSIS)
├── macOS: .dmg
└── Linux: .AppImage + .deb
```

Configured in `electron-builder.yml`:
- App metadata
- Build artifacts
- Code signing (optional)
- Auto-update settings

---

## Type System

### Shared Types (`src/types/index.ts`)

```typescript
// Setup flow
export type SetupType = "quick" | "cloud" | "full"
export type Language = "es" | "en"

// Installation config (sent to main)
export interface InstallConfig {
  setupType: SetupType
  language: Language
  agentName: string
  primaryModel: string
  fallbackModel?: string
  apiKey?: string
  channels: string[]
  phoneNumber?: string
  telegramToken?: string
  discordToken?: string
  slackToken?: string
}

// IPC API (exposed to renderer)
export interface Api { ... }

// System check result
export interface SystemCheckResult { ... }
```

### Composite TypeScript Configuration

**Root** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

**Main** (`tsconfig.node.json`):
```json
{
  "extends": "@electron-toolkit/tsconfig",
  "include": ["src/main/**/*", "src/types/**/*"],
  "exclude": ["src/renderer/**/*"],
  "compilerOptions": {
    "outDir": "./out/main"
  }
}
```

**Web** (`tsconfig.web.json`):
```json
{
  "extends": "@electron-toolkit/tsconfig",
  "include": ["src/preload/**/*", "src/renderer/**/*", "src/types/**/*"],
  "exclude": ["src/main/**/*"],
  "compilerOptions": {
    "outDir": "./out/renderer"
  }
}
```

This prevents circular dependencies and enforces separation of concerns.

---

## Security

### IPC Security

**What we DON'T do:**
```typescript
// ❌ Never: eval, Function constructor
ipcMain.handle('evil:run', (event, code) => {
  eval(code)  // NEVER!
})

// ❌ Never: expose entire native modules
contextBridge.exposeInMainWorld('require', require)

// ❌ Never: trust user input without validation
ipcMain.handle('config:set', (event, config) => {
  saveConfig(config)  // Validated!
})
```

**What we DO:**
```typescript
// ✅ Always: define limited API
contextBridge.exposeInMainWorld('api', {
  system: { check: () => ... },
  install: { start: () => ... },
})

// ✅ Always: validate inputs
const result = validateAgentName(input)
if (!result.valid) throw new Error(result.error)

// ✅ Always: handle errors gracefully
try {
  await installOpenClaw(config)
} catch (error) {
  event.sender.send('install:error', error.message)
}
```

### Configuration Security

- API keys **never logged**
- Config stored in `app.getPath('userData')` (platform-appropriate)
- Environment variables **not exposed** to renderer
- Sensitive data **not in console output**

### Build Security

- Code verified with TypeScript strict mode
- Dependencies scanned for vulnerabilities
- No eval or dynamic code execution
- Electron security best practices followed

---

## Data Flow Diagram

```
User Input (React Component)
    ↓
useInstallation() Hook
    ↓
InstallationContext.setState()
    ↓
Component Re-render
    ↓ (Form Submission)
window.api.install.start(config)
    ↓
IPC Message to Main
    ↓
Main Process Handler
    ↓
Spawn subprocess (npm install)
    ↓
Event emission: install:progress
    ↓
IPC Message back to Renderer
    ↓
useEffect hook receives event
    ↓
setProgress() updates state
    ↓
Component Re-render
    ↓
User sees progress
```

---

## Future Improvements

### Potential Enhancements

1. **E2E Testing** — Playwright tests for full workflows
2. **Auto-Update** — electron-updater integration
3. **Internationalization** — Additional language support
4. **Analytics** — Usage tracking (privacy-respecting)
5. **Plugin System** — Custom channel providers
6. **Dark Mode Toggle** — User preference (currently hardcoded dark)
7. **Resume Installation** — Continue from last step
8. **Offline Mode** — Bundled dependencies for no-internet installs

### Performance Optimizations

- Code splitting for faster loads
- Lazy loading of channel guides
- Virtual scrolling for long lists
- Service workers for offline support
- Binary caching for npm packages

---

## References

- **Electron** — https://www.electronjs.org/docs
- **React** — https://react.dev
- **Vite** — https://vitejs.dev
- **electron-vite** — https://electron-vite.org
- **TypeScript** — https://www.typescriptlang.org/docs

---

**Last Updated:** March 2024
**Maintainer:** OpenClaw Team
