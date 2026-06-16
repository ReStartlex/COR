// Извлекает тело каждого задания из _legacy/index.html в content/subjects/cifrovoi-kontent/tasks/<id>.html.
// Переносим ДОСЛОВНО внутреннюю разметку .task-card-content-inner (классы дизайна сохраняются),
// но: убираем inline-обработчики (onclick/onload/onerror) — интерактив (вкладки, лайтбокс)
// перевешивается на клиенте в React; и переписываем пути assets/ -> /assets/ (теперь в public/).

import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const ROOT = process.cwd()
const SRC = path.join(ROOT, '_legacy', 'index.html')
const OUT = path.join(ROOT, 'content', 'subjects', 'cifrovoi-kontent', 'tasks')

fs.mkdirSync(OUT, { recursive: true })
const html = fs.readFileSync(SRC, 'utf-8')
const $ = cheerio.load(html, { decodeEntities: false })

function dottedId(rawId) {
  const num = rawId.replace(/^task/, '') // task210 -> 210
  return num[0] + '.' + num.slice(1) //   210 -> 2.10
}

function rewriteAssets(str) {
  // src="assets/..", href="assets/.." -> /assets/..  (и ./assets/.. )
  return str
    .replace(/(src|href|poster|data-src)="(\.\/)?assets\//g, '$1="/assets/')
    .replace(/url\((['"]?)(\.\/)?assets\//g, 'url($1/assets/')
}

const report = []
$('.task-card[id^="task"]').each((_, el) => {
  const rawId = $(el).attr('id')
  const inner = $(el).find('.task-card-content-inner').first()
  if (!inner.length) {
    report.push(`${rawId}: НЕТ .task-card-content-inner`)
    return
  }
  // Снимаем inline-обработчики со всех потомков
  inner.find('*').each((_, n) => {
    for (const attr of Object.keys(n.attribs || {})) {
      if (/^on/i.test(attr)) $(n).removeAttr(attr)
    }
  })
  let body = inner.html() ?? ''
  body = rewriteAssets(body).trim()

  const id = dottedId(rawId)
  const file = path.join(OUT, `${id}.html`)
  fs.writeFileSync(file, body + '\n', 'utf-8')

  const hasTabs = /subtask-tabs/.test(body)
  const panels = (body.match(/subtask-panel/g) || []).length
  const imgs = (body.match(/<img\b/g) || []).length
  const videoSlots = (body.match(/video-slot|data-video|<video\b|<iframe\b/g) || []).length
  report.push(
    `${id.padEnd(5)} ${String(body.length).padStart(6)}b  tabs:${hasTabs ? 'да' : '—'} panels:${panels} img:${imgs} video:${videoSlots}`
  )
})

console.log(`Извлечено заданий: ${report.length}\n`)
console.log(report.join('\n'))
