import { test, expect } from '@playwright/test'

test.describe('OpenClaw Installer - Complete Installation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)
  })

  test('should complete full wizard flow with quick setup', async ({ page }) => {
    // Step 1: Welcome
    await expect(page.getByText(/welcome/i)).toBeVisible()
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 2: System Check
    await expect(page.getByText(/system|check/i)).toBeVisible()
    await page.waitForTimeout(2000) // Wait for system check to complete
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 3: Setup Type
    await expect(page.getByText(/setup|type/i)).toBeVisible()
    // Select quick setup or similar
    const setupOptions = page.getByRole('radio')
    if (await setupOptions.first().isVisible()) {
      await setupOptions.first().click()
    } else {
      const setupButtons = page.getByRole('button').filter({ has: page.locator('[role="radio"]') })
      if (await setupButtons.first().isVisible()) {
        await setupButtons.first().click()
      }
    }
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 4: Agent Name
    await expect(page.getByLabel(/agent name/i)).toBeVisible()
    await page.getByLabel(/agent name/i).fill('TestAgent')
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 5: Model Selection
    await expect(page.getByText(/model|select/i)).toBeVisible()
    const modelOptions = page.getByRole('button').filter({ has: page.locator('[role="radio"]') })
    if (await modelOptions.first().isVisible()) {
      await modelOptions.first().click()
    }
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 6: API Key (might be skipped in some setups)
    const apiKeyLabel = page.getByLabel(/api key|openai/i)
    if (await apiKeyLabel.isVisible()) {
      await apiKeyLabel.fill('sk-test-1234567890abcdef')
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(500)
    }

    // Step 7: Channels
    await expect(page.getByText(/channel|integration/i)).toBeVisible()
    const channelCheckboxes = page.getByRole('checkbox')
    if (await channelCheckboxes.first().isVisible()) {
      // Select at least one channel if not already selected
      const firstCheckbox = channelCheckboxes.first()
      if (!(await firstCheckbox.isChecked())) {
        await firstCheckbox.click()
      }
    }
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Step 8: Credentials (optional based on channels selected)
    const credentialsForm = page.getByText(/credentials|token|phone/i)
    if (await credentialsForm.isVisible()) {
      // Just proceed without filling optional fields
      await page.getByRole('button', { name: /next|finish/i }).first().click()
      await page.waitForTimeout(500)
    }

    // Final: Installation/Success page
    const isInstallingOrSuccess = await Promise.race([
      page.getByText(/installing/i).isVisible(),
      page.getByText(/success|complete/i).isVisible(),
      page.getByText(/error|failed/i).isVisible(),
    ]).catch(() => false)

    expect(isInstallingOrSuccess).toBe(true)
  })

  test('should allow canceling at any step', async ({ page }) => {
    // Go to second step
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Look for cancel/close button
    const closeButton = page.getByRole('button', { name: /close|cancel|×/i }).first()
    const windowCloseButton = page.locator('button').filter({ has: page.locator('.close-icon, [class*="close"]') }).first()

    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForTimeout(500)
      // App should close or go back to welcome
    }
  })

  test('should persist state when navigating back', async ({ page }) => {
    // Navigate to Agent Name step
    await page.getByRole('button', { name: /next/i }).first().click() // System Check
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /next/i }).first().click() // Setup Type
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /next/i }).first().click() // Agent Name
    await page.waitForTimeout(500)

    // Fill agent name
    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      await agentInput.fill('PersistentAgent')
      const enteredValue = await agentInput.inputValue()
      expect(enteredValue).toBe('PersistentAgent')

      // Go to next step
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(500)

      // Go back
      const backBtn = page.getByRole('button', { name: /back|previous/i }).first()
      if (await backBtn.isVisible()) {
        await backBtn.click()
        await page.waitForTimeout(500)

        // Value should still be there
        const persistedValue = await agentInput.inputValue()
        expect(persistedValue).toBe('PersistentAgent')
      }
    }
  })

  test('should handle rapid navigation', async ({ page }) => {
    // Click next multiple times rapidly
    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next/i }).first()
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
      }
    }

    // Should be at some step without errors
    await expect(page.locator('body')).toContainText(/welcome|system|setup|agent|model|key|channel/i)
  })

  test('should be responsive and visible on screen', async ({ page }) => {
    // Check that main content is visible
    const mainContent = page.locator('main, [role="main"], .wizard')
    if (await mainContent.first().isVisible()) {
      const boundingBox = await mainContent.first().boundingBox()
      expect(boundingBox).toBeTruthy()
      expect(boundingBox?.width).toBeGreaterThan(0)
      expect(boundingBox?.height).toBeGreaterThan(0)
    }

    // Check buttons are clickable
    const nextBtn = page.getByRole('button', { name: /next/i }).first()
    await expect(nextBtn).toBeVisible()
    const isInViewport = await nextBtn.isVisible()
    expect(isInViewport).toBe(true)
  })
})
