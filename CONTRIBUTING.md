# Contributing to OpenClaw Easy Installer

Thank you for your interest in contributing! This document provides guidelines for participation.

## Code of Conduct

- Be respectful and professional
- Welcome feedback and diverse perspectives
- Keep discussions constructive
- Report issues responsibly

## Getting Started

### Prerequisites

- Node.js 22.0+
- pnpm 10.0+
- Git
- VS Code (recommended)

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/openclaw-easy-installer-electron.git
cd openclaw-easy-installer-electron

# Install dependencies
pnpm install

# Start development server
pnpm dev

# In another terminal, verify build
pnpm check
```

### Useful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** — Syntax highlighting
- **Tailwind CSS IntelliSense** — Tailwind autocomplete
- **Prettier - Code formatter** — Auto-format on save
- **TypeScript Vue Plugin (Volar)** — TypeScript support

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
# Or for bug fixes:
git checkout -b fix/bug-description
```

Branch naming convention: `feature/*`, `fix/*`, `docs/*`, `chore/*`

### 2. Make Your Changes

Follow the existing code style:

```typescript
// ✅ Good
function validateInput(input: string): boolean {
  return input.trim().length > 0;
}

// ❌ Avoid
function validate(i: any) {
  return i.trim().length > 0;
}
```

#### Code Quality Checklist

- [ ] TypeScript strict mode (no `any` without reason)
- [ ] Component names are PascalCase
- [ ] Function names are camelCase
- [ ] Constants are UPPER_SNAKE_CASE
- [ ] Private functions prefixed with `_`

### 3. Run Quality Checks

```bash
# Check TypeScript
pnpm check

# Format code
pnpm format

# Run tests
pnpm test -- --run

# Verify build
pnpm build
```

### 4. Write Tests

For features, include tests:

```typescript
// src/renderer/__tests__/features/MyFeature.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/myfeature";

describe("MyFeature", () => {
  it("should do what is expected", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

Run tests:
```bash
pnpm test -- --run
```

### 5. Commit with Clear Messages

```bash
# Format: type(scope): description
git commit -m "feat(wizard): add new validation step"
git commit -m "fix(i18n): correct Spanish translation key"
git commit -m "docs: update README with contributing guide"
git commit -m "test(models): add model selection tests"
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (no logic change)
- `refactor` — Code restructure (no behavior change)
- `test` — Add/update tests
- `chore` — Dependencies, build, etc.

### 6. Push and Create PR

```bash
git push origin feature/my-feature
```

Go to GitHub and create a Pull Request with:
- Clear title
- Description of changes
- Related issues (if any): `Closes #123`
- Screenshots for UI changes

### 7. Code Review

A maintainer will review your PR. Be prepared to:
- Address feedback
- Make additional changes if requested
- Discuss design decisions

## Architecture Decisions

### File Organization

Place files according to their type:

| Type | Location | Pattern |
|------|----------|---------|
| Page component | `src/renderer/pages/` | `PascalCase.tsx` |
| Reusable component | `src/renderer/components/` | `PascalCase.tsx` |
| Context/Hook | `src/renderer/context/` | `PascalCaseContext.tsx` or `useHook.ts` |
| Utility function | `src/renderer/lib/` | `camelCase.ts` |
| Test file | `src/renderer/__tests__/` | Same path as source + `.test.ts` |
| Main process handler | `src/main/handlers/` | `camelCase.handler.ts` |

### Adding a New Page

1. Create page component in `src/renderer/pages/`:

```typescript
// src/renderer/pages/MyPage.tsx
import { motion } from "framer-motion";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";

export function MyPage() {
  const { /* state */ } = useInstallation();
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2>{t(language, "mypage.title")}</h2>
      {/* Page JSX */}
    </motion.div>
  );
}
```

2. Add to `InstallationContext` in `src/renderer/context/InstallationContext.tsx`:

```typescript
export type WizardStep =
  | "welcome"
  | "system-check"
  | "setup-type"
  | "agent-name"
  | "model"
  | "api-key"
  | "channels"
  | "credentials"
  | "installing"
  | "success"
  | "my-page"; // Add here

const WIZARD_STEPS: WizardStep[] = [
  "welcome",
  "system-check",
  // ... existing steps
  "my-page", // Add here
];
```

3. Add step to Wizard router in `src/renderer/components/Wizard.tsx`:

```typescript
import { MyPage } from "@/pages/MyPage";

export function Wizard() {
  return (
    <AnimatePresence>
      {currentStep === "my-page" && <MyPage />}
      {/* Other steps */}
    </AnimatePresence>
  );
}
```

4. Add translations in `src/renderer/lib/i18n.ts`:

```typescript
const translations = {
  // ... existing
  "mypage.title": { es: "Mi Página", en: "My Page" },
  "mypage.description": { es: "Descripción", en: "Description" },
};
```

### Adding a New IPC Handler

1. Create handler in `src/main/handlers/`:

```typescript
// src/main/handlers/myfeature.handler.ts
import { ipcMain } from "electron";

export function registerMyFeatureHandlers() {
  ipcMain.handle("myfeature:action", async (event, data) => {
    try {
      // Perform action
      return { success: true, result: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
```

2. Register in `src/main/index.ts`:

```typescript
import { registerMyFeatureHandlers } from "./handlers/myfeature.handler";

app.on("ready", () => {
  // ... window creation
  registerMyFeatureHandlers();
});
```

3. Export API in `src/preload/preload.ts`:

```typescript
contextBridge.exposeInMainWorld("api", {
  myfeature: {
    action: (data: any) => ipcMain.invoke("myfeature:action", data),
  },
  // ... other APIs
});
```

4. Type in `src/types/index.ts`:

```typescript
export interface Api {
  myfeature: {
    action: (data: any) => Promise<Result>;
  };
  // ... other APIs
}
```

## Testing Guidelines

### Unit Tests

Test utilities, validators, helpers:

```typescript
import { describe, it, expect } from "vitest";

describe("Module", () => {
  it("should handle normal input", () => {
    expect(func(input)).toBe(expected);
  });

  it("should handle edge cases", () => {
    expect(func("")).toThrow();
  });
});
```

### Component Tests

Test React components with user-centric queries:

```typescript
import { render, screen, fireEvent } from "@/renderer/__tests__/utils";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("should render and respond to interaction", () => {
    render(<MyComponent />);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

### Coverage Targets

Aim for:
- **Utilities** — 90%+ coverage
- **Components** — 80%+ coverage
- **Contexts** — 85%+ coverage

Run coverage report:
```bash
pnpm test:coverage
```

## Documentation

### README Sections

Update README.md for:
- New features
- Changed API
- New scripts or configurations

### Code Comments

Comment non-obvious logic:

```typescript
// ✅ Good: explains WHY
// Trim whitespace because API expects E.164 format without spaces
const normalized = phone.trim();

// ❌ Bad: explains WHAT (code already does this)
// Trim the phone number
const normalized = phone.trim();
```

### JSDoc for Exports

Document public APIs:

```typescript
/**
 * Validates an agent name
 * @param name - The name to validate (1-30 chars)
 * @returns Validation result with optional error messages
 * @example
 * const result = validateAgentName("Claude");
 * if (result.valid) console.log("Valid!");
 */
export function validateAgentName(name: string): ValidationResult {
  // ...
}
```

## Reporting Issues

When reporting bugs:

1. **Search first** — Check if issue already exists
2. **Minimal example** — Provide steps to reproduce
3. **Environment** — Include OS, Node version, browser
4. **Screenshots** — For UI issues
5. **Error logs** — Include full error messages

Example:
```
Title: LanguageToggle fails when used outside LanguageProvider

Steps to reproduce:
1. Import LanguageToggle
2. Render without LanguageProvider
3. See error in console

Expected: Component should render or show error boundary
Actual: Uncaught error in React

Environment:
- macOS 13.5
- Node 22.3.0
- Chrome DevTools
```

## Merging PRs

PRs are merged when:
- ✅ All tests pass
- ✅ Code review approved
- ✅ TypeScript strict mode passes
- ✅ No breaking changes (or discussed and documented)

Squash commits for cleaner history:
```bash
git rebase -i HEAD~3
# Mark commits as "squash" except first
# Rewrite commit message
git push -f origin feature/my-feature
```

## Questions?

- Open a [GitHub Discussion](https://github.com/openclaw/openclaw-easy-installer-electron/discussions)
- Check existing [Issues](https://github.com/openclaw/openclaw-easy-installer-electron/issues)
- Read the main [README.md](README.md)

Thank you for contributing! 🎉
