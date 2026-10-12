// Проверка имён классов по БЭМ: блок__элемент--модификатор, один уровень элементов,
// в стилях только простые селекторы по одному классу (без вложенности).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const КЛАСС = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$/

export function классыИзШаблона(текст) {
  const найдено = []
  for (const м of текст.matchAll(/\bclass="([^"]*)"/g)) {
    for (const имя of м[1].split(/\s+/).filter(Boolean)) найдено.push(имя)
  }
  return найдено
}

export function селекторыИзСтилей(текст) {
  const ошибки = []
  const без_комментариев = текст.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const м of без_комментариев.matchAll(/([^{}]+)\{/g)) {
    const предыдущее = м[1].trim()
    if (!предыдущее || предыдущее.startsWith('@')) continue
    for (const селектор of предыдущее.split(',').map((s) => s.trim())) {
      // допускаются :root, html, body, * и псевдоклассы/псевдоэлементы после одного класса
      if (/^(:root|html|body|\*|\*::before|\*::after|:focus-visible|\[data-theme=["'][a-z]+["']\]|:root\[data-theme=["'][a-z]+["']\])$/.test(селектор)) continue
      const разбор = /^\.([A-Za-z0-9_-]+)((?::{1,2}[a-z-]+(?:\([^)]*\))?)*)$/.exec(селектор)
      if (!разбор) {
        ошибки.push(`Селектор «${селектор}»: допускается один класс без вложенности`)
        continue
      }
      if (!КЛАСС.test(разбор[1])) ошибки.push(`Класс «${разбор[1]}» не соответствует БЭМ`)
    }
  }
  return ошибки
}

export function проверитьФайл(путь, текст) {
  const ошибки = []
  if (путь.endsWith('.vue')) {
    const шаблон = /<template>([\s\S]*)<\/template>/.exec(текст)?.[1] ?? ''
    for (const имя of классыИзШаблона(шаблон)) {
      if (!КЛАСС.test(имя)) ошибки.push(`Класс «${имя}» не соответствует БЭМ`)
    }
    for (const м of текст.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      ошибки.push(...селекторыИзСтилей(м[1]))
    }
  } else if (путь.endsWith('.css')) {
    ошибки.push(...селекторыИзСтилей(текст))
  }
  return ошибки.map((о) => `${путь}: ${о}`)
}

function файлы(папка) {
  return readdirSync(папка).flatMap((имя) => {
    const путь = join(папка, имя)
    return statSync(путь).isDirectory() ? файлы(путь) : [путь]
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const все = файлы('src').filter((п) => ['.vue', '.css'].includes(extname(п)))
  const ошибки = все.flatMap((п) => проверитьФайл(п, readFileSync(п, 'utf8')))
  if (ошибки.length) {
    console.error(ошибки.join('\n'))
    process.exit(1)
  }
  console.log(`Проверено файлов: ${все.length}. Нарушений БЭМ нет.`)
}
