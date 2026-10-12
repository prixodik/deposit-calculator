import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveInitialTheme, useTheme, THEME_STORAGE_KEY } from '../../src/composables/useTheme'

function задатьСистемнуюТему(тёмная: boolean) {
  vi.stubGlobal('matchMedia', (запрос: string) => ({
    matches: запрос.includes('dark') ? тёмная : false,
    media: запрос,
    addEventListener() {},
    removeEventListener() {},
  }))
}

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})
afterEach(() => vi.unstubAllGlobals())

describe('Светлая и тёмная темы', () => {
  it('Системная тёмная тема', () => {
    задатьСистемнуюТему(true)
    expect(resolveInitialTheme()).toBe('dark')
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('Системная светлая тема', () => {
    задатьСистемнуюТему(false)
    expect(resolveInitialTheme()).toBe('light')
  })

  it('Ручной выбор', () => {
    задатьСистемнуюТему(true)
    const первая = useTheme()
    первая.toggle()
    expect(первая.theme.value).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    // «перезагрузка»: новый экземпляр читает сохранённый выбор, а не системную тему
    expect(useTheme().theme.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('Недоступное хранилище не ломает переключение', () => {
    задатьСистемнуюТему(false)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { theme, toggle } = useTheme()
    expect(theme.value).toBe('light')
    expect(() => toggle()).not.toThrow()
    expect(theme.value).toBe('dark')
    vi.restoreAllMocks()
  })

  it('Испорченное сохранённое значение игнорируется', () => {
    задатьСистемнуюТему(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'розовая')
    expect(resolveInitialTheme()).toBe('light')
  })
})
