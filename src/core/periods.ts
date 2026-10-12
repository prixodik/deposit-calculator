import type { Frequency } from './types'

const MONTHS_IN_PERIOD: Record<Exclude<Frequency, 'end_of_term'>, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
}

export const FREQUENCIES: readonly Frequency[] = ['monthly', 'quarterly', 'yearly', 'end_of_term']

/** Делит срок на периоды; последний период может быть короче. */
export function splitPeriods(months: number, frequency: Frequency): number[] {
  if (frequency === 'end_of_term') return [months]
  const step = MONTHS_IN_PERIOD[frequency]
  const result: number[] = []
  for (let left = months; left > 0; left -= step) result.push(Math.min(step, left))
  return result
}
