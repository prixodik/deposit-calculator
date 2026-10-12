import { expect, test } from '@playwright/test'

test('Проход клавишей Tab: фокус проходит по элементам в логичном порядке и всегда виден', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const порядок: string[] = []
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab')
    const состояние = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const s = getComputedStyle(el)
      return {
        имя: el.id || el.getAttribute('data-quick') || el.getAttribute('data-unit') || el.className,
        виден: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
      }
    })
    expect(состояние.виден, `фокус не виден у «${состояние.имя}»`).toBe(true)
    порядок.push(состояние.имя)
  }
  const место = (id: string) => порядок.indexOf(id)
  expect(место('deposit-amount')).toBeGreaterThanOrEqual(0)
  expect(место('deposit-amount')).toBeLessThan(место('deposit-rate'))
  expect(место('deposit-rate')).toBeLessThan(место('deposit-term'))
  expect(место('deposit-term')).toBeLessThan(место('deposit-start'))
  expect(место('deposit-start')).toBeLessThan(место('deposit-frequency'))
  expect(место('deposit-frequency')).toBeLessThan(место('deposit-capitalize'))
})

test('Системная тёмная тема', async ({ browser }) => {
  const контекст = await browser.newContext({ colorScheme: 'dark' })
  const page = await контекст.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await контекст.close()
})

test('Ручной выбор: тема сохраняется после перезагрузки', async ({ browser }) => {
  const контекст = await browser.newContext({ colorScheme: 'light' })
  const page = await контекст.newPage()
  await page.goto('/')
  await page.getByRole('button', { name: 'Включить тёмную тему' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await контекст.close()
})

test('Уменьшение движения: итоги обновляются мгновенно', async ({ browser }) => {
  const контекст = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await контекст.newPage()
  await page.goto('/')
  await page.locator('#deposit-amount').fill('100000')
  await page.locator('#deposit-rate').fill('12')
  const карточка = page.locator('[data-card="balance"] .animated-amount')
  // Ждём ровно одного обновления без ожидания анимации (400 мс): значение должно стать итоговым сразу.
  await expect(карточка).toHaveText(/112\s682,51\s₽/, { timeout: 250 })
  await контекст.close()
})

test('Расчёт по умолчанию показан и таблица содержит строку «Итого»', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-card="balance"]')).toContainText('₽')
  await expect(page.locator('tfoot')).toContainText('Итого')
})
