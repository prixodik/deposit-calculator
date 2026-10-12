import { describe, expect, it } from 'vitest'
import { validateParams } from '../../../src/core/validate'
import type { DepositParams } from '../../../src/core/types'

const base: DepositParams = {
  amount: '100000.00',
  rate: 12,
  months: 12,
  startDate: '2026-01-15',
  frequency: 'monthly',
  capitalize: false,
}

const поля = (p: Partial<DepositParams>) => validateParams({ ...base, ...p }).map((e) => e.field)

describe('Проверка входных параметров', () => {
  it('Корректные параметры принимаются', () => {
    expect(validateParams(base)).toEqual([])
  })

  it('Нулевая сумма', () => {
    const [ошибка] = validateParams({ ...base, amount: 0 })
    expect(ошибка?.field).toBe('amount')
    expect(ошибка?.message).toContain('Сумма')
  })

  it('Сумма с долями копейки', () => {
    expect(поля({ amount: 100.005 })).toEqual(['amount'])
  })

  it('Отрицательная ставка', () => {
    const [ошибка] = validateParams({ ...base, rate: -1 })
    expect(ошибка?.field).toBe('rate')
    expect(ошибка?.message).toContain('Ставка')
  })

  it('Ставка выше предела', () => {
    expect(поля({ rate: '100.01' })).toEqual(['rate'])
    expect(поля({ rate: 100 })).toEqual([])
  })

  it('Нулевой срок', () => {
    const [ошибка] = validateParams({ ...base, months: 0 })
    expect(ошибка?.field).toBe('months')
    expect(ошибка?.message).toContain('Срок')
  })

  it('Слишком большой срок', () => {
    expect(поля({ months: 601 })).toEqual(['months'])
    expect(поля({ months: 600 })).toEqual([])
  })

  it('Нецелый срок отклоняется', () => {
    expect(поля({ months: 1.5 })).toEqual(['months'])
  })

  it('Нечисловые значения отклоняются без исключений', () => {
    expect(поля({ amount: 'abc' })).toEqual(['amount'])
    expect(поля({ rate: '' })).toEqual(['rate'])
    expect(поля({ amount: Number.NaN })).toEqual(['amount'])
  })

  it('Неизвестная периодичность', () => {
    expect(поля({ frequency: 'weekly' as never })).toEqual(['frequency'])
  })

  it('Несуществующая дата открытия', () => {
    expect(поля({ startDate: '2026-02-30' })).toEqual(['startDate'])
    expect(поля({ startDate: 'вчера' })).toEqual(['startDate'])
  })
})
