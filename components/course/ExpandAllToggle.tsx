'use client'

import { useState } from 'react'
import s from './course.module.css'

// Кнопка «Развернуть/Свернуть все задания» — рассылает глобальное событие всем TaskCard.
export default function ExpandAllToggle() {
  const [allOpen, setAllOpen] = useState(false)

  const toggle = () => {
    const next = !allOpen
    setAllOpen(next)
    window.dispatchEvent(new CustomEvent('cor:setAllOpen', { detail: next }))
  }

  return (
    <button type="button" className={s.expandAll} onClick={toggle}>
      {allOpen ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="17 11 12 6 7 11" />
          <polyline points="17 18 12 13 7 18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="7 13 12 18 17 13" />
          <polyline points="7 6 12 11 17 6" />
        </svg>
      )}
      {allOpen ? 'Свернуть все' : 'Развернуть все'}
    </button>
  )
}
