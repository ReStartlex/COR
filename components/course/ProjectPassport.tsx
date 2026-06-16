import type { PassportRow, SystemMapItem } from '@/lib/types'
import s from './course.module.css'

// Паспорт проектной работы + карта образовательной системы (для проектных предметов).
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

export function SystemMap({ items }: { items: SystemMapItem[] }) {
  return (
    <div className={s.sysmap}>
      {items.map((it) => (
        <div className={s.sysmapCard} key={it.label}>
          <div className={s.sysmapIcon}>{it.icon}</div>
          <div className={s.sysmapLabel}>{it.label}</div>
          <div className={s.sysmapValue}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}
