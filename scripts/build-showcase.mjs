// Собирает самодостаточную витрину ЦОР в public/showcase/igrovye-osnovy/ из _legacy/course.html.
// Витрина — отдельный иммерсивный документ (своя дизайн-система course.css), поэтому отдаётся
// статикой из public/ и не конфликтует с платформенными стилями. Интеграция — ссылки назад в курс.

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'showcase', 'igrovye-osnovy')
const BACK = '/subjects/cifrovoi-kontent'

fs.mkdirSync(OUT, { recursive: true })

// 1) Копируем css/js витрины рядом с index.html
for (const f of ['css/course.css', 'js/hero3d.js', 'js/course.js', 'js/fx.js']) {
  fs.copyFileSync(path.join(ROOT, '_legacy', f), path.join(OUT, path.basename(f)))
}

// 2) Трансформируем course.html -> index.html
let html = fs.readFileSync(path.join(ROOT, '_legacy', 'course.html'), 'utf-8')

const BASE = '/showcase/igrovye-osnovy'
html = html
  // css/js витрины — абсолютные пути (URL может быть без завершающего слэша)
  .replace('assets/css/course.css', `${BASE}/course.css`)
  .replace('assets/js/hero3d.js', `${BASE}/hero3d.js`)
  .replace('assets/js/course.js', `${BASE}/course.js`)
  .replace('assets/js/fx.js', `${BASE}/fx.js`)
  // медиа и иконки — абсолютно из public/assets
  .replace(/(src|href|poster)="assets\//g, '$1="/assets/')
  // ссылки на бывшее портфолио (index.html) -> страница курса на платформе
  .replace(/href="index\.html"/g, `href="${BACK}"`)
  // канонический/og url
  .replace(/https:\/\/xn--n1aeq\.online\/course\.html/g, 'https://xn--n1aeq.online/showcase/igrovye-osnovy/')

// 3) Кнопка возврата на платформу в навигации (перед списком ссылок)
html = html.replace(
  '<div class="nav-links" id="links">',
  `<div class="nav-links" id="links">\n      <a href="${BACK}" class="ghost">← К курсу</a>`
)

fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf-8')

const files = fs.readdirSync(OUT)
console.log('Витрина собрана в public/showcase/igrovye-osnovy/:')
console.log('  ' + files.join(', '))
console.log('  index.html: ' + fs.statSync(path.join(OUT, 'index.html')).size + ' байт')
