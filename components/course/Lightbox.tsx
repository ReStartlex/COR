'use client'

import { useEffect, useState } from 'react'

interface LbState {
  src: string
  alt: string
}

// Глобальный лайтбокс. Открывается событием window 'cor:lightbox' (detail: {src, alt}).
export default function Lightbox() {
  const [img, setImg] = useState<LbState | null>(null)

  useEffect(() => {
    function onOpen(e: Event) {
      const d = (e as CustomEvent<LbState>).detail
      if (d?.src) setImg(d)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setImg(null)
    }
    window.addEventListener('cor:lightbox', onOpen as EventListener)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('cor:lightbox', onOpen as EventListener)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = img ? 'hidden' : ''
  }, [img])

  return (
    <div
      className={`lightbox-overlay${img ? ' active' : ''}`}
      aria-hidden={img ? 'false' : 'true'}
      onClick={() => setImg(null)}
    >
      <button className="lightbox-close" aria-label="Закрыть" onClick={() => setImg(null)}>
        &times;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img && <img src={img.src} alt={img.alt} onClick={(e) => e.stopPropagation()} />}
    </div>
  )
}
