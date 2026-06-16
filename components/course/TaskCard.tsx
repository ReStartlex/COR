'use client'

import { useState } from 'react'
import type { TaskStatus } from '@/lib/types'
import StatusPill from './StatusPill'
import TaskBody from './TaskBody'

export interface TaskCardProps {
  id: string // "1.5"
  anchor: string // "task-1-5"
  title: string
  kind?: string
  desc?: string
  status: TaskStatus
  html: string
  defaultOpen?: boolean
}

function countSubtasks(html: string): number {
  return (html.match(/subtask-panel/g) || []).length
}

export default function TaskCard({
  id,
  anchor,
  title,
  kind,
  desc,
  status,
  html,
  defaultOpen = false,
}: TaskCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const subtasks = countSubtasks(html)

  return (
    <div className={`task-card fade-in visible${open ? ' open' : ''}`} id={anchor}>
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
          </div>
          <div className="task-card-desc">
            {kind}
            {kind && desc ? ' · ' : ''}
            {desc}
          </div>
        </div>
        <StatusPill status={status} />
        <div className="task-card-toggle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <div className="task-card-body">
        <div className="task-card-content">{open && <TaskBody html={html} />}</div>
      </div>
    </div>
  )
}
