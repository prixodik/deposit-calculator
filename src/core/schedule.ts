import { calculate } from './calculate'
import { addMonths } from './dates'
import type { DepositParams, PeriodResult, Totals } from './types'

export interface ScheduleRow extends PeriodResult {
  /** Даты в формате ГГГГ-ММ-ДД. */
  startDate: string
  endDate: string
}

export interface Schedule {
  rows: ScheduleRow[]
  totals: Totals
}

/** Строит график выплат: периоды расчёта с датами начала и окончания. */
export function buildSchedule(params: DepositParams): Schedule {
  const { periods, totals } = calculate(params)
  let elapsed = 0
  let startDate = params.startDate
  const rows = periods.map((period) => {
    elapsed += period.months
    const endDate = addMonths(params.startDate, elapsed)
    const row: ScheduleRow = { ...period, startDate, endDate }
    startDate = endDate
    return row
  })
  return { rows, totals }
}
