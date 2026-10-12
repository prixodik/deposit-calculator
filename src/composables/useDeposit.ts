import { computed, ref, watch } from 'vue'
import { buildSchedule, validateParams } from '../core'
import type { DepositParams, Frequency, ParamField, Schedule } from '../core'
import { formatMoneyInput, parseMoneyInput } from '../format/input'

export type TermUnit = 'months' | 'years'

/** Состояние формы: значения хранятся так, как их ввёл пользователь. */
export interface FormState {
  amount: string
  rate: string
  term: string
  termUnit: TermUnit
  startDate: string
  frequency: Frequency
  capitalize: boolean
}

function toIsoDate(date: Date): string {
  const p = (n: number, width = 2) => String(n).padStart(width, '0')
  return `${p(date.getFullYear(), 4)}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function createDefaults(today: Date = new Date()): FormState {
  return {
    amount: formatMoneyInput('500000'),
    rate: '16',
    term: '12',
    termUnit: 'months',
    startDate: toIsoDate(today),
    frequency: 'monthly',
    capitalize: true,
  }
}

function parseRate(text: string): string {
  const compact = text.replace(/[\s  ]/g, '').replace(',', '.')
  return /^-?\d+(\.\d+)?$/.test(compact) ? compact : ''
}

function parseMonths(term: string, unit: TermUnit): number {
  const compact = term.replace(/[\s  ]/g, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(compact)) return Number.NaN
  const months = Number(compact) * (unit === 'years' ? 12 : 1)
  return Math.round(months * 1e6) / 1e6
}

export function toParams(state: FormState): DepositParams {
  return {
    amount: parseMoneyInput(state.amount) ?? '',
    rate: parseRate(state.rate),
    months: parseMonths(state.term, state.termUnit),
    startDate: state.startDate,
    frequency: state.frequency,
    capitalize: state.capitalize,
  }
}

export type FormIssues = Partial<Record<ParamField, string>>

export function validateState(state: FormState): FormIssues {
  const issues: FormIssues = {}
  for (const issue of validateParams(toParams(state))) issues[issue.field] ??= issue.message
  return issues
}

export function useDeposit(initial: FormState = createDefaults()) {
  const state = ref<FormState>({ ...initial })
  const schedule = ref<Schedule | null>(null)
  const issues = computed(() => validateState(state.value))
  const hasIssues = computed(() => Object.keys(issues.value).length > 0)

  // Пересчёт сразу при любом изменении полей; при ошибках остаётся прежний результат.
  watch(
    state,
    () => {
      if (!hasIssues.value) schedule.value = buildSchedule(toParams(state.value))
    },
    { immediate: true, deep: true, flush: 'sync' },
  )

  const stale = computed(() => hasIssues.value && schedule.value !== null)

  return { state, issues, schedule, stale }
}
