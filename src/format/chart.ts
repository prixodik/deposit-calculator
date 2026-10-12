import Decimal from 'decimal.js'
import type { Schedule } from '../core'
import { formatRub } from './money'

export interface ChartPoint {
  /** Дата ГГГГ-ММ-ДД. */
  date: string
  balance: string
  /** Накопленные выплаты. */
  paid: string
}

/** Точки графика: дата открытия и конец каждого периода. */
export function chartPoints(schedule: Schedule, amount: Decimal.Value): ChartPoint[] {
  const first = schedule.rows[0]
  if (!first) return []
  let paid = new Decimal(0)
  const points: ChartPoint[] = [{ date: first.startDate, balance: new Decimal(amount).toFixed(2), paid: paid.toFixed(2) }]
  for (const row of schedule.rows) {
    paid = paid.plus(row.paid)
    points.push({ date: row.endDate, balance: row.closingBalance.toFixed(2), paid: paid.toFixed(2) })
  }
  return points
}

/** Текстовая замена графика для вспомогательных технологий. */
export function describeChart(schedule: Schedule, amount: Decimal.Value): string {
  const months = schedule.rows.reduce((sum, row) => sum + row.months, 0)
  return (
    `График роста остатка за ${months} мес.: с ${formatRub(amount)} до ${formatRub(schedule.totals.closingBalance)}, ` +
    `выплачено процентов ${formatRub(schedule.totals.paid)}.`
  )
}
