import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const тема of ['light', 'dark'] as const) {
  for (const ширина of [360, 768, 1280]) {
    test(`Автоматическая проверка доступности: тема ${тема}, ширина ${ширина}`, async ({ browser }) => {
      const контекст = await browser.newContext({ colorScheme: тема, viewport: { width: ширина, height: 900 } })
      const page = await контекст.newPage()
      await page.goto('/')
      await expect(page.locator('[data-card="balance"]')).toBeVisible()
      await page.locator('canvas').waitFor()
      const итог = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      const тяжёлые = итог.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(тяжёлые.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
      await контекст.close()
    })
  }
}
