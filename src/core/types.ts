import type Decimal from 'decimal.js'

/** Периодичность начисления процентов. */
export type Frequency = 'monthly' | 'quarterly' | 'yearly' | 'end_of_term'

/** Параметры вклада. Суммы и ставка принимаются в любом виде, понятном decimal.js. */
export interface DepositParams {
  amount: Decimal.Value
  /** Годовая ставка в процентах. */
  rate: Decimal.Value
  /** Срок в целых месяцах. */
  months: number
  /** Дата открытия в формате ГГГГ-ММ-ДД. */
  startDate: string
  frequency: Frequency
  capitalize?: boolean
}

export type ParamField = 'amount' | 'rate' | 'months' | 'startDate' | 'frequency'

export interface ValidationIssue {
  field: ParamField
  message: string
}

/** Результат одного периода без дат. */
export interface PeriodResult {
  /** Номер периода с 1. */
  index: number
  months: number
  openingBalance: Decimal
  interest: Decimal
  /** Часть процентов, прибавленная к остатку. */
  capitalized: Decimal
  /** Часть процентов, выплаченная вкладчику. */
  paid: Decimal
  closingBalance: Decimal
}

export interface Totals {
  accrued: Decimal
  paid: Decimal
  closingBalance: Decimal
  /** Остаток на конец срока + выплаты − сумма вклада. */
  income: Decimal
}

export interface CalculationResult {
  periods: PeriodResult[]
  totals: Totals
}
