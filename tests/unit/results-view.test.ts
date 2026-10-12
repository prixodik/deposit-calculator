import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSchedule } from '../../src/core'
import type { DepositParams } from '../../src/core'
import AnimatedAmount from '../../src/components/AnimatedAmount.vue'
import ResultsView from '../../src/components/ResultsView.vue'
import ScheduleTable from '../../src/components/ScheduleTable.vue'
import SummaryCards from '../../src/components/SummaryCards.vue'

const вклад = (p: Partial<DepositParams> = {}) =>
  buildSchedule({
    amount: '100000.00',
    rate: 12,
    months: 12,
    startDate: '2026-01-15',
    frequency: 'monthly',
    capitalize: false,
    ...p,
  })

const текст = (w: { text(): string }) => w.text().replace(/ /g, ' ')

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => vi.unstubAllGlobals())

describe('Итоговые карточки', () => {
  it('Доход при капитализации', () => {
    const w = mount(SummaryCards, { props: { totals: вклад({ capitalize: true }).totals } })
    expect(текст(w.get('[data-card="income"]'))).toContain('12 682,51 ₽')
    expect(текст(w.get('[data-card="paid"]'))).toContain('0,00 ₽')
    expect(текст(w.get('[data-card="balance"]'))).toContain('112 682,51 ₽')
    expect(текст(w.get('[data-card="accrued"]'))).toContain('12 682,51 ₽')
  })

  it('Итоги озвучиваются через вежливую область', () => {
    const w = mount(SummaryCards, { props: { totals: вклад({ capitalize: true }).totals } })
    const live = w.get('[aria-live="polite"]')
    expect(текст(live)).toContain('112 682,51 ₽')
  })
})

describe('Анимация чисел', () => {
  it('Уменьшение движения: значение меняется мгновенно', async () => {
    const w = mount(AnimatedAmount, { props: { value: '1000.00' } })
    expect(текст(w)).toBe('1 000,00 ₽')
    await w.setProps({ value: '2500.50' })
    expect(текст(w)).toBe('2 500,50 ₽')
  })
})

describe('Таблица графика выплат', () => {
  it('Строка «Итого»', () => {
    const w = mount(ScheduleTable, { props: { schedule: вклад() } })
    expect(w.findAll('tbody tr')).toHaveLength(12)
    const итого = текст(w.get('tfoot'))
    expect(итого).toContain('Итого')
    expect(итого.match(/12 000,00 ₽/g)).toHaveLength(2)
  })

  it('Узкий экран: таблица прокручивается внутри своей области, доступной с клавиатуры', () => {
    const w = mount(ScheduleTable, { props: { schedule: вклад() } })
    const область = w.get('.schedule-table__scroll')
    expect(область.attributes('role')).toBe('region')
    expect(область.attributes('tabindex')).toBe('0')
    expect(область.attributes('aria-label')).toBeTruthy()
    expect(w.findAll('thead th').every((th) => th.attributes('scope') === 'col')).toBe(true)
  })
})

describe('Результаты', () => {
  const заглушки = { global: { stubs: { GrowthChart: true } } }

  it('Неактуальный результат', () => {
    const w = mount(ResultsView, { props: { schedule: вклад(), stale: true }, ...заглушки })
    expect(текст(w)).toContain('Результат устарел: исправьте ошибки в форме')
  })

  it('Актуальный результат без пометки', () => {
    const w = mount(ResultsView, { props: { schedule: вклад(), stale: false }, ...заглушки })
    expect(текст(w)).not.toContain('Результат устарел')
  })

  it('Пустое состояние без «NaN» и «undefined»', () => {
    const w = mount(ResultsView, { props: { schedule: null, stale: false }, ...заглушки })
    expect(текст(w)).toContain('Введите параметры вклада')
    expect(текст(w)).not.toMatch(/NaN|undefined|null/)
  })

  it('Скачивание: нажатие создаёт файл CSV со всеми строками', async () => {
    let файл: Blob | undefined
    vi.stubGlobal('URL', {
      createObjectURL: (b: Blob) => ((файл = b), 'blob:test'),
      revokeObjectURL: () => {},
    })
    const w = mount(ResultsView, { props: { schedule: вклад(), stale: false }, ...заглушки })
    await w.get('[data-action="download-csv"]').trigger('click')
    await flushPromises()
    expect(файл).toBeInstanceOf(Blob)
    const содержимое = await new Promise<string>((resolve) => {
      const чтение = new FileReader()
      чтение.onload = () => resolve(String(чтение.result))
      чтение.readAsText(файл as Blob)
    })
    expect(содержимое.split('\r\n').filter(Boolean)).toHaveLength(13)
    expect(содержимое).toContain('1000,00')
  })

  it('Все числа в результатах отформатированы', () => {
    const w = mount(ResultsView, { props: { schedule: вклад({ capitalize: true }), stale: false }, ...заглушки })
    expect(текст(w)).not.toMatch(/NaN|undefined|(?<![.\d])\d+\.\d{2}(?![.\d])/)
  })
})
