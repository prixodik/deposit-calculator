import Decimal from 'decimal.js'
import { periodInterest } from './interest'
import { splitPeriods } from './periods'
import type { CalculationResult, DepositParams, PeriodResult, ValidationIssue } from './types'
import { validateParams } from './validate'

export class ValidationError extends Error {
  readonly issues: ValidationIssue[]

  constructor(issues: ValidationIssue[]) {
    super(issues.map((i) => i.message).join('; '))
    this.name = 'ValidationError'
    this.issues = issues
  }
}

/** Рассчитывает периоды и итоги вклада. Бросает ValidationError при некорректных параметрах. */
export function calculate(params: DepositParams): CalculationResult {
  const issues = validateParams(params)
  if (issues.length > 0) throw new ValidationError(issues)

  const amount = new Decimal(params.amount)
  const rate = new Decimal(params.rate)

  let balance = amount
  let accrued = new Decimal(0)
  let paid = new Decimal(0)
  const periods: PeriodResult[] = []

  splitPeriods(params.months, params.frequency).forEach((months, i) => {
    const interest = periodInterest(balance, rate, months)
    const capitalized = params.capitalize ? interest : new Decimal(0)
    const paidNow = params.capitalize ? new Decimal(0) : interest
    const closingBalance = balance.plus(capitalized)

    periods.push({ index: i + 1, months, openingBalance: balance, interest, capitalized, paid: paidNow, closingBalance })
    accrued = accrued.plus(interest)
    paid = paid.plus(paidNow)
    balance = closingBalance
  })

  return {
    periods,
    totals: {
      accrued,
      paid,
      closingBalance: balance,
      income: balance.plus(paid).minus(amount),
    },
  }
}
