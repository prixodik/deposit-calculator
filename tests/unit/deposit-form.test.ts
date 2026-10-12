import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DepositForm from '../../src/components/DepositForm.vue'
import { createDefaults } from '../../src/composables/useDeposit'

const монтировать = (issues = {}) =>
  mount(DepositForm, { props: { modelValue: createDefaults(new Date(2026, 9, 12)), issues } })

describe('Форма вклада', () => {
  it('Все поля имеют связанные подписи', () => {
    const w = монтировать()
    for (const input of w.findAll('input, select')) {
      const id = input.attributes('id')
      expect(id, 'у поля нет id').toBeTruthy()
      expect(w.find(`label[for="${id}"]`).exists(), `нет подписи для ${id}`).toBe(true)
    }
  })

  it('Ошибка показывается рядом с полем и связана с ним', () => {
    const w = монтировать({ rate: 'Ставка должна быть от 0 до 100 %' })
    const поле = w.get('#deposit-rate')
    expect(поле.attributes('aria-invalid')).toBe('true')
    const id = поле.attributes('aria-describedby')!
    expect(w.get(`#${id}`).text()).toBe('Ставка должна быть от 0 до 100 %')
  })

  it('Ввод в поле отправляет обновлённое состояние', async () => {
    const w = монтировать()
    await w.get('#deposit-rate').setValue('10')
    const события = w.emitted('update:modelValue')!
    expect(events_last(события).rate).toBe('10')
  })

  it('Выбор единицы срока и периодичности', async () => {
    const w = монтировать()
    await w.get('[data-unit="years"]').trigger('click')
    expect(events_last(w.emitted('update:modelValue')!).termUnit).toBe('years')
    await w.get('#deposit-frequency').setValue('quarterly')
    expect(events_last(w.emitted('update:modelValue')!).frequency).toBe('quarterly')
  })

  it('Быстрый выбор суммы подставляет значение', async () => {
    const w = монтировать()
    await w.get('[data-quick="1000000"]').trigger('click')
    expect(events_last(w.emitted('update:modelValue')!).amount).toBe('1 000 000')
  })

  it('Переключатель капитализации доступен как переключатель', async () => {
    const w = монтировать()
    const переключатель = w.get('#deposit-capitalize')
    expect(переключатель.attributes('role')).toBe('switch')
    await переключатель.setValue(false)
    expect(events_last(w.emitted('update:modelValue')!).capitalize).toBe(false)
  })

  it('Сумма форматируется при уходе из поля', async () => {
    const w = монтировать()
    await w.get('#deposit-amount').setValue('1250000,5')
    await w.get('#deposit-amount').trigger('blur')
    expect(events_last(w.emitted('update:modelValue')!).amount).toBe('1 250 000,5')
  })
})

function events_last(события: unknown[][]) {
  return события.at(-1)![0] as ReturnType<typeof createDefaults>
}
