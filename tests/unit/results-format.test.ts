import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { buildSchedule } from '../../src/core'
import type { DepositParams } from '../../src/core'
import { formatDate, formatRub } from '../../src/format/money'
import { buildCsv } from '../../src/format/csv'
import { chartPoints, describeChart } from '../../src/format/chart'

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

describe('Формат сумм и дат', () => {
  it('Формат сумм', () => {
    expect(formatRub('112682.51')).toBe('112 682,51 ₽')
    expect(formatRub(new Decimal('1000000'))).toBe('1 000 000,00 ₽')
    expect(formatRub('0')).toBe('0,00 ₽')
    expect(formatRub('999.9')).toBe('999,90 ₽')
  })

  it('Даты в российском формате', () => {
    expect(formatDate('2026-02-15')).toBe('15.02.2026')
  })
})

describe('Выгрузка в CSV', () => {
  const текст = buildCsv(вклад())
  const строки = текст.replace(/^﻿/, '').split('\r\n').filter(Boolean)

  it('Скачивание: признак порядка байтов, заголовок и 12 строк', () => {
    expect(текст.startsWith('﻿')).toBe(true)
    expect(строки).toHaveLength(13)
    expect(строки[0]).toBe(
      '№;Дата начала;Дата окончания;Месяцев;Остаток на начало;Начислено;Капитализировано;Выплачено;Остаток на конец',
    )
  })

  it('Разделитель «;», запятая в числах', () => {
    expect(строки[1]).toBe('1;15.01.2026;15.02.2026;1;100000,00;1000,00;0,00;1000,00;100000,00')
  })

  it('Сумма столбца начисленных процентов равна 12000,00', () => {
    const сумма = строки.slice(1).reduce((a, s) => a.plus(s.split(';')[5]!.replace(',', '.')), new Decimal(0))
    expect(сумма.toFixed(2)).toBe('12000.00')
  })
})

describe('Данные графика роста остатка', () => {
  it('Подсказка точки: дата и значения последней точки при капитализации', () => {
    const точки = chartPoints(вклад({ capitalize: true }), '100000.00')
    expect(точки).toHaveLength(13)
    expect(точки[0]).toMatchObject({ date: '2026-01-15', balance: '100000.00', paid: '0.00' })
    expect(точки.at(-1)).toMatchObject({ date: '2027-01-15', balance: '112682.51', paid: '0.00' })
  })

  it('Вклад без капитализации: остаток постоянен, выплаты растут', () => {
    const точки = chartPoints(вклад(), '100000.00')
    expect(new Set(точки.map((t) => t.balance))).toEqual(new Set(['100000.00']))
    expect(точки.at(-1)!.paid).toBe('12000.00')
    expect(точки[2]!.paid).toBe('2000.00')
  })

  it('Текстовая сводка для вспомогательных технологий', () => {
    const сводка = describeChart(вклад({ capitalize: true }), '100000.00')
    expect(сводка).toContain('100 000,00 ₽')
    expect(сводка).toContain('112 682,51 ₽')
    expect(сводка).toContain('12 мес')
  })
})
