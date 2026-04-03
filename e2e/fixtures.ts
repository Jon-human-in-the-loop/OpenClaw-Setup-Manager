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
    const context = window.context()

    // Force English language for consistent testing BEFORE the app loads
    await context.addInitScript(() => {
      localStorage.setItem('openclaw-installer-lang', 'en');
    });

    // Mock system:check and other APIs
    await electronApp.evaluate(({ ipcMain }, mock) => {
      const handlers = ['system:check', 'state:read', 'control:status', 'session:loadActive', 'state:write'];
      handlers.forEach(h => { try { ipcMain.removeHandler(h) } catch (_) {} });

      ipcMain.handle('system:check', async () => mock)
      ipcMain.handle('state:read', async () => ({ installed: false, version: '0.0.0' }))
      ipcMain.handle('control:status', async () => ({ state: 'not-found' }))
      ipcMain.handle('session:loadActive', async () => null)
      ipcMain.handle('state:write', async () => ({ success: true }))
    }, systemCheckMock)

    await window.waitForLoadState('domcontentloaded')
    await use(window)
  },
})

export { expect }
