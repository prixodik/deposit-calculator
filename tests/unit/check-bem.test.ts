import { describe, expect, it } from 'vitest'
// @ts-expect-error: модуль на JavaScript без типов
import { проверитьФайл } from '../../scripts/check-bem.mjs'

describe('проверка БЭМ', () => {
  it('принимает верные имена классов в шаблоне и стилях', () => {
    const текст = `<template><div class="form form--wide"><p class="form__field form__field--invalid"/></div></template>
<style>.form { margin: 0 } .form__field--invalid { color: red } .form__field:focus-visible { outline: 0 }</style>`
    expect(проверитьФайл('a.vue', текст)).toEqual([])
  })

  it('отклоняет неверное имя класса в шаблоне', () => {
    const текст = '<template><div class="formField"></div></template>'
    expect(проверитьФайл('a.vue', текст)).toHaveLength(1)
  })

  it('отклоняет два уровня элементов', () => {
    const текст = '<template><div class="form__field__label"></div></template>'
    expect(проверитьФайл('a.vue', текст)).toHaveLength(1)
  })

  it('отклоняет вложенные селекторы в стилях', () => {
    expect(проверитьФайл('a.css', '.form .form__field { color: red }')).toHaveLength(1)
  })

  it('отклоняет селектор по тегу внутри блока', () => {
    expect(проверитьФайл('a.css', '.form p { color: red }')).toHaveLength(1)
  })
})

describe('проверка БЭМ: служебные селекторы', () => {
  it('допускает переменные темы на корне', () => {
    expect(проверитьФайл('a.css', ":root { --a: 1 }\n:root[data-theme='dark'] { --a: 2 }")).toEqual([])
  })
})
