import { ref } from 'vue'

export type Theme = 'light' | 'dark'
export const THEME_STORAGE_KEY = 'deposit-calculator:theme'

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** Сохранённый выбор, а при его отсутствии — системная настройка. */
export function resolveInitialTheme(): Theme {
  const stored = readStored()
  if (stored) return stored
  const dark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  return dark ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function useTheme() {
  const theme = ref<Theme>(resolveInitialTheme())
  apply(theme.value)

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    apply(theme.value)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    } catch {
      /* хранилище недоступно: тема действует до перезагрузки */
    }
  }

  return { theme, toggle }
}
