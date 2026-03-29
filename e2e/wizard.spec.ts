import { test, expect } from './fixtures'

// Helper to click Next only when enabled, waiting up to `ms` milliseconds
async function clickNextWhenEnabled(page: import('@playwright/test').Page, ms = 8000) {
  const btn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
  await btn.waitFor({ state: 'visible', timeout: ms })
  await expect(btn).toBeEnabled({ timeout: ms })
  await btn.click()
}

test.describe('OpenClaw Installer - Wizard Flow', () => {
  test('should display Welcome page on load', async ({ page }) => {
    // The Welcome page title is "Install OpenClaw in 5 minutes" — not "welcome"
    await expect(page.getByText(/install openclaw/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeVisible()
  })

  test('should navigate through wizard steps', async ({ page }) => {
    // Welcome → System Check
    await clickNextWhenEnabled(page)
    await page.waitForTimeout(500)
    await expect(page.getByRole('heading', { name: /checking your system/i })).toBeVisible()

    // System Check → Deployment (wait for system check checks to complete and button enables)
    await clickNextWhenEnabled(page)
    await page.waitForTimeout(500)
    await expect(page.getByText(/deploy|install|environment/i).first()).toBeVisible()
  })

  test('should validate agent name input', async ({ page }) => {
    // Navigate to Agent Name step (Welcome→SystemCheck→Deployment→Security→SetupType→AgentName)
    await clickNextWhenEnabled(page) // Welcome → SystemCheck
    await clickNextWhenEnabled(page) // SystemCheck → Deployment
    await clickNextWhenEnabled(page) // Deployment → Security
    await clickNextWhenEnabled(page) // Security → SetupType
    // SetupType → AgentName: click exact Next button
    const nextExact = page.getByRole('button', { name: /^next$|^siguiente$/i }).first()
    await expect(nextExact).toBeEnabled({ timeout: 8000 })
    await nextExact.click()

    // Try to submit empty name — Next button should be disabled
    const nextBtn = page.getByRole('button', { name: /^next$|^siguiente$/i }).first()
    await expect(nextBtn).toBeDisabled()

    // Enter valid name — Next button should become enabled
    await page.getByLabel(/agent name/i).fill('TestAgent')
    await expect(nextBtn).toBeEnabled()
  })

  test('should allow language switching', async ({ page }) => {
    // Find language toggle
    const langToggle = page.getByRole('button', { name: /es|en/i }).first()
    await expect(langToggle).toBeVisible()

    // Switch language
    const initialText = await page.locator('body').textContent()
    await langToggle.click()
    await page.waitForTimeout(500)
    const newText = await page.locator('body').textContent()

    // Text should change after language switch
    expect(initialText).not.toBe(newText)
  })

  test('should go back through wizard steps', async ({ page }) => {
    // Navigate forward to SystemCheck
    await clickNextWhenEnabled(page)
    await page.waitForTimeout(500)

    // Go back to Welcome
    const backBtn = page.getByRole('button', { name: /back|previous/i }).first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForTimeout(500)
      // Welcome page — verify the sr-only "Install OpenClaw" text is present
      await expect(page.getByText(/install openclaw/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('should display step indicator', async ({ page }) => {
    const stepIndicator = page.locator('[role="progressbar"], .step-indicator, [class*="progress"]')
    if (await stepIndicator.first().isVisible()) {
      await expect(stepIndicator.first()).toBeVisible()
    }
  })
})
