'use client'

import { useEffect, useState } from 'react'

// Глобальный тост. Показывается событием window 'cor:toast' (detail: string).
export default function Toast() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function onToast(e: Event) {
      const text = (e as CustomEvent<string>).detail
      if (!text) return
      setMsg(text)
      setShow(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShow(false), 2600)
    }
    window.addEventListener('cor:toast', onToast as EventListener)
    return () => {
      window.removeEventListener('cor:toast', onToast as EventListener)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`toast${show ? ' show' : ''}`} role="status">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
      {msg}
    </div>
  )
}
