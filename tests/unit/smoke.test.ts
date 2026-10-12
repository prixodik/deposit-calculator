import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('каркас приложения', () => {
  it('показывает заголовок страницы', () => {
    const wrapper = mount(App)
    expect(wrapper.get('.app__title').text()).toBe('Калькулятор вклада')
  })
})
