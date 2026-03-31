import { _electron as electron, test as base } from '@playwright/test'
import path from 'path'

export const test = base.extend({
  electronApp: async ({}, use) => {
    const appPath = path.join(__dirname, '..')
    const electronApp = await electron.launch({
      args: [appPath, '--no-sandbox', '--disable-setuid-sandbox'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    })

    await use(electronApp)

    await electronApp.close()
  },
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow()
    // Esperar a que la app cargue si es necesario
    await page.waitForLoadState('domcontentloaded')
    await use(page)
  },
})

export { expect } from '@playwright/test'
