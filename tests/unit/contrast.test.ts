import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/styles/tokens.css', 'utf8')

/** Достаёт значения переменных из блока по селектору. */
function переменные(селектор: string): Record<string, string> {
  const начало = css.indexOf(селектор + ' {')
  expect(начало, `нет блока ${селектор}`).toBeGreaterThanOrEqual(0)
  const тело = css.slice(css.indexOf('{', начало) + 1, css.indexOf('}', начало))
  const все = Object.fromEntries([...тело.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]))
  // Токен может ссылаться на другой токен того же блока: var(--имя).
  for (const [имя, значение] of Object.entries(все)) {
    const ссылка = /^var\(--([a-z0-9-]+)\)$/.exec(значение)
    if (ссылка && все[ссылка[1]!]) все[имя] = все[ссылка[1]!]!
  }
  return все
}

function яркость(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function контраст(a: string, b: string): number {
  const [x, y] = [яркость(a), яркость(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

const пары: [string, string, number][] = [
  ['color-text', 'color-bg', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text-muted', 'color-bg', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-accent-contrast', 'color-accent', 4.5],
  ['color-accent', 'color-surface', 4.5],
  ['color-danger', 'color-surface', 4.5],
  ['color-positive', 'color-surface', 4.5],
  ['color-focus', 'color-surface', 3],
  ['color-border-strong', 'color-surface', 3],
]

describe('Контраст токенов (WCAG AA)', () => {
  for (const [тема, селектор] of [
    ['светлая', ':root'],
    ['тёмная', ":root[data-theme='dark']"],
  ] as const) {
    it(`${тема} тема: все пары не ниже порога`, () => {
      const v = переменные(селектор)
      for (const [первый, второй, порог] of пары) {
        expect(v[первый], `${первый} в ${селектор}`).toMatch(/^#[0-9a-f]{6}$/i)
        expect(v[второй], `${второй} в ${селектор}`).toMatch(/^#[0-9a-f]{6}$/i)
        const значение = контраст(v[первый]!, v[второй]!)
        expect(значение, `${первый} на ${второй}: ${значение.toFixed(2)}`).toBeGreaterThanOrEqual(порог)
      }
    })
  }
})

describe('Уменьшение движения', () => {
  it('при prefers-reduced-motion длительности анимаций равны нулю', () => {
    const блок = /@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{([^}]*)\}/.exec(css)
    expect(блок, 'нет блока уменьшения движения').not.toBeNull()
    expect(блок![1]).toMatch(/--duration-fast:\s*0ms/)
    expect(блок![1]).toMatch(/--duration-normal:\s*0ms/)
  })
})
