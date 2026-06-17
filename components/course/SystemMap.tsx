'use client'

import { useState } from 'react'
import type { SystemMapItem } from '@/lib/types'
import s from './course.module.css'

export default function SystemMap({ items }: { items: SystemMapItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className={s.sysmap}>
      {items.map((it, i) => {
        const expanded = open === i
        return (
          <button
            type="button"
            className={`${s.sysmapCard}${expanded ? ' ' + s.sysmapOpen : ''}`}
            key={it.label}
            onClick={() => setOpen(expanded ? null : i)}
            aria-expanded={expanded}
          >
            <div className={s.sysmapIcon}>{it.icon}</div>
            <div className={s.sysmapLabel}>{it.label}</div>
            <div className={s.sysmapValue}>{it.value}</div>
            {it.detail && (
              <div className={`${s.sysmapDetail}${expanded ? ' ' + s.sysmapDetailOpen : ''}`}>
                {it.detail}
              </div>
            )}
            {it.detail && (
              <span className={s.sysmapMore}>{expanded ? 'свернуть' : 'подробнее'}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
