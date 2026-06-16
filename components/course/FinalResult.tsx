'use client'

import { useReading } from './ReadingProvider'
import s from './course.module.css'

// Итоговый блок предмета: живое кольцо прогресса чтения преподавателем.
export default function FinalResult({ studentCompleted }: { studentCompleted: boolean }) {
  const { readCount, total, percent } = useReading()

  const heading =
    percent === 100
      ? 'Все ответы прочитаны'
      : readCount > 0
        ? 'Преподаватель знакомится с ответами'
        : 'Ответы готовы к ознакомлению'

  return (
    <div className={s.finalCard}>
      <div
        className={s.finalRing}
        style={{
          background: `conic-gradient(var(--accent-3) ${percent * 3.6}deg, var(--toggle-bg) 0deg)`,
        }}
      >
        <div className={s.finalRingInner}>
          <span className={s.finalPct}>{percent}%</span>
          <span className={s.finalPctLabel}>прочитано</span>
        </div>
      </div>
      <div className={s.finalBody}>
        <h3>{heading}</h3>
        <p>
          {studentCompleted
            ? 'Все задания по предмету выполнены студентом. '
            : ''}
          Прогресс показывает, какую часть ответов вы (преподаватель) уже отметили
          прочитанными. Отмечайте задания вручную или просто долистывайте их до конца —
          статус сохранится автоматически.
        </p>
        <div className={s.finalStats}>
          <div className={s.finalStat}>
            <span className={s.finalStatNum}>{readCount}</span>
            <span className={s.finalStatLabel}>прочитано</span>
          </div>
          <div className={s.finalStat}>
            <span className={s.finalStatNum}>{total - readCount}</span>
            <span className={s.finalStatLabel}>осталось</span>
          </div>
          <div className={s.finalStat}>
            <span className={s.finalStatNum}>{total}</span>
            <span className={s.finalStatLabel}>всего</span>
          </div>
        </div>
      </div>
    </div>
  )
}
