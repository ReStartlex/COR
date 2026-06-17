import Link from 'next/link'
import type { SubjectMeta, SubjectProgress } from '@/lib/types'
import { SubjectIcon } from '@/components/icons'
import s from './home.module.css'

function taskCount(meta: SubjectMeta): number {
  return meta.themes.reduce((n, t) => n + t.tasks.length, 0)
}

// Индивидуальный акцент карточки по предмету.
const ACCENT_COLOR: Record<string, string> = {
  '1': '#4f8cff',
  '2': '#22d3ee',
  '3': '#34d399',
  '4': '#a78bfa',
}

export default function SubjectCard({
  meta,
  progress,
}: {
  meta: SubjectMeta
  progress: SubjectProgress
}) {
  const tasks = taskCount(meta)
  // Бейдж — статус РАБОТЫ СТУДЕНТА (ответы готовы), а не чтения преподавателем.
  const status =
    meta.studentStatus === 'completed'
      ? { cls: s.statusDone, label: '✓ Выполнен' }
      : { cls: s.statusProgress, label: 'В работе' }

  const accent = ACCENT_COLOR[meta.accent ?? '1'] ?? ACCENT_COLOR['1']

  return (
    <Link
      href={`/subjects/${meta.slug}`}
      className={s.card}
      style={{ ['--tc' as string]: accent }}
    >
      <span className={`${s.statusBadge} ${status.cls}`}>{status.label}</span>
      <div className={s.cardHead}>
        <SubjectIcon type={meta.iconType} />
        <div className={s.cardTerm}>{meta.term}</div>
      </div>
      <h3 className={s.cardTitle}>{meta.title}</h3>
      <p className={s.cardDesc}>{meta.description}</p>
      <div className={s.cardMeta}>
        <div className={s.metaItem}>
          <span className={s.metaNum}>{meta.themes.length}</span>
          <span className={s.metaLabel}>темы</span>
        </div>
        <div className={s.metaItem}>
          <span className={s.metaNum}>{tasks}</span>
          <span className={s.metaLabel}>заданий</span>
        </div>
        <div className={s.metaItem}>
          <span className={s.metaNum}>{progress.read}</span>
          <span className={s.metaLabel}>прочитано</span>
        </div>
      </div>
      <div className={s.progressRow}>
        <div className={s.progressTrack}>
          <div className={s.progressFill} style={{ width: `${progress.percent}%` }} />
        </div>
        <span className={s.progressPct}>{progress.percent}%</span>
      </div>
    </Link>
  )
}
