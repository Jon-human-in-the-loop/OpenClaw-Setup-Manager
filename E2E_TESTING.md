# E2E Testing with Playwright

This document explains how to run and write E2E tests for the OpenClaw Easy Installer.

## Installation

E2E tests use **Playwright** for browser automation. It's already installed as a dev dependency.

```bash
pnpm add -D @playwright/test  # Already done
```

## Running Tests

### Run all E2E tests
```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Debug tests step-by-step
```bash
pnpm test:e2e:debug
```

### Run specific test file
```bash
pnpm test:e2e -- e2e/wizard.spec.ts
```

### Run tests matching pattern
```bash
pnpm test:e2e -- --grep "should display Welcome"
```

## Test Files

Located in `/e2e/` directory:

### 1. **wizard.spec.ts**
Tests main wizard flow and navigation:
- ✅ Welcome page loads
- ✅ Navigate through steps
- ✅ Go back through steps
- ✅ Language switching
- ✅ Step indicator visibility

### 2. **validation.spec.ts**
Tests form validation:
- ✅ Agent name validation
- ✅ API key format validation
- ✅ Telegram token validation
- ✅ Phone number validation
- ✅ Whitespace handling
- ✅ Error messages
- ✅ Channel selection

### 3. **system-check.spec.ts**
Tests system requirements check:
- ✅ System Check page displays
- ✅ Requirements are shown
- ✅ Status indicators appear
- ✅ Navigation works after check

## Configuration

Playwright config: `playwright.config.ts`

Key settings:
- **Workers**: 1 (sequential for Electron stability)
- **Browsers**: Chromium, Firefox
- **Screenshots/Video**: Captured on failure
- **Timeout**: 30s per test
- **Web Server**: Auto-starts dev server on port 5173

## Writing New Tests

### Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /next/i }).click()

    // Act
    await page.waitForTimeout(500)

    // Assert
    await expect(page.getByText(/expected/i)).toBeVisible()
  })
})
```

### Best Practices

1. **Use role selectors** — More resilient to DOM changes
   ```typescript
   page.getByRole('button', { name: /submit/i })
   page.getByLabel(/agent name/i)
   ```

2. **Add waits** — Wait for async operations
   ```typescript
   await page.waitForTimeout(500)  // Short wait
   await page.waitForSelector('[data-loaded]')  // Wait for element
   ```

3. **Test user flows** — Not implementation details
   ```typescript
   // ✅ Good: Test user journey
   await page.getByRole('button', { name: /next/i }).click()

   // ❌ Avoid: Testing internals
   await page.evaluate(() => state.goNext())
   ```

4. **Clear test names** — Describe what's being tested
   ```typescript
   // ✅ Good
   test('should validate API key format')

   // ❌ Avoid
   test('test api')
   ```

## Debugging

### View test report
After running tests, view HTML report:
```bash
npx playwright show-report
```

### Screenshot mode
Tests auto-capture screenshots on failure in `test-results/` directory.

### Headed browser mode
Run in visible browser:
```bash
pnpm test:e2e -- --headed
```

### Trace viewer
View full trace of test execution:
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests can run in CI pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests timeout
- Increase `timeout` in `playwright.config.ts`
- Check if dev server is running properly
- Add more `waitForTimeout()` calls

### Selectors don't find elements
- Use `--headed` mode to see what's happening
- Check browser console for errors
- Use `test:e2e:debug` to step through manually

### Port 5173 already in use
- Kill process: `lsof -i :5173 | grep -v PID | awk '{print $2}' | xargs kill`
- Or change port in `playwright.config.ts`

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-page)
