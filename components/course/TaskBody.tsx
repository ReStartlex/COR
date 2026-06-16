'use client'

import { useEffect, useRef } from 'react'

// Встраивает видео в слот по data-src (YouTube / прямой mp4). Повтор media.js::embedVideoSlot.
function embedVideoSlot(slot: HTMLElement) {
  const src = (slot.dataset.src || '').trim()
  if (!src || slot.classList.contains('has-media')) return
  slot.querySelectorAll('iframe, video').forEach((el) => el.remove())
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) {
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube.com/embed/${yt[1]}?rel=0`
    iframe.loading = 'lazy'
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    iframe.allowFullscreen = true
    iframe.title = slot.dataset.videoLabel || 'Видео'
    slot.appendChild(iframe)
    slot.classList.add('has-media')
    return
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(src)) {
    const v = document.createElement('video')
    v.src = src
    v.controls = true
    v.playsInline = true
    v.preload = 'none'
    v.setAttribute('aria-label', slot.dataset.videoLabel || 'Видео')
    slot.appendChild(v)
    slot.classList.add('has-media')
  }
}

export default function TaskBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    // ===== Вкладки подзаданий (rebind по индексу, т.к. inline onclick снят) =====
    root.querySelectorAll<HTMLElement>('.subtask-tabs').forEach((group) => {
      const parent = group.parentElement
      if (!parent) return
      const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('.subtask-tab'))
      const panels = Array.from(parent.children).filter((c) =>
        c.classList.contains('subtask-panel')
      ) as HTMLElement[]
      group.setAttribute('role', 'tablist')

      const activate = (i: number) => {
        tabs.forEach((t, j) => {
          const on = i === j
          t.classList.toggle('active', on)
          t.setAttribute('aria-selected', on ? 'true' : 'false')
          t.tabIndex = on ? 0 : -1
        })
        panels.forEach((p, j) => p.classList.toggle('active', i === j))
      }

      tabs.forEach((tab, i) => {
        tab.setAttribute('role', 'tab')
        if (panels[i]) {
          panels[i].setAttribute('role', 'tabpanel')
          panels[i].setAttribute('tabindex', '0')
        }
        tab.addEventListener('click', () => activate(i))
        tab.addEventListener('keydown', (e) => {
          let ni: number | null = null
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (i + 1) % tabs.length
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
            ni = (i - 1 + tabs.length) % tabs.length
          else if (e.key === 'Home') ni = 0
          else if (e.key === 'End') ni = tabs.length - 1
          if (ni !== null) {
            e.preventDefault()
            tabs[ni].focus()
            activate(ni)
          }
        })
      })
      // начальное состояние — активная вкладка из разметки или первая
      const initial = tabs.findIndex((t) => t.classList.contains('active'))
      activate(initial >= 0 ? initial : 0)
    })

    // ===== Лайтбокс для масштабируемых картинок =====
    root.querySelectorAll<HTMLImageElement>('img.zoomable').forEach((img) => {
      img.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        window.dispatchEvent(
          new CustomEvent('cor:lightbox', {
            detail: { src: img.currentSrc || img.src, alt: img.alt },
          })
        )
      })
    })

    // ===== Ленивое встраивание видео-слотов =====
    const slots = root.querySelectorAll<HTMLElement>('.video-slot[data-src]')
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              embedVideoSlot(e.target as HTMLElement)
              obs.unobserve(e.target)
            }
          })
        },
        { rootMargin: '300px 0px' }
      )
      slots.forEach((s) => io!.observe(s))
    } else {
      slots.forEach(embedVideoSlot)
    }

    // ===== Копирование сценария (2.4) =====
    root.querySelectorAll<HTMLButtonElement>('.script-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const board = root.querySelector('#scriptBoard')
        if (!board) return
        const lines: string[] = []
        board.querySelectorAll('.script-scene').forEach((scene, i) => {
          const title = scene.querySelector('h5')?.textContent?.trim() || ''
          const onscreen = scene.querySelector('.script-onscreen')?.textContent?.trim()
          const voice = scene.querySelector('.script-voice')?.textContent?.trim() || ''
          lines.push(`${i + 1}. ${title}`)
          if (onscreen) lines.push('   На экране: ' + onscreen)
          if (voice) lines.push('   ' + voice)
          lines.push('')
        })
        const text =
          'Сценарий промо-ролика «Игровые основы программирования»\n\n' + lines.join('\n')
        navigator.clipboard
          .writeText(text)
          .then(() => window.dispatchEvent(new CustomEvent('cor:toast', { detail: 'Сценарий скопирован' })))
          .catch(() =>
            window.dispatchEvent(new CustomEvent('cor:toast', { detail: 'Не удалось скопировать' }))
          )
      })
    })

    return () => io?.disconnect()
  }, [html])

  return (
    <div
      className="task-card-content-inner content"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
