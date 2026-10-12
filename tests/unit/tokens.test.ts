import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const стили = readFileSync('src/styles/tokens.css', 'utf8')
const блоки = стили.split('}').filter((б) => б.includes('--color-accent:'))

describe('Единый визуальный стиль', () => {
  it('Смена акцентного цвета: фокус и линия графика берут цвет из акцентного токена', () => {
    expect(блоки).toHaveLength(2)
    for (const блок of блоки) {
      expect(блок).toMatch(/--color-focus:\s*var\(--color-accent\)/)
      expect(блок).toMatch(/--color-chart-balance:\s*var\(--color-accent\)/)
    }
  })

  it('Компоненты не содержат собственных значений цвета', () => {
    for (const файл of readdirSync('src/components')) {
      const текст = readFileSync(`src/components/${файл}`, 'utf8')
      expect(текст, файл).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
    }
  })
})
