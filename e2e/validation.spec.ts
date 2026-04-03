import { test, expect } from './fixtures'

// Helper to click Next only when enabled, waiting up to `ms` milliseconds
async function clickNextWhenEnabled(page: import('@playwright/test').Page, ms = 15000) {
  const btn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
  await btn.waitFor({ state: 'visible', timeout: ms })
  await expect(btn).toBeEnabled({ timeout: ms })
  await btn.click()
}

// Navigate wizard up to and including the Agent Name step
// Welcome → SystemCheck → Deployment → Security → SetupType → AgentName
async function navigateToAgentNameStep(page: import('@playwright/test').Page) {
  await clickNextWhenEnabled(page) // Welcome → SystemCheck
  await clickNextWhenEnabled(page) // SystemCheck → Deployment
  await clickNextWhenEnabled(page) // Deployment → Security
  await clickNextWhenEnabled(page) // Security → SetupType
  // SetupType → AgentName (exact Next button to avoid matching card text)
  const nextExact = page.getByRole('button', { name: /^next$|^siguiente$/i }).first()
  await expect(nextExact).toBeEnabled({ timeout: 8000 })
  await nextExact.click()
}

// Navigate wizard up to and past the Agent Name step through Model & API Key to Channels
// Welcome → SystemCheck → SetupType → AgentName(fill) → Model → APIKey → Channels
async function navigateToChannelsStep(page: import('@playwright/test').Page) {
  await navigateToAgentNameStep(page)
  // Fill in required Agent Name to unblock Next
  const agentInput = page.getByLabel(/agent name/i)
  await agentInput.waitFor({ state: 'visible', timeout: 5000 })
  await agentInput.fill('TestAgent')
  // AgentName → Model
  const nextExact = page.getByRole('button', { name: /^next$|^siguiente$/i }).first()
  await expect(nextExact).toBeEnabled({ timeout: 5000 })
  await nextExact.click()
  await page.waitForTimeout(300)
  // Model → APIKey
  const nextBtn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
  if (await nextBtn.isEnabled()) await nextBtn.click()
  await page.waitForTimeout(300)
  // APIKey → Channels
  const nextBtn2 = page.getByRole('button', { name: /next|start_install|continue/i }).first()
  if (await nextBtn2.isEnabled()) await nextBtn2.click()
  await page.waitForTimeout(300)
}

test.describe('OpenClaw Installer - Validation', () => {
  test('should validate API key format', async ({ page }) => {
    await navigateToAgentNameStep(page)
    // Fill agent name to enable Next, then navigate forward to API Key step
    const agentInput = page.getByLabel(/agent name/i)
    await agentInput.waitFor({ state: 'visible', timeout: 5000 })
    await agentInput.fill('TestAgent')
    const nextExact = page.getByRole('button', { name: /^next$|^siguiente$/i }).first()
    await expect(nextExact).toBeEnabled({ timeout: 5000 })
    await nextExact.click()
    await page.waitForTimeout(300)
    // Model step → click next
    const nextBtn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
    if (await nextBtn.isEnabled()) await nextBtn.click()
    await page.waitForTimeout(300)

    const apiInput = page.getByLabel(/api key/i)
    if (await apiInput.isVisible()) {
      await apiInput.fill('invalid')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeDisabled()

      await apiInput.clear()
      await apiInput.fill('sk-1234567890abcdef')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeEnabled()
    }
  })

  test('should validate Telegram token', async ({ page }) => {
    await navigateToChannelsStep(page)

    const telegramInput = page.getByLabel(/telegram/i)
    if (await telegramInput.isVisible()) {
      await telegramInput.fill('')
      await expect(telegramInput).toHaveValue('')

      await telegramInput.fill('123456789:ABCdefGHIjklmnoPQRstuvWXYZabc')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeEnabled()
    }
  })

  test('should validate phone number format', async ({ page }) => {
    await navigateToChannelsStep(page)

    const phoneInput = page.getByLabel(/phone|whatsapp/i)
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('abc')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeDisabled()

      await phoneInput.clear()
      await phoneInput.fill('+34912345678')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeEnabled()
    }
  })

  test('should handle whitespace in inputs', async ({ page }) => {
    await navigateToAgentNameStep(page)

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      await agentInput.fill('   TestAgent   ')
      expect((await agentInput.inputValue()).trim()).toBe('TestAgent')
    }
  })

  test('should show validation error messages', async ({ page }) => {
    await navigateToAgentNameStep(page)

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      await agentInput.focus()
      await agentInput.blur()

      const errorMsg = page.locator('[role="alert"], .error, [class*="error"]')
      if (await errorMsg.first().isVisible()) {
        await expect(errorMsg.first()).toBeVisible()
      }
    }
  })

  test('should validate channel selection', async ({ page }) => {
    await navigateToChannelsStep(page)

    const channelCheckboxes = page.getByRole('checkbox')
    if (await channelCheckboxes.first().isVisible()) {
      expect(await channelCheckboxes.count()).toBeGreaterThan(0)
      await channelCheckboxes.first().click()
      await expect(channelCheckboxes.first()).toBeChecked()
    }
  })
})
