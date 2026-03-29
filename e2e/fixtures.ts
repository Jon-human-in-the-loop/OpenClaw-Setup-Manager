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
      try { ipcMain.removeHandler('system:check') } catch (_) {}
      try { ipcMain.removeHandler('state:read') } catch (_) {}
      try { ipcMain.removeHandler('control:status') } catch (_) {}
      try { ipcMain.removeHandler('session:loadActive') } catch (_) {}
      try { ipcMain.removeHandler('state:write') } catch (_) {}

      ipcMain.handle('system:check', async () => mock)
      ipcMain.handle('state:read', async () => ({ installed: false }))
      ipcMain.handle('control:status', async () => ({ state: 'not-found' }))
      ipcMain.handle('session:loadActive', async () => null)
      ipcMain.handle('state:write', async () => ({ success: true }))
    }, systemCheckMock)

    await window.waitForTimeout(1000)

    // Force English language for consistent testing
    await window.evaluate(() => {
      localStorage.setItem('openclaw-installer-lang', 'en');
    });
    // Reload to ensure context picks up the change if it already initialized
    await window.reload();
    await window.waitForLoadState('domcontentloaded');

    await use(window)
  },
})

export { expect }
