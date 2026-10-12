import type Decimal from 'decimal.js'
import type { Schedule } from '../core'
import { formatDate } from './money'

const HEADER = [
  '№',
  'Дата начала',
  'Дата окончания',
  'Месяцев',
  'Остаток на начало',
  'Начислено',
  'Капитализировано',
  'Выплачено',
  'Остаток на конец',
]

const number = (value: Decimal) => value.toFixed(2).replace('.', ',')

/** CSV для российской версии Excel: UTF-8 с BOM, разделитель «;», запятая в числах. */
export function buildCsv(schedule: Schedule): string {
  const lines = [HEADER.join(';')]
  for (const row of schedule.rows) {
    lines.push(
      [
        row.index,
        formatDate(row.startDate),
        formatDate(row.endDate),
        row.months,
        number(row.openingBalance),
        number(row.interest),
        number(row.capitalized),
        number(row.paid),
        number(row.closingBalance),
      ].join(';'),
    )
  }
  return `﻿${lines.join('\r\n')}\r\n`
}
