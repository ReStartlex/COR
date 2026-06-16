'use client'

import { useEffect, useState } from 'react'
import type { SubjectMeta } from '@/lib/types'
import SiteNav from '@/components/layout/SiteNav'
import { taskAnchor } from '@/lib/anchor'
import { useReading } from './ReadingProvider'

interface CourseChromeProps {
  meta: SubjectMeta
}

export default function CourseChrome({ meta }: CourseChromeProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const { isRead } = useReading()

  // Scroll-spy: подсвечиваем задание, чьё начало ближе всего к верху.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      let current = ''
      meta.themes.forEach((t) =>
        t.tasks.forEach((task) => {
          const el = document.getElementById(taskAnchor(task.id))
          if (el && el.getBoundingClientRect().top < 160) current = taskAnchor(task.id)
        })
      )
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [meta])

  const close = () => setOpen(false)

  return (
    <>
      <SiteNav
        brandTitle="ЦОР"
        brandSubtitle={meta.short ?? 'Предмет'}
        links={[{ href: '/', label: 'Главная' }]}
        onHamburger={() => setOpen((o) => !o)}
      />

      <div
        className={`sidebar-overlay${open ? ' active' : ''}`}
        onClick={close}
      />
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Навигация по курсу">
        {meta.themes.map((theme, i) => (
          <div className="sidebar-section" key={theme.id}>
            <div className="sidebar-section-title">
              Тема {i + 1} — {theme.short ?? theme.title}
            </div>
            {theme.tasks.map((task) => {
              const anchor = taskAnchor(task.id)
              const read = isRead(task.id)
              return (
                <a
                  key={task.id}
                  href={`#${anchor}`}
                  className={`sidebar-item${active === anchor ? ' active' : ''}${read ? ' is-read' : ''}`}
                  onClick={close}
                >
                  <span className="num">{task.id}</span>
                  {task.title}
                </a>
              )
            })}
          </div>
        ))}
      </aside>
    </>
  )
}
