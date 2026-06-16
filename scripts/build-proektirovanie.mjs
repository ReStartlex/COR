// Конвертирует этапы проектной работы (proektirovanie/1.md..6.md) в HTML-фрагменты
// content/subjects/proektirovanie-obrazovatelnyh-sistem/tasks/<n>.html.
// Снимает дублирующий первый заголовок (## N. …) — он уже в шапке карточки — и
// добавляет блок «Результат этапа». Демо/интерактив пишутся вручную отдельными файлами.

import fs from 'node:fs'
import path from 'node:path'
import { marked } from 'marked'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'proektirovanie')
const OUT = path.join(ROOT, 'content', 'subjects', 'proektirovanie-obrazovatelnyh-sistem', 'tasks')
fs.mkdirSync(OUT, { recursive: true })

marked.setOptions({ gfm: true, breaks: false })

// «Результат этапа» по каждому этапу (рекомендация преподавателю — видеть проектный результат).
const RESULTS = {
  '1': 'Сформулирована тема проектного задания и установлена её связь с темой ВКР.',
  '2': 'Определены учебные и сопутствующие характеристики учащихся, их потребности, задачи стейкхолдеров и релевантные методические решения.',
  '3': 'Определена концепция раздела из четырёх занятий, образовательные цели и планируемые результаты обучения.',
  '4': 'Построен учебный план по принципу конструктивной согласованности: каждая тема связана с результатами, учебной стратегией и методом оценки.',
  '5': 'Разработан комплект методических и учебных материалов: сценарии занятий, лонгриды, квизы, чек-листы и критерии оценивания.',
  '6': 'Спроектирована система анализа опыта: количественные и качественные критерии, инструменты обратной связи и направления доработки курса.',
}

const report = []
for (let n = 1; n <= 6; n++) {
  const file = path.join(SRC, `${n}.md`)
  if (!fs.existsSync(file)) {
    report.push(`${n}: НЕТ ${file}`)
    continue
  }
  let md = fs.readFileSync(file, 'utf-8').trim()
  // Убираем первый заголовок «## N. Название» (дублирует заголовок карточки).
  md = md.replace(/^##\s+.*\n/, '').trim()

  let html = marked.parse(md)
  // Блок результата этапа.
  if (RESULTS[n]) {
    html += `\n<div class="callout success"><p><strong>Результат этапа:</strong> ${RESULTS[n]}</p></div>\n`
  }

  const out = path.join(OUT, `${n}.html`)
  fs.writeFileSync(out, html, 'utf-8')
  const tables = (html.match(/<table>/g) || []).length
  report.push(`${n}.html  ${String(html.length).padStart(6)}b  таблиц:${tables}`)
}

console.log('Этапы проектной работы собраны:')
console.log(report.join('\n'))
