import Decimal from 'decimal.js'

/** Округление до копейки по правилу «половина вверх». */
export function roundKopeck(value: Decimal): Decimal {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/** Разбор значения в Decimal; для непригодного значения возвращает null. */
export function toDecimal(value: Decimal.Value): Decimal | null {
  if (typeof value === 'string' && value.trim() === '') return null
  try {
    const d = new Decimal(typeof value === 'string' ? value.trim() : value)
    return d.isFinite() ? d : null
  } catch {
    return null
  }
}
