'use client'

import type { ThemeMeta } from '@/lib/types'
import { useReading } from './ReadingProvider'
import s from './course.module.css'

const ACCENTS = [s.tcA1, s.tcA2, s.tcA3, s.tcA4]

export default function ThemeCards({ themes }: { themes: ThemeMeta[] }) {
  const { isRead } = useReading()

  return (
    <div className={s.themeGrid}>
      {themes.map((theme, i) => {
        const total = theme.tasks.length
        const read = theme.tasks.filter((t) => isRead(t.id)).length
        const pct = total === 0 ? 0 : Math.round((read / total) * 100)
        return (
          <a href={`#${theme.id}`} className={`${s.themeCard} ${ACCENTS[i % 4]}`} key={theme.id}>
            <div className={s.themeCardTop} />
            <div className={s.themeLabel}>{`Тема ${String(i + 1).padStart(2, '0')}`}</div>
            <h3 className={s.themeTitle}>{theme.title}</h3>
            {theme.description && <p className={s.themeDesc}>{theme.description}</p>}

            <div className={s.themeChips}>
              {theme.tasks.map((t) => (
                <span
                  key={t.id}
                  className={`${s.themeChip}${isRead(t.id) ? ' ' + s.themeChipRead : ''}`}
                  title={t.title}
                >
                  {t.numLabel ?? t.id}
                </span>
              ))}
            </div>

            <div className={s.themeFoot}>
              <div className={s.themeProgressRow}>
                <div className={s.themeProgressTrack}>
                  <div className={s.themeProgressFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={s.themeProgressTxt}>
                  {read}/{total}
                </span>
              </div>
              <span className={s.themeReadLabel}>прочитано</span>
            </div>
          </a>
        )
      })}
    </div>
  )
}
