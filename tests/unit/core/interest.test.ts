import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { splitPeriods } from '../../../src/core/periods'
import { periodInterest } from '../../../src/core/interest'

describe('Разбиение срока на периоды', () => {
  it('Неполный последний квартал', () => {
    expect(splitPeriods(7, 'quarterly')).toEqual([3, 3, 1])
  })

  it('Один период на весь срок', () => {
    expect(splitPeriods(6, 'end_of_term')).toEqual([6])
  })

  it('Ежемесячно и ежегодно', () => {
    expect(splitPeriods(3, 'monthly')).toEqual([1, 1, 1])
    expect(splitPeriods(30, 'yearly')).toEqual([12, 12, 6])
  })
})

describe('Формула процентов за период', () => {
  const проценты = (остаток: string, ставка: string, месяцы: number) =>
    periodInterest(new Decimal(остаток), new Decimal(ставка), месяцы).toFixed(2)

  it('Проценты за месяц', () => {
    expect(проценты('100000.00', '12', 1)).toBe('1000.00')
  })

  it('Округление вниз', () => {
    expect(проценты('1000.00', '7', 1)).toBe('5.83')
  })

  it('Округление половины вверх', () => {
    expect(проценты('150.00', '1', 1)).toBe('0.13')
  })

  it('Дробная ставка', () => {
    expect(проценты('250000.00', '9.5', 6)).toBe('11875.00')
  })

  it('Вклад под 0 %', () => {
    expect(проценты('100000.00', '0', 1)).toBe('0.00')
  })
})
