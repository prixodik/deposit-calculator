import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App.vue'

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  localStorage.clear()
})

describe('Каркас страницы', () => {
  it('Шапка содержит заголовок и переключатель темы с доступной подписью', () => {
    const w = mount(App)
    expect(w.get('.app-header__title').text()).toBe('Калькулятор вклада')
    const кнопка = w.get('.theme-toggle')
    expect(кнопка.attributes('aria-label')).toMatch(/тём|светл/i)
  })

  it('Переключатель меняет тему и подпись', async () => {
    const w = mount(App)
    const до = w.get('.theme-toggle').attributes('aria-label')
    await w.get('.theme-toggle').trigger('click')
    expect(w.get('.theme-toggle').attributes('aria-label')).not.toBe(до)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('Есть области формы и результатов', () => {
    const w = mount(App)
    expect(w.find('.app__form').exists()).toBe(true)
    expect(w.find('.app__results').exists()).toBe(true)
  })
})
