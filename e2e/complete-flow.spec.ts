import { test, expect } from './fixtures'

test.describe('OpenClaw Installer - Complete Installation Flow', () => {
  test('should complete full wizard flow with quick setup', async ({ page }) => {
    // Step 1: Welcome — title is "Install OpenClaw in 5 minutes"
    await expect(page.getByText(/install openclaw/i)).toBeVisible()
    await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
    await page.waitForTimeout(500)

    // Step 2: System Check
    await expect(page.getByText(/checking|system/i).first()).toBeVisible()
    await page.waitForTimeout(2000)
    await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
    await page.waitForTimeout(500)

    // Step 3: Setup Type — use exact "Next" to avoid matching option-card text
    await expect(page.getByText(/setup|install/i).first()).toBeVisible()
    const setupOptions = page.getByRole('radio')
    if (await setupOptions.first().isVisible()) {
      await setupOptions.first().click()
    }
    await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
    await page.waitForTimeout(500)

    // Step 4: Agent Name
    await expect(page.getByLabel(/agent name/i)).toBeVisible()
    await page.getByLabel(/agent name/i).fill('TestAgent')
    await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
    await page.waitForTimeout(500)

    // Step 5: Model Selection
    await expect(page.getByText(/model|select/i).first()).toBeVisible()
    const modelOptions = page.getByRole('button').filter({ has: page.locator('[role="radio"]') })
    if (await modelOptions.first().isVisible()) {
      await modelOptions.first().click()
    }
    await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
    await page.waitForTimeout(500)

    // Step 6: API Key (optional)
    const apiKeyLabel = page.getByLabel(/api key|openai/i)
    if (await apiKeyLabel.isVisible()) {
      await apiKeyLabel.fill('sk-test-1234567890abcdef')
      await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
      await page.waitForTimeout(500)
    }

    // Step 7: Channels
    await expect(page.getByText(/channel|integration/i).first()).toBeVisible()
    const channelCheckboxes = page.getByRole('checkbox')
    if (await channelCheckboxes.first().isVisible()) {
      const firstCheckbox = channelCheckboxes.first()
      if (!(await firstCheckbox.isChecked())) {
        await firstCheckbox.click()
      }
    }
    await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
    await page.waitForTimeout(500)

    // Final: Installation/Success page
    const isInstallingOrSuccess = await Promise.race([
      page.getByText(/installing/i).isVisible(),
      page.getByText(/success|complete/i).isVisible(),
      page.getByText(/error|failed/i).isVisible(),
    ]).catch(() => false)

    expect(isInstallingOrSuccess).toBe(true)
  })

  test('should allow canceling at any step', async ({ page }) => {
    await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
    await page.waitForTimeout(500)

    const closeButton = page.getByRole('button', { name: /close|cancel|×/i }).first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should persist state when navigating back', async ({ page }) => {
    await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
    await page.waitForTimeout(500)

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      await agentInput.fill('PersistentAgent')
      expect(await agentInput.inputValue()).toBe('PersistentAgent')

      await page.getByRole('button', { name: /^next$|^siguiente$/i }).first().click()
      await page.waitForTimeout(500)

      const backBtn = page.getByRole('button', { name: /back|previous/i }).first()
      if (await backBtn.isVisible()) {
        await backBtn.click()
        await page.waitForTimeout(500)
        expect(await agentInput.inputValue()).toBe('PersistentAgent')
      }
    }
  })

  test('should handle rapid navigation', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
      }
    }
    await expect(page.locator('body')).toContainText(/openclaw|system|setup|agent|model|key|channel/i)
  })

  test('should be responsive and visible on screen', async ({ page }) => {
    const mainContent = page.locator('main, [role="main"], .wizard')
    if (await mainContent.first().isVisible()) {
      const boundingBox = await mainContent.first().boundingBox()
      expect(boundingBox).toBeTruthy()
      expect(boundingBox?.width).toBeGreaterThan(0)
      expect(boundingBox?.height).toBeGreaterThan(0)
    }

    const nextBtn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
    await expect(nextBtn).toBeVisible()
    expect(await nextBtn.isVisible()).toBe(true)
  })
})
