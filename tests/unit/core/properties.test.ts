import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { calculate } from '../../../src/core/calculate'
import type { DepositParams, Frequency } from '../../../src/core/types'

// Воспроизводимый генератор псевдослучайных чисел (mulberry32).
function генератор(зерно: number) {
  let s = зерно >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const частоты: Frequency[] = ['monthly', 'quarterly', 'yearly', 'end_of_term']

describe('Свойства расчёта на воспроизводимых входах', () => {
  it('Сумма начислений равна итогу, остаток согласован с выплатами (1000 входов)', () => {
    const случайное = генератор(20261012)
    for (let i = 0; i < 1000; i++) {
      const p: DepositParams = {
        amount: ((Math.floor(случайное() * 99_999_900) + 100) / 100).toFixed(2),
        rate: (Math.floor(случайное() * 10_000) / 100).toFixed(2),
        months: 1 + Math.floor(случайное() * 120),
        startDate: '2026-01-15',
        frequency: частоты[Math.floor(случайное() * 4)]!,
        capitalize: случайное() < 0.5,
      }
      const { periods, totals } = calculate(p)
      const сумма = (f: (x: (typeof periods)[number]) => Decimal) =>
        periods.reduce((a, x) => a.plus(f(x)), new Decimal(0))

      expect(сумма((x) => x.interest).equals(totals.accrued)).toBe(true)
      expect(сумма((x) => x.paid).equals(totals.paid)).toBe(true)
      expect(totals.income.equals(totals.closingBalance.plus(totals.paid).minus(new Decimal(p.amount)))).toBe(true)
      expect(totals.income.equals(totals.accrued)).toBe(true)
      for (const x of periods) {
        expect(x.capitalized.plus(x.paid).equals(x.interest)).toBe(true)
        expect(x.closingBalance.equals(x.openingBalance.plus(x.capitalized))).toBe(true)
        expect(x.interest.decimalPlaces()).toBeLessThanOrEqual(2)
      }
      if (!p.capitalize) expect(totals.closingBalance.equals(new Decimal(p.amount))).toBe(true)
    }
  })
})
