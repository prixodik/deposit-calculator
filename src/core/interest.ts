import Decimal from 'decimal.js'
import { roundKopeck } from './money'

/** Проценты за период: остаток × ставка / 100 × месяцы / 12, округлённые до копейки. */
export function periodInterest(balance: Decimal, annualRate: Decimal, months: number): Decimal {
  return roundKopeck(balance.times(annualRate).div(100).times(months).div(12))
}
