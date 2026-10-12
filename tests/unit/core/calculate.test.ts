import { describe, expect, it } from 'vitest'
import { calculate } from '../../../src/core/calculate'
import type { DepositParams } from '../../../src/core/types'

const параметры = (p: Partial<DepositParams>): DepositParams => ({
  amount: '100000.00',
  rate: 12,
  months: 12,
  startDate: '2026-01-15',
  frequency: 'monthly',
  capitalize: false,
  ...p,
})

const суммы = (p: Partial<DepositParams>) => {
  const { totals } = calculate(параметры(p))
  return [totals.accrued, totals.paid, totals.closingBalance, totals.income].map((d) => d.toFixed(2))
}

const проценты = (p: Partial<DepositParams>) =>
  calculate(параметры(p)).periods.map((x) => x.interest.toFixed(2))

describe('Простые проценты', () => {
  it('Ежемесячная выплата', () => {
    const { periods } = calculate(параметры({}))
    expect(periods).toHaveLength(12)
    expect(periods.every((x) => x.paid.toFixed(2) === '1000.00')).toBe(true)
    expect(суммы({})).toEqual(['12000.00', '12000.00', '100000.00', '12000.00'])
  })

  it('Выплата в конце срока', () => {
    const p = { amount: '50000.00', rate: 8, months: 6, frequency: 'end_of_term' as const }
    expect(проценты(p)).toEqual(['2000.00'])
  })

  it('Неполный последний квартал', () => {
    const p = { months: 7, frequency: 'quarterly' as const }
    expect(проценты(p)).toEqual(['3000.00', '3000.00', '1000.00'])
    expect(суммы(p)[1]).toBe('7000.00')
  })
})

describe('Сложные проценты', () => {
  it('Вклад под 0 %', () => {
    const р = calculate(параметры({ rate: 0, capitalize: true }))
    expect(р.periods.every((x) => x.interest.isZero())).toBe(true)
    expect(р.totals.closingBalance.toFixed(2)).toBe('100000.00')
  })

  it('Ежемесячная капитализация', () => {
    const p = { capitalize: true }
    expect(проценты(p).slice(0, 3)).toEqual(['1000.00', '1010.00', '1020.10'])
    expect(суммы(p)).toEqual(['12682.51', '0.00', '112682.51', '12682.51'])
  })

  it('Ежеквартальная капитализация', () => {
    const p = { rate: 10, frequency: 'quarterly' as const, capitalize: true }
    expect(проценты(p)).toEqual(['2500.00', '2562.50', '2626.56', '2692.23'])
    expect(суммы(p)[2]).toBe('110381.29')
  })

  it('Ежегодная капитализация', () => {
    const p = { months: 24, frequency: 'yearly' as const, capitalize: true }
    expect(проценты(p)).toEqual(['12000.00', '13440.00'])
    expect(суммы(p)[2]).toBe('125440.00')
  })

  it('Расхождение с замкнутой формулой', () => {
    // 100000 × (1 + 0,12/12)^12 = 112682,50 (округлено), по периодам получается 112682,51
    expect(суммы({ capitalize: true })[2]).toBe('112682.51')
  })
})

describe('Итоговые суммы', () => {
  it('Итоги без капитализации', () => {
    expect(суммы({})).toEqual(['12000.00', '12000.00', '100000.00', '12000.00'])
  })

  it('Итоги с капитализацией', () => {
    expect(суммы({ capitalize: true })).toEqual(['12682.51', '0.00', '112682.51', '12682.51'])
  })
})

describe('Расчёт с некорректными параметрами', () => {
  it('Выбрасывает ошибку с перечнем проблем', () => {
    expect(() => calculate(параметры({ rate: -1 }))).toThrowError(/Ставка/)
  })
})

describe('Входные параметры вклада', () => {
  it('Капитализация по умолчанию выключена', () => {
    const { capitalize: _не_задан, ...без } = параметры({})
    const итог = calculate(без as DepositParams)
    expect(итог.totals.paid.toFixed(2)).toBe('12000.00')
    expect(итог.totals.closingBalance.toFixed(2)).toBe('100000.00')
  })
})
