import { describe, expect, it } from 'vitest'
import { formatMoneyInput, parseMoneyInput } from '../../src/format/input'

describe('Удобный ввод денежных сумм', () => {
  it('Ввод с пробелами и запятой', () => {
    expect(parseMoneyInput('1 250 000,50')).toBe('1250000.50')
  })

  it('Точка тоже разделитель копеек, неразрывные пробелы допустимы', () => {
    expect(parseMoneyInput('1 250 000.5')).toBe('1250000.5')
  })

  it('Целое число', () => {
    expect(parseMoneyInput('500000')).toBe('500000')
  })

  it('Нечисловой и пустой ввод даёт null', () => {
    expect(parseMoneyInput('')).toBeNull()
    expect(parseMoneyInput('abc')).toBeNull()
    expect(parseMoneyInput('12,5,3')).toBeNull()
    expect(parseMoneyInput('-5')).toBeNull()
  })

  it('Доли копейки сохраняются для проверки ядром', () => {
    expect(parseMoneyInput('100,005')).toBe('100.005')
  })

  it('Показ суммы с пробелами между разрядами', () => {
    expect(formatMoneyInput('1250000.5')).toBe('1 250 000,5')
    expect(formatMoneyInput('500000')).toBe('500 000')
    expect(formatMoneyInput('999')).toBe('999')
  })

  it('Нечисловой текст при показе остаётся как есть', () => {
    expect(formatMoneyInput('abc')).toBe('abc')
  })
})
