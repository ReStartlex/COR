import Link from 'next/link'
import type { SubjectMeta, SubjectProgress } from '@/lib/types'
import s from './home.module.css'

function taskCount(meta: SubjectMeta): number {
  return meta.themes.reduce((n, t) => n + t.tasks.length, 0)
}

export default function SubjectCard({
  meta,
  progress,
}: {
  meta: SubjectMeta
  progress: SubjectProgress
}) {
  const tasks = taskCount(meta)
  const done = progress.percent === 100
  const started = progress.done > 0 || progress.inProgress > 0

  const status = done
    ? { cls: s.statusDone, label: 'Завершён' }
    : started
      ? { cls: s.statusProgress, label: 'В процессе' }
      : { cls: s.statusSoon, label: 'Не начат' }

  return (
    <Link href={`/subjects/${meta.slug}`} className={s.card}>
      <span className={`${s.statusBadge} ${status.cls}`}>{status.label}</span>
      <div className={s.cardHead}>
        <div className={s.cardIcon}>{meta.icon ?? '📘'}</div>
        <div>
          <div className={s.cardTerm}>{meta.term}</div>
        </div>
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
          <span className={s.metaNum}>{progress.done}</span>
          <span className={s.metaLabel}>выполнено</span>
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
