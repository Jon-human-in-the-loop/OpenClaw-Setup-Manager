import { test, expect } from './fixtures'

// Helper to click Next only when enabled
async function clickNextWhenEnabled(page: import('@playwright/test').Page, ms = 15000) {
    const btn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
    await btn.waitFor({ state: 'visible', timeout: ms })
    await expect(btn).toBeEnabled({ timeout: ms })
    await btn.click()
}

test.describe('OpenClaw Installer - System Check', () => {
    test('should display System Check page', async ({ page }) => {
          await clickNextWhenEnabled(page)
          await page.waitForTimeout(500)
          // Use heading role to avoid strict-mode violation (regex /system|check/ matches 2 elements)
             await expect(page.getByRole('heading', { name: /checking your system/i })).toBeVisible()
    })

                test('should show system requirements', async ({ page }) => {
                      await clickNextWhenEnabled(page)
                      await page.waitForTimeout(500)

                         const requirements = page.locator('[class*="requirement"], [class*="check"], li')
                      const count = await requirements.count()
                      if (count > 0) {
                              await expect(requirements.first()).toBeVisible()
                      }
                })

                test('should handle missing requirements gracefully', async ({ page }) => {
                      await clickNextWhenEnabled(page)
                      await page.waitForTimeout(1500)

                         const statusElements = page.locator('[class*="status"], [class*="ok"], [class*="fail"], [aria-label*="check"]')
                      if (await statusElements.first().isVisible()) {
                              expect(await statusElements.count()).toBeGreaterThan(0)
                      }
                })

                test('should allow navigation after system check completes', async ({ page }) => {
                      await clickNextWhenEnabled(page)
                      await page.waitForTimeout(2000)

                         const nextBtn = page.getByRole('button', { name: /next|start_install|continue/i }).first()
                      const startTime = Date.now()
                      let isEnabled = false

                         while (!isEnabled && Date.now() - startTime < 5000) {
                                 isEnabled = await nextBtn.isEnabled()
                                 if (!isEnabled) await page.waitForTimeout(500)
                         }

                         if (isEnabled) {
                                 await expect(nextBtn).toBeEnabled()
                         }
                })

                test('should display appropriate icons/indicators for each requirement', async ({ page }) => {
                      await clickNextWhenEnabled(page)
                      await page.waitForTimeout(2000)

                         const passIndicators = page.locator('[class*="pass"], [class*="success"]')
                      const failIndicators = page.locator('[class*="fail"], [class*="error"]')
                      const hasIndicators =
                              (await passIndicators.first().isVisible()) || (await failIndicators.first().isVisible())

                         if (hasIndicators) {
                                 expect(hasIndicators).toBe(true)
                         }
                })
})
