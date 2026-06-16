'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

interface ReadingCtx {
  isRead: (id: string) => boolean
  readCount: number
  total: number
  percent: number
  setRead: (id: string, read: boolean, opts?: { silent?: boolean }) => void
  toggle: (id: string) => void
}

const Ctx = createContext<ReadingCtx | null>(null)

export function useReading(): ReadingCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useReading must be used within ReadingProvider')
  return v
}

function toast(msg: string) {
  window.dispatchEvent(new CustomEvent('cor:toast', { detail: msg }))
}

function launchConfetti() {
  const layer = document.getElementById('confettiLayer')
  if (!layer) return
  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('span')
    p.className = 'confetti-piece'
    p.style.left = Math.random() * 100 + '%'
    p.style.background = colors[i % colors.length]
    p.style.width = 6 + Math.random() * 8 + 'px'
    p.style.height = 10 + Math.random() * 10 + 'px'
    p.style.animationDuration = 2.2 + Math.random() * 2.4 + 's'
    p.style.animationDelay = Math.random() * 0.6 + 's'
    p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'
    layer.appendChild(p)
    setTimeout(() => p.remove(), 5500)
  }
}

export default function ReadingProvider({
  subjectSlug,
  taskIds,
  initialRead,
  children,
}: {
  subjectSlug: string
  taskIds: string[]
  initialRead: string[]
  children: React.ReactNode
}) {
  const [read, setReadState] = useState<Set<string>>(() => new Set(initialRead))
  // readRef — актуальное состояние для обработчиков (без побочных эффектов в setState-updater).
  const readRef = useRef(read)
  const celebrated = useRef(initialRead.length >= taskIds.length && taskIds.length > 0)

  const persist = useCallback(
    (taskId: string, value: boolean) => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectSlug, taskId, read: value }),
      }).catch(() => toast('Не удалось сохранить статус'))
    },
    [subjectSlug]
  )

  const setRead = useCallback(
    (id: string, value: boolean, opts?: { silent?: boolean }) => {
      const cur = readRef.current
      if (cur.has(id) === value) return // ничего не меняется
      const next = new Set(cur)
      if (value) next.add(id)
      else next.delete(id)
      readRef.current = next
      setReadState(next)

      // Побочные эффекты — ВНЕ обновителя состояния (мы внутри обработчика события).
      persist(id, value)
      if (value && !opts?.silent) toast(`Задание ${id} прочитано`)
      if (value && next.size >= taskIds.length && taskIds.length > 0 && !celebrated.current) {
        celebrated.current = true
        launchConfetti()
        setTimeout(() => toast('Все ответы по предмету прочитаны 🎉'), 400)
      }
      if (next.size < taskIds.length) celebrated.current = false
    },
    [persist, taskIds.length]
  )

  const toggle = useCallback((id: string) => setRead(id, !readRef.current.has(id)), [setRead])

  const value = useMemo<ReadingCtx>(
    () => ({
      isRead: (id) => read.has(id),
      readCount: read.size,
      total: taskIds.length,
      percent: taskIds.length === 0 ? 0 : Math.round((read.size / taskIds.length) * 100),
      setRead,
      toggle,
    }),
    [read, taskIds.length, setRead, toggle]
  )

  return (
    <Ctx.Provider value={value}>
      <div className="confetti-layer" id="confettiLayer" aria-hidden="true" />
      {children}
    </Ctx.Provider>
  )
}
