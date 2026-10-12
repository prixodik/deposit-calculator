import { toDecimal } from './money'
import { FREQUENCIES } from './periods'
import type { DepositParams, ValidationIssue } from './types'

export const MAX_RATE = 100
export const MAX_MONTHS = 600

/** Проверяет, что строка — существующая календарная дата в формате ГГГГ-ММ-ДД. */
export function isValidIsoDate(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function validateParams(params: DepositParams): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const amount = toDecimal(params.amount)
  if (amount === null) {
    issues.push({ field: 'amount', message: 'Укажите сумму вклада' })
  } else if (amount.lessThanOrEqualTo(0)) {
    issues.push({ field: 'amount', message: 'Сумма вклада должна быть больше нуля' })
  } else if (amount.decimalPlaces() > 2) {
    issues.push({ field: 'amount', message: 'Сумма вклада: не более двух знаков после запятой' })
  }

  const rate = toDecimal(params.rate)
  if (rate === null) {
    issues.push({ field: 'rate', message: 'Укажите ставку' })
  } else if (rate.isNegative() || rate.greaterThan(MAX_RATE)) {
    issues.push({ field: 'rate', message: `Ставка должна быть от 0 до ${MAX_RATE} %` })
  }

  const months = params.months
  if (!Number.isInteger(months) || months < 1 || months > MAX_MONTHS) {
    issues.push({ field: 'months', message: `Срок должен быть целым числом месяцев от 1 до ${MAX_MONTHS}` })
  }

  if (!FREQUENCIES.includes(params.frequency)) {
    issues.push({ field: 'frequency', message: 'Выберите периодичность начисления из списка' })
  }

  if (!isValidIsoDate(params.startDate)) {
    issues.push({ field: 'startDate', message: 'Укажите существующую дату открытия' })
  }

  return issues
}
