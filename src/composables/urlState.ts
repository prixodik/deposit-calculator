import { watch } from 'vue'
import type { Ref } from 'vue'
import { formatMoneyInput, parseMoneyInput } from '../format/input'
import { FREQUENCIES } from '../core'
import type { Frequency } from '../core'
import { validateState } from './useDeposit'
import type { FormState } from './useDeposit'

/** Записывает состояние формы в строку запроса адреса страницы. */
export function writeState(state: FormState): string {
  const params = new URLSearchParams({
    s: parseMoneyInput(state.amount) ?? state.amount,
    r: state.rate,
    t: state.term,
    u: state.termUnit === 'years' ? 'y' : 'm',
    d: state.startDate,
    f: state.frequency,
    c: state.capitalize ? '1' : '0',
  })
  return `?${params.toString()}`
}

/** Читает состояние из адреса; непригодные значения заменяются значениями по умолчанию. */
export function readState(search: string, defaults: FormState): FormState {
  const q = new URLSearchParams(search)
  const amount = parseMoneyInput(q.get('s') ?? '')
  const unit = q.get('u')
  const frequency = q.get('f')
  const capitalize = q.get('c')

  const candidate: FormState = {
    amount: amount === null ? defaults.amount : formatMoneyInput(amount),
    rate: q.get('r') ?? defaults.rate,
    term: q.get('t') ?? defaults.term,
    termUnit: unit === 'y' ? 'years' : unit === 'm' ? 'months' : defaults.termUnit,
    startDate: q.get('d') ?? defaults.startDate,
    frequency: FREQUENCIES.includes(frequency as Frequency) ? (frequency as Frequency) : defaults.frequency,
    capitalize: capitalize === '1' ? true : capitalize === '0' ? false : defaults.capitalize,
  }

  const issues = validateState(candidate)
  if (issues.amount) candidate.amount = defaults.amount
  if (issues.rate) candidate.rate = defaults.rate
  if (issues.months) {
    candidate.term = defaults.term
    candidate.termUnit = defaults.termUnit
  }
  if (issues.startDate) candidate.startDate = defaults.startDate
  if (issues.frequency) candidate.frequency = defaults.frequency
  return candidate
}

/** Держит адрес страницы в соответствии с состоянием формы. */
export function useUrlState(state: Ref<FormState>) {
  watch(
    state,
    (value) => {
      try {
        history.replaceState(null, '', writeState(value))
      } catch {
        /* адрес недоступен для записи: параметры просто не сохраняются */
      }
    },
    { deep: true },
  )
}
