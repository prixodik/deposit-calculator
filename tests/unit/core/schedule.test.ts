import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { buildSchedule } from '../../../src/core/schedule'
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

const строка = (p: Partial<DepositParams>, номер: number) => {
  const r = buildSchedule(параметры(p)).rows[номер - 1]!
  return [r.openingBalance, r.interest, r.capitalized, r.paid, r.closingBalance].map((d) => d.toFixed(2))
}

describe('Строка графика на каждый период', () => {
  it('Число строк', () => {
    const { rows } = buildSchedule(параметры({}))
    expect(rows).toHaveLength(12)
    expect(rows.map((r) => r.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('Строка с капитализацией', () => {
    expect(строка({ capitalize: true }, 2)).toEqual(['101000.00', '1010.00', '1010.00', '0.00', '102010.00'])
  })

  it('Строка без капитализации', () => {
    expect(строка({}, 2)).toEqual(['100000.00', '1000.00', '0.00', '1000.00', '100000.00'])
  })
})

describe('Согласованность графика и итогов', () => {
  it('Сверка с итогами', () => {
    const { rows, totals } = buildSchedule(параметры({ rate: 10, frequency: 'quarterly', capitalize: true }))
    const начислено = rows.reduce((a, r) => a.plus(r.interest), new Decimal(0))
    expect(начислено.toFixed(2)).toBe('10381.29')
    expect(начислено.equals(totals.accrued)).toBe(true)
    expect(rows.at(-1)!.closingBalance.toFixed(2)).toBe('110381.29')
  })

  it('Цепочка остатков', () => {
    for (const capitalize of [true, false]) {
      const { rows } = buildSchedule(параметры({ months: 7, frequency: 'quarterly', capitalize }))
      expect(rows[0]!.openingBalance.toFixed(2)).toBe('100000.00')
      rows.slice(1).forEach((r, i) => expect(r.openingBalance.equals(rows[i]!.closingBalance)).toBe(true))
    }
  })

  it('Итоги графика совпадают с расчётом', () => {
    const { totals } = buildSchedule(параметры({ capitalize: true }))
    expect(totals.closingBalance.toFixed(2)).toBe('112682.51')
    expect(totals.income.toFixed(2)).toBe('12682.51')
  })
})
