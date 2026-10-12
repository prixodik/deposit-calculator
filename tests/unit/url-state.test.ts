import { describe, expect, it } from 'vitest'
import { createDefaults } from '../../src/composables/useDeposit'
import { readState, writeState } from '../../src/composables/urlState'

const умолчания = createDefaults(new Date(2026, 9, 12))

describe('Параметры в адресе страницы', () => {
  it('Поделиться ссылкой', () => {
    const состояние = {
      amount: '300 000',
      rate: '14',
      term: '18',
      termUnit: 'months' as const,
      startDate: '2026-03-01',
      frequency: 'quarterly' as const,
      capitalize: false,
    }
    const запрос = writeState(состояние)
    expect(readState(запрос, умолчания)).toEqual(состояние)
  })

  it('Испорченный адрес', () => {
    const s = readState('?s=300000&r=abc&t=12&u=m&d=2026-03-01&f=monthly&c=1', умолчания)
    expect(s.rate).toBe(умолчания.rate)
    expect(s.amount).toBe('300 000')
  })

  it('Недопустимые значения заменяются значениями по умолчанию', () => {
    const s = readState('?s=-5&r=150&t=0&u=x&d=2026-02-30&f=weekly&c=2', умолчания)
    expect(s).toEqual(умолчания)
  })

  it('Пустой адрес даёт значения по умолчанию', () => {
    expect(readState('', умолчания)).toEqual(умолчания)
  })
})
