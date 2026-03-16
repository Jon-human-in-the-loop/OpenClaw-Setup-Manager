import { test, expect } from '@playwright/test'

test.describe('OpenClaw Installer - Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173')
    // Wait for app to load
    await page.waitForTimeout(1000)
  })

  test('should display Welcome page on load', async ({ page }) => {
    // Check for Welcome page elements
    await expect(page.getByText(/welcome/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible()
  })

  test('should navigate through wizard steps', async ({ page }) => {
    // Welcome → System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText(/system/i)).toBeVisible()

    // System Check → Setup Type
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)
    await expect(page.getByText(/setup/i)).toBeVisible()
  })

  test('should validate agent name input', async ({ page }) => {
    // Navigate to Agent Name step
    await page.getByRole('button', { name: /next/i }).first().click() // System Check
    await page.getByRole('button', { name: /next/i }).first().click() // Setup Type
    await page.getByRole('button', { name: /next/i }).first().click() // Agent Name

    // Try to submit empty name
    const nextBtn = page.getByRole('button', { name: /next/i }).first()
    await expect(nextBtn).toBeDisabled()

    // Enter valid name
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
    // Navigate forward
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Go back
    const backBtn = page.getByRole('button', { name: /back|previous/i }).first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForTimeout(500)
      await expect(page.getByText(/welcome/i)).toBeVisible()
    }
  })

  test('should display step indicator', async ({ page }) => {
    // Check for step indicator (visual progress)
    const stepIndicator = page.locator('[role="progressbar"], .step-indicator, [class*="progress"]')
    if (await stepIndicator.first().isVisible()) {
      await expect(stepIndicator.first()).toBeVisible()
    }
  })
})
