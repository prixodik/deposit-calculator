import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

// В облачной среде браузер уже установлен и скачивать его не нужно.
const встроенныйБраузер = '/opt/pw-browsers/chromium'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: existsSync(встроенныйБраузер) ? { executablePath: встроенныйБраузер } : {},
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
