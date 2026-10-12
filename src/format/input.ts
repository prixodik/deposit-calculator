/** Разбор введённой суммы: пробелы (в том числе неразрывные) убираются, запятая заменяется точкой. */
export function parseMoneyInput(text: string): string | null {
  const compact = text.replace(/[\s  ]/g, '').replace(',', '.')
  return /^\d+(\.\d+)?$/.test(compact) ? compact : null
}

/** Показ суммы с пробелами между разрядами и запятой перед копейками. */
export function formatMoneyInput(value: string): string {
  const parsed = parseMoneyInput(value)
  if (parsed === null) return value
  const [integer = '', fraction] = parsed.split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return fraction === undefined ? grouped : `${grouped},${fraction}`
}
