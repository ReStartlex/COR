import fs from 'node:fs'
import path from 'node:path'
import type { SubjectMeta } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'subjects')

// Явный порядок предметов на главной. Новый предмет = новая папка + строка здесь.
const SUBJECT_ORDER = ['cifrovoi-kontent', 'proektirovanie-obrazovatelnyh-sistem']

function readMeta(slug: string): SubjectMeta | null {
  const file = path.join(CONTENT_DIR, slug, 'meta.json')
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf-8')
  return JSON.parse(raw) as SubjectMeta
}

/** Все предметы в заданном порядке (отсутствующие папки пропускаются). */
export function getAllSubjects(): SubjectMeta[] {
  const present = new Set(
    fs.existsSync(CONTENT_DIR)
      ? fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
      : []
  )
  const ordered = SUBJECT_ORDER.filter((s) => present.has(s))
  // Папки, не попавшие в SUBJECT_ORDER, добавляем в конец по алфавиту.
  const rest = [...present].filter((s) => !SUBJECT_ORDER.includes(s)).sort()
  return [...ordered, ...rest]
    .map(readMeta)
    .filter((m): m is SubjectMeta => m !== null)
}

export function getSubject(slug: string): SubjectMeta | null {
  return readMeta(slug)
}

export function getSubjectSlugs(): string[] {
  return getAllSubjects().map((s) => s.slug)
}

/** Плоский список заданий предмета (для расчёта прогресса и итогов). */
export function getSubjectTaskIds(meta: SubjectMeta): string[] {
  return meta.themes.flatMap((t) => t.tasks.map((task) => task.id))
}
