import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion } from '../../src/composables/useReducedMotion'

afterEach(() => vi.unstubAllGlobals())

describe('Уменьшение движения', () => {
  it('Определяет системную настройку', () => {
    vi.stubGlobal('matchMedia', (запрос: string) => ({ matches: запрос.includes('reduce') }))
    expect(prefersReducedMotion()).toBe(true)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    expect(prefersReducedMotion()).toBe(false)
  })

  it('Без matchMedia считает, что движение допустимо', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })
})
