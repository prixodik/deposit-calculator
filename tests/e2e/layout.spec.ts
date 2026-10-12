import { expect, test } from '@playwright/test'

for (const ширина of [360, 768, 1280]) {
  test.describe(`Ширина ${ширина}`, () => {
    test.use({ viewport: { width: ширина, height: 800 } })

    test(`Телефон и планшет: нет горизонтальной прокрутки (${ширина})`, async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-card="balance"]')).toBeVisible()
      const лишнее = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(лишнее).toBe(0)
    })

    test(`Область нажатия не меньше 44 × 44 пикселей (${ширина})`, async ({ page }) => {
      await page.goto('/')
      const малые = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('button, input:not([type="checkbox"]), select, [role="switch"]')]
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && (r.width < 44 || r.height < 44))
          .map(({ el, r }) => `${el.tagName} ${el.id || el.className} ${Math.round(r.width)}×${Math.round(r.height)}`),
      )
      expect(малые).toEqual([])
    })
  })
}

test.describe('Раскладка', () => {
  test('Телефон: форма стоит над результатом', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/')
    const форма = await page.locator('.app__form').boundingBox()
    const итоги = await page.locator('.app__results').boundingBox()
    expect(форма!.y + форма!.height).toBeLessThanOrEqual(итоги!.y + 1)
  })

  test('Компьютер: форма и итоги видны одновременно на первом экране', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.locator('#deposit-amount')).toBeInViewport()
    await expect(page.locator('[data-card="balance"]')).toBeInViewport()
  })
})
