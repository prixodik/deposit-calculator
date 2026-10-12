import { describe, expect, it } from 'vitest'
import { createDefaults, useDeposit } from '../../src/composables/useDeposit'

const сегодня = new Date(2026, 9, 12)

describe('Значения по умолчанию', () => {
  it('Первое открытие', () => {
    const { state, issues, schedule } = useDeposit(createDefaults(сегодня))
    expect(state.value).toMatchObject({
      amount: '500 000',
      rate: '16',
      term: '12',
      termUnit: 'months',
      startDate: '2026-10-12',
      frequency: 'monthly',
      capitalize: true,
    })
    expect(issues.value).toEqual({})
    expect(schedule.value?.rows).toHaveLength(12)
  })
})

describe('Мгновенный пересчёт и ошибки у полей', () => {
  const вклад = () =>
    useDeposit({
      amount: '100 000',
      rate: '12',
      term: '12',
      termUnit: 'months',
      startDate: '2026-01-15',
      frequency: 'quarterly',
      capitalize: true,
    })

  it('Смена ставки', () => {
    const d = вклад()
    d.state.value = { ...d.state.value, rate: '10' }
    expect(d.schedule.value?.totals.closingBalance.toFixed(2)).toBe('110381.29')
  })

  it('Срок в годах', () => {
    const d = вклад()
    d.state.value = { ...d.state.value, term: '2', termUnit: 'years' }
    expect(d.schedule.value?.rows.at(-1)?.endDate).toBe('2028-01-15')
  })

  it('Ставка выше предела', () => {
    const d = вклад()
    d.state.value = { ...d.state.value, rate: '150' }
    expect(d.issues.value.rate).toBe('Ставка должна быть от 0 до 100 %')
  })

  it('Пустое поле суммы', () => {
    const d = вклад()
    const было = d.schedule.value
    d.state.value = { ...d.state.value, amount: '' }
    expect(d.issues.value.amount).toBe('Укажите сумму вклада')
    expect(d.schedule.value).toBe(было)
  })

  it('Результат помечается устаревшим, пока есть ошибка', () => {
    const d = вклад()
    expect(d.stale.value).toBe(false)
    d.state.value = { ...d.state.value, rate: '150' }
    expect(d.stale.value).toBe(true)
    d.state.value = { ...d.state.value, rate: '12' }
    expect(d.stale.value).toBe(false)
  })

  it('Нецелый срок в месяцах — ошибка срока', () => {
    const d = вклад()
    d.state.value = { ...d.state.value, term: '1,5' }
    expect(d.issues.value.months).toContain('Срок')
  })

  it('Ввод с пробелами и запятой в сумме принимается', () => {
    const d = вклад()
    d.state.value = { ...d.state.value, amount: '1 250 000,50' }
    expect(d.issues.value).toEqual({})
    expect(d.schedule.value?.rows[0]?.openingBalance.toFixed(2)).toBe('1250000.50')
  })
})
