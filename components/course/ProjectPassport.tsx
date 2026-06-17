import type { PassportRow } from '@/lib/types'
import s from './course.module.css'

// Паспорт проектной работы (для проектных предметов).
export function ProjectPassport({ rows }: { rows: PassportRow[] }) {
  return (
    <div className={s.passport}>
      <div className={s.passportHead}>
        <div className={s.passportIcon}>📋</div>
        <h3>Паспорт проектной работы</h3>
      </div>
      <dl className={s.passportRows}>
        {rows.map((r) => (
          <div className={s.passportRow} key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
