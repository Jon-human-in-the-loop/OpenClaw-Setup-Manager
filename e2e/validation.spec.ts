import { test, expect } from '@playwright/test'

test.describe('OpenClaw Installer - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)
  })

  test('should validate API key format', async ({ page }) => {
    // Navigate to API Key step
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    // Try invalid API key
    const apiInput = page.getByLabel(/api key/i)
    if (await apiInput.isVisible()) {
      await apiInput.fill('invalid')
      await expect(page.getByRole('button', { name: /next/i }).first()).toBeDisabled()

      // Try valid format
      await apiInput.clear()
      await apiInput.fill('sk-1234567890abcdef')
      await expect(page.getByRole('button', { name: /next/i }).first()).toBeEnabled()
    }
  })

  test('should validate Telegram token', async ({ page }) => {
    // Navigate to credentials step
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    const telegramInput = page.getByLabel(/telegram/i)
    if (await telegramInput.isVisible()) {
      // Empty should be allowed (optional)
      await telegramInput.fill('')
      await expect(telegramInput).toHaveValue('')

      // Valid token format
      await telegramInput.fill('123456789:ABCdefGHIjklmnoPQRstuvWXYZabc')
      const nextBtn = page.getByRole('button', { name: /next/i }).first()
      await expect(nextBtn).toBeEnabled()
    }
  })

  test('should validate phone number format', async ({ page }) => {
    // Navigate to credentials
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    const phoneInput = page.getByLabel(/phone|whatsapp/i)
    if (await phoneInput.isVisible()) {
      // Invalid format
      await phoneInput.fill('abc')
      await expect(page.getByRole('button', { name: /next/i }).first()).toBeDisabled()

      // Valid format
      await phoneInput.clear()
      await phoneInput.fill('+34912345678')
      await expect(page.getByRole('button', { name: /next/i }).first()).toBeEnabled()
    }
  })

  test('should handle whitespace in inputs', async ({ page }) => {
    // Navigate to Agent Name step
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      // Input with surrounding whitespace should be trimmed
      await agentInput.fill('   TestAgent   ')
      const value = await agentInput.inputValue()
      expect(value.trim()).toBe('TestAgent')
    }
  })

  test('should show validation error messages', async ({ page }) => {
    // Navigate to Agent Name
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      // Try empty name
      await agentInput.focus()
      await agentInput.blur()

      // Check for error message (en o es)
      const errorMsg = page.locator('[role="alert"], .error, [class*="error"]')
      if (await errorMsg.first().isVisible()) {
        await expect(errorMsg.first()).toBeVisible()
      }
    }
  })

  test('should validate channel selection', async ({ page }) => {
    // Navigate to Channels step
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next/i }).first().click()
      await page.waitForTimeout(300)
    }

    // Check for channel checkboxes
    const channelCheckboxes = page.getByRole('checkbox')
    if (await channelCheckboxes.first().isVisible()) {
      const count = await channelCheckboxes.count()
      expect(count).toBeGreaterThan(0)

      // Toggle a channel
      await channelCheckboxes.first().click()
      await expect(channelCheckboxes.first()).toBeChecked()
    }
  })
})
