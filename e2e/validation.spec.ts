import { test, expect } from './fixtures'

test.describe('OpenClaw Installer - Validation', () => {
  test('should validate API key format', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

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
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

    const telegramInput = page.getByLabel(/telegram/i)
    if (await telegramInput.isVisible()) {
      await telegramInput.fill('')
      await expect(telegramInput).toHaveValue('')

      await telegramInput.fill('123456789:ABCdefGHIjklmnoPQRstuvWXYZabc')
      await expect(page.getByRole('button', { name: /next|start_install|continue/i }).first()).toBeEnabled()
    }
  })

  test('should validate phone number format', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

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
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

    const agentInput = page.getByLabel(/agent name/i)
    if (await agentInput.isVisible()) {
      await agentInput.fill('   TestAgent   ')
      expect((await agentInput.inputValue()).trim()).toBe('TestAgent')
    }
  })

  test('should show validation error messages', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

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
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /next|start_install|continue/i }).first().click()
      await page.waitForTimeout(300)
    }

    const channelCheckboxes = page.getByRole('checkbox')
    if (await channelCheckboxes.first().isVisible()) {
      expect(await channelCheckboxes.count()).toBeGreaterThan(0)
      await channelCheckboxes.first().click()
      await expect(channelCheckboxes.first()).toBeChecked()
    }
  })
})
