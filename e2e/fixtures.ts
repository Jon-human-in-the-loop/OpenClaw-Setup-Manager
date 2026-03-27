import { test as base, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import path from 'path'

type ElectronFixtures = {
  electronApp: ElectronApplication
  page: Page
}

const systemCheckMock = {
  nodeInstalled: true,
  nodeVersion: '20.0.0',
  nodeMeetsRequirement: true,
  nodeMeetsRecommended: true,
  portAvailable: true,
  diskSpaceGB: 50,
  diskSpaceMeetsRequirement: true,
  gitInstalled: true,
  ollamaInstalled: false,
  ollamaVersion: null,
  platform: 'linux',
  arch: 'x64',
  platformCapabilities: {
    os: 'linux',
    arch: 'x64',
    docker: { installed: true, running: true, version: '24.0.0', isNative: true },
    wsl2Available: false,
    availableDeployments: ['local', 'docker'],
    recommendedDeployment: 'docker',
  },
  dockerComposeAvailable: true,
  dockerComposeVersion: '2.20.0',
  ollamaRunning: false,
  dashboardPortAvailable: true,
  internetConnected: true,
  diagnostics: [],
}

export const test = base.extend<ElectronFixtures>({
  electronApp: async ({}, use) => {
    const app = await electron.launch({
      args: [path.join(__dirname, '../out/main/index.js')],
      env: {
        ...process.env,
        ELECTRON_DISABLE_SANDBOX: '1',
        NODE_ENV: 'test',
      },
    })
    await use(app)
    await app.close()
  },

  page: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')

    // Mock system:check AFTER firstWindow() resolves so app.whenReady has already
    // fired and registerSystemHandlers() has already registered its handlers.
    // Calling this before app.whenReady would cause a duplicate-handler crash.
    await electronApp.evaluate(({ ipcMain }, mock) => {
      try { ipcMain.removeHandler('system:check') } catch (_) { /* already removed */ }
      ipcMain.handle('system:check', async () => mock)
    }, systemCheckMock)

    await window.waitForTimeout(1000)
    await use(window)
  },
})

export { expect }
