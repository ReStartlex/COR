import type { TaskStatus } from '@/lib/types'
import s from './course.module.css'

const MAP: Record<TaskStatus, { cls: string; label: string }> = {
  done: { cls: s.done, label: 'Выполнено' },
  read: { cls: s.read, label: 'Изучено' },
  in_progress: { cls: s.inProgress, label: 'В процессе' },
  not_started: { cls: s.notStarted, label: 'Не начато' },
}

export default function StatusPill({ status }: { status: TaskStatus }) {
  const v = MAP[status] ?? MAP.not_started
  return (
    <span className={`${s.statusPill} ${v.cls}`}>
      {status === 'done' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <span className={s.dot} />
      )}
      {v.label}
    </span>
  )
}
