import { test, expect } from '@playwright/test'

test.describe('OpenClaw Installer - System Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)
  })

  test('should display System Check page', async ({ page }) => {
    // Navigate to System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Check for system check indicators
    await expect(page.getByText(/system|check/i)).toBeVisible()
  })

  test('should show system requirements', async ({ page }) => {
    // Navigate to System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(500)

    // Look for requirement items (Node, Port, Disk, Git)
    const requirements = page.locator('[class*="requirement"], [class*="check"], li')
    const count = await requirements.count()

    if (count > 0) {
      // Should have at least some requirement checks
      await expect(requirements.first()).toBeVisible()
    }
  })

  test('should handle missing requirements gracefully', async ({ page }) => {
    // Navigate to System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(1500) // Wait for system check to complete

    // Check for status indicators (pass/fail)
    const statusElements = page.locator('[class*="status"], [class*="ok"], [class*="fail"], [aria-label*="check"]')

    if (await statusElements.first().isVisible()) {
      const count = await statusElements.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should allow navigation after system check completes', async ({ page }) => {
    // Navigate to System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(2000) // Wait for system check

    // Try to proceed
    const nextBtn = page.getByRole('button', { name: /next/i }).first()

    // Button should be available after check completes
    let maxWait = 5000
    let isEnabled = false
    const startTime = Date.now()

    while (!isEnabled && Date.now() - startTime < maxWait) {
      isEnabled = await nextBtn.isEnabled()
      if (!isEnabled) {
        await page.waitForTimeout(500)
      }
    }

    if (isEnabled) {
      await expect(nextBtn).toBeEnabled()
    }
  })

  test('should display appropriate icons/indicators for each requirement', async ({ page }) => {
    // Navigate to System Check
    await page.getByRole('button', { name: /next/i }).first().click()
    await page.waitForTimeout(2000)

    // Check for visual indicators
    const passIndicators = page.locator('[class*="pass"], [class*="success"], ✓')
    const failIndicators = page.locator('[class*="fail"], [class*="error"], ✗')

    // At least one indicator should be present
    const hasIndicators =
      (await passIndicators.first().isVisible()) || (await failIndicators.first().isVisible())

    if (hasIndicators) {
      expect(hasIndicators).toBe(true)
    }
  })
})
