'use client'

import { useEffect, useRef, useState } from 'react'
import TaskBody from './TaskBody'
import { useReading } from './ReadingProvider'
import s from './course.module.css'

export interface TaskCardProps {
  id: string // "1.5"
  anchor: string // "task-1-5"
  title: string
  kind?: string
  desc?: string
  html: string
  defaultOpen?: boolean
}

function countSubtasks(html: string): number {
  return (html.match(/subtask-panel/g) || []).length
}

// Оценка времени чтения (~180 слов/мин для русского). Текст из html без тегов.
function readMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 180))
}

export default function TaskCard({
  id,
  anchor,
  title,
  kind,
  desc,
  html,
  defaultOpen = false,
}: TaskCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const { isRead, setRead, toggle } = useReading()
  const read = isRead(id)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const subtasks = countSubtasks(html)
  const minutes = readMinutes(html)

  // Авто-отметка «прочитано», когда преподаватель долистал открытую карточку до конца.
  useEffect(() => {
    if (!open || read) return
    const el = sentinelRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setRead(id, true)
        })
      },
      { threshold: 0.8 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [open, read, id, setRead])

  return (
    <div className={`task-card fade-in visible${open ? ' open' : ''}${read ? ' is-read' : ''}`} id={anchor}>
      <div
        className="task-card-header"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
      >
        <div className="task-num">{id}</div>
        <div className="task-card-info">
          <div className="task-card-title">
            {title}
            {subtasks > 1 && <span className="subtask-counter">{subtasks} подзадания</span>}
            <span className="task-read-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Прочитано
            </span>
          </div>
          <div className="task-card-desc">
            {kind}
            {kind && desc ? ' · ' : ''}
            {desc}
            <span className="read-time" title={`чтение ≈ ${minutes} мин`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
              ≈ {minutes} мин
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`${s.readBtn} ${read ? s.readBtnOn : s.readBtnOff}`}
          aria-pressed={read}
          onClick={(e) => {
            e.stopPropagation()
            toggle(id)
          }}
        >
          {read ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
          <span>{read ? 'Прочитано' : 'Отметить прочитанным'}</span>
        </button>

        <div className="task-card-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <div className="task-card-body">
        <div className="task-card-content">
          {open && (
            <>
              <TaskBody html={html} />
              <div className="task-read-sentinel" ref={sentinelRef} aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
