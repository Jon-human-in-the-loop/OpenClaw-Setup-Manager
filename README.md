# OpenClaw Easy Installer

A **desktop application** for installing and configuring [OpenClaw](https://github.com/openclaw/openclaw) without technical knowledge. Available for Windows, macOS, and Linux.

> Aplicación Desktop para instalar y configurar [OpenClaw](https://github.com/openclaw/openclaw) sin conocimientos técnicos.

![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Platform: Electron](https://img.shields.io/badge/platform-Electron-blue)
![Node: 22+](https://img.shields.io/badge/node-22%2B-green)

## Table of Contents

1. [Overview & Features](#overview--features)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Development Guide](#development-guide)
7. [Building & Packaging](#building--packaging)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)
12. [Security](#security)
13. [Internationalization](#internationalization)
14. [License](#license)

---

## Overview & Features

### What It Does

The OpenClaw Easy Installer guides users through a **step-by-step wizard** to install and configure OpenClaw completely automatically:

1. **System Verification** — Checks Node.js 22+, port availability, disk space, Git
2. **Setup Type Selection** — Quick Start (free local), Cloud (Claude/GPT), or Full Multi-Channel
3. **Agent Identity** — Name your assistant and choose an emoji
4. **AI Model Selection** — Choose from 14 models (Anthropic Claude, OpenAI, Google Gemini, Ollama local)
5. **API Key Configuration** — Provider-specific guides for API key retrieval
6. **Communication Channels** — Enable WhatsApp, Telegram, Discord, or Slack
7. **Channel Credentials** — Collect credentials with visual setup guides
8. **Installation** — Automatic npm install + OpenClaw configuration with live progress
9. **Success** — Dashboard access and next steps

### Key Features

- ✅ **Cross-Platform** — Windows, macOS, Linux with native installers
- ✅ **Frameless UI** — Modern, clean interface with custom title bar
- ✅ **Dark Theme** — Beautiful dark mode with accessible colors
- ✅ **Bilingual** — Español & English with automatic system language detection
- ✅ **Smart Step Skipping** — Skip unnecessary steps based on user choices
- ✅ **Secure IPC** — Electron context bridge for secure process communication
- ✅ **Real-time Progress** — Live installation logs and status updates
- ✅ **Production Ready** — Error handling, validation, type safety

### Target Users

Non-technical users who want to install OpenClaw without command-line knowledge.

---

## Quick Start

### Prerequisites

- **Node.js** 22.0 or later (will verify on first run)
- **pnpm** 10+ (recommended) or npm/yarn
- **Git** (optional, for local development)

### Installation (Development)

```bash
# Clone the repository
git clone https://github.com/openclaw/openclaw-easy-installer-electron.git
cd openclaw-easy-installer-electron

# Install dependencies
pnpm install

# Start dev server with hot-reload
pnpm dev

# In another terminal, run Electron
electron out/main/index.js
```

### Building for Distribution

```bash
# Build all platforms
pnpm package

# Or build specific platform
pnpm package:win    # Windows .exe
pnpm package:mac    # macOS .dmg
pnpm package:linux  # Linux AppImage + .deb
```

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│              Electron Main Process                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │System    │  │Install   │  │Config    │              │
│  │Handler   │  │Handler   │  │Handler   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│       IPC            IPC            IPC                 │
└─────────┬──────────────┬──────────────┬─────────────────┘
          │              │              │
┌─────────▼──────────────▼──────────────▼─────────────────┐
│              Context Bridge (Secure)                    │
│  window.api.system.*  window.api.install.*              │
│  window.api.config.*  window.api.window.*               │
└─────────┬────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────┐
│           Electron Renderer (React App)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  App.tsx (LanguageProvider + InstallationContext) │  │
│  │  ┌─────────────┐  ┌────────────────────────────┐ │  │
│  │  │  TitleBar   │  │  Wizard (AnimatePresence)  │ │  │
│  │  └─────────────┘  ├────────────────────────────┤ │  │
│  │                   │  9 Page Components         │ │  │
│  │                   │  - Welcome                 │ │  │
│  │                   │  - SystemCheck             │ │  │
│  │                   │  - SetupType               │ │  │
│  │                   │  - AgentName               │ │  │
│  │                   │  - ModelSelection          │ │  │
│  │                   │  - ApiKey                  │ │  │
│  │                   │  - Channels                │ │  │
│  │                   │  - ChannelCredentials      │ │  │
│  │                   │  - Installing/Success      │ │  │
│  │                   └────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                  + Contexts, Hooks, i18n               │
│                  + Validation, Models, Utils           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → React component state (InstallationContext)
2. **Form Submission** → IPC call to main process handler
3. **Main Process** → System operations (node version, npm install, config)
4. **IPC Events** → Progress updates back to renderer
5. **Success/Error** → Display result, offer retry or completion

### Key Contexts

#### `LanguageContext`
- Detects system language (ES/EN)
- Persists to localStorage
- Provides `useLanguage()` hook globally

#### `InstallationContext`
- Single source of truth for all wizard state
- 10 steps with smart skipping logic
- Generates complete installation config
- Provides `useInstallation()` hook

---

## Tech Stack

### Core

- **Electron 33** — Desktop framework (main + preload + renderer)
- **React 18** — UI library with hooks
- **TypeScript 5.7** — Type-safe development
- **Vite 6** — Modern bundler via electron-vite

### Styling

- **Tailwind CSS 3** — Utility-first CSS framework
- **tailwindcss-animate** — Animation utilities
- **clsx** — Conditional class names

### UI Components

- **Radix UI** — Headless, accessible components
  - Checkbox, Dialog, Label, Progress, Radio Group, Scroll Area, Select, Separator, Tabs, Tooltip
- **shadcn/ui** — Styled Radix primitives
- **lucide-react** — 450+ SVG icons

### Interactions

- **framer-motion** — Animation library
- **class-variance-authority** — Variant pattern for components

### Tooling

- **electron-builder** — Build and package for all platforms
- **Prettier** — Code formatting
- **TypeScript Composite Projects** — Modular TS configuration

### Testing

- **Vitest** — Unit testing framework
- **@testing-library/react** — Component testing utilities
- **happy-dom** — Lightweight DOM implementation

---

## Project Structure

```
openclaw-easy-installer-electron/
├── src/
│   ├── main/                          # Electron main process
│   │   ├── index.ts                   # Create window, register handlers
│   │   └── handlers/
│   │       ├── system.handler.ts      # System checks (Node, port, disk, git)
│   │       ├── install.handler.ts     # npm install + openclaw config
│   │       └── config.handler.ts      # Load/save config from userData
│   │
│   ├── preload/                       # IPC bridge
│   │   └── preload.ts                 # Expose window.api safely
│   │
│   ├── renderer/                      # React UI (built to out/renderer)
│   │   ├── App.tsx                    # Root component
│   │   ├── main.tsx                   # React DOM render
│   │   │
│   │   ├── pages/                     # 9 wizard pages
│   │   │   ├── Welcome.tsx
│   │   │   ├── SystemCheck.tsx
│   │   │   ├── SetupType.tsx
│   │   │   ├── AgentName.tsx
│   │   │   ├── ModelSelection.tsx
│   │   │   ├── ApiKey.tsx
│   │   │   ├── Channels.tsx
│   │   │   ├── ChannelCredentials.tsx
│   │   │   ├── Installing.tsx
│   │   │   └── Success.tsx
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── TitleBar.tsx           # Custom window controls
│   │   │   ├── Wizard.tsx             # Step router
│   │   │   ├── StepIndicator.tsx      # Progress indicator
│   │   │   ├── LanguageToggle.tsx     # ES/EN switcher
│   │   │   ├── GuideModal.tsx         # Step-by-step guide modal
│   │   │   ├── ErrorBoundary.tsx      # Error handling
│   │   │   └── ChannelGuide/          # Channel-specific setup guides
│   │   │       ├── WhatsAppGuide.tsx
│   │   │       ├── TelegramGuide.tsx
│   │   │       ├── DiscordGuide.tsx
│   │   │       └── SlackGuide.tsx
│   │   │
│   │   ├── context/                   # React Contexts
│   │   │   ├── LanguageContext.tsx    # Language state + detection
│   │   │   └── InstallationContext.tsx# Wizard state machine
│   │   │
│   │   ├── lib/                       # Utilities
│   │   │   ├── i18n.ts                # Translation map + t() function
│   │   │   ├── models.ts              # LLM model definitions
│   │   │   ├── validation.ts          # Input validators
│   │   │   └── error-messages.ts      # Structured error info
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css            # Dark theme, CSS variables
│   │   │
│   │   ├── env.d.ts                   # window.api type declaration
│   │   └── __tests__/                 # Test files
│   │       ├── setup.ts               # Test configuration
│   │       ├── utils.tsx              # Custom render with providers
│   │       ├── lib/
│   │       │   ├── i18n.test.ts
│   │       │   ├── models.test.ts
│   │       │   └── validation.test.ts
│   │       ├── context/
│   │       │   └── LanguageContext.test.tsx
│   │       └── components/
│   │           └── LanguageToggle.test.tsx
│   │
│   └── types/
│       └── index.ts                   # Shared type definitions
│           (SetupType, Language, InstallConfig, Api, etc.)
│
├── out/                               # Build output (git ignored)
│   ├── main/
│   ├── preload/
│   └── renderer/
│
├── resources/
│   └── icon.svg                       # Window icon
│
├── build/
│   └── icon.svg                       # Installer icon
│
├── electron-builder.yml               # Build configuration
├── electron.vite.config.ts            # Vite build config
├── vitest.config.ts                   # Test configuration
├── tsconfig.json                      # Root TS config with project refs
├── tsconfig.node.json                 # Main process TS config
├── tsconfig.web.json                  # Renderer TS config
├── postcss.config.js                  # Tailwind PostCSS
├── tailwind.config.js                 # Tailwind CSS config
├── .prettierrc                        # Prettier formatting
│
├── package.json                       # Dependencies, scripts
└── README.md                          # This file
```

### TypeScript Project Structure

The project uses **composite TypeScript configuration** for modular compilation:

```
tsconfig.json (root)
├── references: tsconfig.node.json (main), tsconfig.web.json (renderer)
└── files: [] (empty)

tsconfig.node.json
├── extends: @electron-toolkit/tsconfig
├── include: src/main/**, src/types/**
└── exclude: src/renderer/**

tsconfig.web.json
├── extends: @electron-toolkit/tsconfig
├── include: src/preload/**, src/renderer/**, src/types/**
└── exclude: src/main/**
```

This prevents circular dependencies and enables separate builds for main and renderer.

---

## Development Guide

### Local Setup

```bash
# Clone repository
git clone <repo>
cd openclaw-easy-installer-electron

# Install dependencies with pnpm (required for speed/reliability)
pnpm install

# Start Electron development server
pnpm dev
# The app will reload on file changes (HMR for React)
```

### Development Workflow

#### 1. **React Component Development**

```typescript
// Example: Creating a new step page

// src/renderer/pages/MyStep.tsx
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

export function MyStep() {
  const { myValue, setMyValue } = useInstallation();
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2>{t(language, "mykey.title")}</h2>
      {/* Component JSX */}
    </motion.div>
  );
}
```

#### 2. **Adding Translations**

```typescript
// src/renderer/lib/i18n.ts

const translations = {
  "mykey.title": { es: "Mi Título", en: "My Title" },
  "mykey.desc": { es: "Descripción", en: "Description" },
};

// Usage:
t(language, "mykey.title") // Returns Spanish or English
t(language, "mykey.title", { name: "John" }) // Variable substitution
```

#### 3. **IPC Communication**

```typescript
// src/renderer/pages/Example.tsx
import { useEffect } from "react";

function Example() {
  useEffect(() => {
    // Call main process
    window.api.system.check().then((result) => {
      console.log("System check result:", result);
    });

    // Listen for events
    window.api.install.onProgress((data) => {
      console.log("Install progress:", data);
    });

    return () => {
      // Cleanup
    };
  }, []);

  return null;
}
```

### Available Scripts

```bash
# Development
pnpm dev               # Start dev server with HMR

# Code Quality
pnpm check            # TypeScript type check (all projects)
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run tests in watch mode
pnpm test:ui          # Open test UI dashboard
pnpm test:coverage    # Generate coverage report

# Building
pnpm build            # Build all processes (main + preload + renderer)
pnpm preview          # Preview production build

# Packaging
pnpm package          # Build + package for current OS
pnpm package:win      # Windows .exe installer
pnpm package:mac      # macOS .dmg
pnpm package:linux    # Linux AppImage + .deb
```

### Debugging

#### **VS Code Launch Configuration**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/electron",
      "args": [".", "--enable-logging"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

#### **React DevTools**

Install [React Developer Tools extension](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) and use in Electron DevTools:

```bash
# Open DevTools in running Electron window
Right-click → Inspect Element
Or: Ctrl+Shift+I (Windows/Linux), Cmd+Option+I (macOS)
```

#### **Electron Main Process**

```typescript
// In src/main/index.ts, enable remote debugging
// app.commandLine.appendSwitch("remote-debugging-port", "9222");
```

---

## Building & Packaging

### Build Process

```bash
# 1. Compile TypeScript and bundle with Vite
pnpm build

# Output:
# - out/main/index.js          (Electron main process)
# - out/preload/preload.js     (IPC bridge)
# - out/renderer/...           (React SPA)
```

### Packaging for Distribution

#### **Windows**

```bash
pnpm package:win

# Creates:
# - dist/OpenClaw Easy Installer.exe  (NSIS installer)
# - dist/OpenClaw Easy Installer.exe.blockmap  (updates)
```

Requirements:
- Windows 7+ (target in `electron-builder.yml`)
- NSIS configuration in `electron-builder.yml`

#### **macOS**

```bash
pnpm package:mac

# Creates:
# - dist/OpenClaw Easy Installer.dmg  (Disk image)
```

Requirements:
- macOS 10.13+ (target in `electron-builder.yml`)
- Code signing (optional, see `electron-builder.yml`)

#### **Linux**

```bash
pnpm package:linux

# Creates:
# - dist/openclaw-easy-installer.AppImage
# - dist/openclaw-easy-installer-*.deb
```

### Custom Icons

Place icon files in `build/`:
- `build/icon.png` (256x256) — For Windows + Linux
- `build/icon.icns` (macOS format) — For macOS
- `build/icon.svg` — Vector fallback (converted to PNG)

Electron-builder will automatically use these.

---

## Configuration

### Environment Variables

Create `.env.local` (git ignored):

```bash
# Development server
VITE_API_URL=http://localhost:3000

# Build output
VITE_APP_NAME=OpenClaw Easy Installer
VITE_APP_VERSION=1.0.0
```

### Vite Configuration

File: `electron.vite.config.ts`

```typescript
export default defineConfig({
  main: {
    // Main process build
    build: { outDir: "out/main" },
  },
  preload: {
    // Preload scripts
    build: { outDir: "out/preload" },
  },
  renderer: {
    // Renderer (React app)
    build: { outDir: "out/renderer" },
  },
});
```

### Tailwind CSS Configuration

File: `tailwind.config.js`

```typescript
export default {
  darkMode: "class", // Dark mode via class
  theme: {
    extend: {
      colors: {
        primary: "hsl(142 76% 55%)", // Green neon
      },
    },
  },
  content: ["src/renderer/**/*.tsx"],
};
```

### TypeScript Configuration

Root: `tsconfig.json`
- Targets: ES2020
- Module: ESNext
- Strict mode: true
- Path aliases: `@/` → `src/renderer/`

---

## Testing

### Test Setup

```bash
# Install test dependencies
pnpm install --save-dev vitest @testing-library/react

# Run tests
pnpm test
```

### Unit Tests

Located in `src/renderer/__tests__/lib/`:

```typescript
// Example: i18n.test.ts
import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n";

describe("i18n", () => {
  it("should translate keys", () => {
    expect(t("es", "common.next")).toBe("Siguiente");
    expect(t("en", "common.next")).toBe("Next");
  });
});
```

Tests cover:
- **i18n.ts** — Translation system
- **models.ts** — LLM model definitions
- **validation.ts** — Input validators
- **LanguageContext.tsx** — Language state management
- **LanguageToggle.tsx** — UI component

Run with:
```bash
pnpm test              # Watch mode
pnpm test:ui           # UI dashboard
pnpm test:coverage     # Coverage report
```

### Component Testing

```typescript
import { render, screen } from "@/renderer/__tests__/utils";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

The `renderWithProviders` wrapper includes LanguageContext and InstallationContext.

---

## Contributing

### Code Style

- **TypeScript strict mode** — No `any` types without justification
- **React Hooks** — Prefer hooks over classes
- **Prettier formatting** — Auto-format on save: `pnpm format`
- **Clear naming** — descriptive variable/function names

### Commit Messages

```bash
git commit -m "feat(wizard): add new step component"
git commit -m "fix(i18n): correct Spanish translation"
git commit -m "docs: update README"
```

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am "feat: ..."`
4. Push to GitHub: `git push origin feature/my-feature`
5. Open Pull Request with clear description
6. Ensure tests pass: `pnpm check && pnpm test`

### Adding a New Translation

1. Add to `src/renderer/lib/i18n.ts`:
   ```typescript
   "mykey.title": { es: "Título", en: "Title" },
   ```

2. Use in component:
   ```typescript
   t(language, "mykey.title")
   ```

3. Test coverage includes the key

### Adding a New LLM Model

1. Edit `src/renderer/lib/models.ts`:
   ```typescript
   {
     id: "provider/model-id",
     name: "Model Name",
     description: "Descripción",
     descriptionEn: "Description",
     isLocal: false,
     context: "200K",
   }
   ```

2. Tests validate model definitions

---

## Troubleshooting

### Common Issues

#### **Dev Server Won't Start**

```bash
# Error: Cannot find module 'vite'
pnpm install

# Error: Port 3000 in use
# Change port in electron.vite.config.ts
```

#### **TypeScript Errors**

```bash
# Regenerate types
pnpm check

# Clear build cache
rm -rf out/ .vite-cache/

# Reinstall dependencies
pnpm install --force
```

#### **Build Failures**

```bash
# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Try building again
pnpm build
```

#### **Packaging Issues (Windows)**

- Ensure NSIS is installed (electron-builder downloads it)
- Code signing requires valid certificate (optional for testing)

#### **Packaging Issues (macOS)**

- Building on macOS required for `.dmg`
- Cross-building from Windows/Linux requires Docker

#### **HMR Not Working**

```bash
# Restart dev server
# Kill pnpm dev and run again
pnpm dev
```

### Debug Logging

Enable verbose logging:

```typescript
// src/renderer/App.tsx
if (process.env.DEBUG) {
  console.log("Detailed logs here...");
}
```

Then run:
```bash
DEBUG=true pnpm dev
```

---

## Security

### IPC Security

- ✅ **contextBridge** — Secure exposure of limited API
- ✅ **No eval()** — Prevent code injection
- ✅ **Input validation** — All user inputs validated before IPC
- ✅ **No sensitive data in logs** — API keys filtered from output

### Configuration Security

- ✅ **localStorage only** — Config stored in `app.getPath("userData")`
- ✅ **No hardcoded secrets** — All from user input or environment
- ✅ **Platform permissions** — Uses native file I/O (no direct execution risk)

### Build Security

- ✅ **Code signing** — Windows/macOS builds signed (optional)
- ✅ **Update verification** — electron-updater validates signatures
- ✅ **No auto-update** — Manual update mechanism (safer)

---

## Internationalization

### Supported Languages

- 🇪🇸 **Spanish** (es) — Default for compatible systems
- 🇺🇸 **English** (en) — Fallback and alternate

### Auto-Detection

```typescript
// src/renderer/context/LanguageContext.tsx
const systemLang = navigator.language.split("-")[0];
const lang = ["es", "en"].includes(systemLang) ? systemLang : "es";
```

### Manual Switching

The LanguageToggle component is available on every page:

```typescript
<LanguageToggle />
```

### Adding New Language

1. Create new language key in `i18n.ts`:
   ```typescript
   "common.next": { es: "Siguiente", en: "Next", fr: "Suivant" }
   ```

2. Update `Language` type in `src/types/index.ts`:
   ```typescript
   export type Language = "es" | "en" | "fr";
   ```

3. Update LanguageContext for system detection
4. Update LanguageToggle component

---

## License

MIT © [OpenClaw](https://github.com/openclaw/openclaw)

This project is open-source and free to use, modify, and distribute under the MIT license.

---

## Resources

- **OpenClaw GitHub** — https://github.com/openclaw/openclaw
- **Electron Docs** — https://www.electronjs.org/docs
- **React Docs** — https://react.dev
- **Tailwind CSS** — https://tailwindcss.com
- **TypeScript Handbook** — https://www.typescriptlang.org/docs

---

## Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/openclaw/openclaw-easy-installer-electron/issues).

**Happy coding! 🚀**
