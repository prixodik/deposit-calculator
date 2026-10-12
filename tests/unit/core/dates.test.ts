import { describe, expect, it } from 'vitest'
import { addMonths } from '../../../src/core/dates'
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

const окончания = (p: Partial<DepositParams>) => buildSchedule(параметры(p)).rows.map((r) => r.endDate)

describe('Даты периодов', () => {
  it('Обычные даты', () => {
    expect(окончания({ months: 3 })).toEqual(['2026-02-15', '2026-03-15', '2026-04-15'])
  })

  it('Конец месяца не сдвигается', () => {
    expect(окончания({ startDate: '2026-01-31', months: 3 })).toEqual(['2026-02-28', '2026-03-31', '2026-04-30'])
  })

  it('Високосный год', () => {
    expect(окончания({ startDate: '2024-01-31', months: 1 })).toEqual(['2024-02-29'])
  })

  it('Неполный последний период', () => {
    expect(окончания({ months: 7, frequency: 'quarterly' })).toEqual(['2026-04-15', '2026-07-15', '2026-08-15'])
  })

  it('Дата начала периода равна дате окончания предыдущего', () => {
    const { rows } = buildSchedule(параметры({ months: 5, frequency: 'quarterly' }))
    expect(rows[0]!.startDate).toBe('2026-01-15')
    expect(rows[1]!.startDate).toBe(rows[0]!.endDate)
  })

  it('Переход через год', () => {
    expect(addMonths('2026-11-30', 3)).toBe('2027-02-28')
    expect(addMonths('2026-12-15', 12)).toBe('2027-12-15')
  })
})
