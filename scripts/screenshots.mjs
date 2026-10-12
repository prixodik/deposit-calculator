// Снимает скриншоты приложения (3 ширины × 2 темы) в docs/screens.
// Запуск: сначала `npm run build`, затем `npm run docs:screens`.
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const встроенныйБраузер = '/opt/pw-browsers/chromium'
const папка = 'docs/screens'
mkdirSync(папка, { recursive: true })

const сервер = await preview({ preview: { port: 4174, strictPort: true } })
const браузер = await chromium.launch(existsSync(встроенныйБраузер) ? { executablePath: встроенныйБраузер } : {})
try {
  for (const тема of ['light', 'dark']) {
    for (const ширина of [360, 768, 1280]) {
      const контекст = await браузер.newContext({ viewport: { width: ширина, height: 900 }, colorScheme: тема })
      const страница = await контекст.newPage()
      await страница.goto('http://localhost:4174/')
      await страница.locator('canvas').waitFor()
      await страница.waitForTimeout(800)
      await страница.screenshot({ path: `${папка}/${тема}-${ширина}.png`, fullPage: true })
      await контекст.close()
    }
  }
} finally {
  await браузер.close()
  await сервер.close()
}
