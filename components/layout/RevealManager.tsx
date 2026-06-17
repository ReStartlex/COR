'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Плавное появление секций при прокрутке. Безопасно: пред-состояние (скрытие) ставится
// ТОЛЬКО для секций ниже сгиба; если JS выключен или IO нет — весь контент сразу виден.
export default function RevealManager() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main .section'))
    const threshold = window.innerHeight * 0.85
    const pending: HTMLElement[] = []

    for (const el of sections) {
      if (el.getBoundingClientRect().top > threshold) {
        el.setAttribute('data-revealing', '')
        el.classList.add('cor-pre')
        pending.push(el)
      }
    }
    if (pending.length === 0) return

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).classList.remove('cor-pre')
            obs.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    pending.forEach((el) => io.observe(el))

    // Подстраховка: через 2.5 с показываем всё, что осталось скрытым.
    const safety = setTimeout(() => {
      pending.forEach((el) => el.classList.remove('cor-pre'))
    }, 2500)

    return () => {
      io.disconnect()
      clearTimeout(safety)
    }
  }, [pathname])

  return null
}
