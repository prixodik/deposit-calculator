import Decimal from 'decimal.js'

const NBSP = ' '

/** Сумма в рублях: неразрывные пробелы между разрядами, запятая перед копейками, знак «₽». */
export function formatRub(value: Decimal.Value): string {
  const fixed = new Decimal(value).toFixed(2)
  const negative = fixed.startsWith('-')
  const [integer = '', fraction = '00'] = fixed.replace('-', '').split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${negative ? '−' : ''}${grouped},${fraction}${NBSP}₽`
}

/** Дата ГГГГ-ММ-ДД в российском формате ДД.ММ.ГГГГ. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
