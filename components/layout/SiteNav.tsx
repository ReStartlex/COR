'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

export interface NavLink {
  href: string
  label: string
}

interface SiteNavProps {
  brandLogo?: string
  brandTitle: string
  brandSubtitle?: string
  brandHref?: string
  links?: NavLink[]
  /** Показать гамбургер (для страниц с сайдбаром). */
  onHamburger?: () => void
}

export default function SiteNav({
  brandLogo = 'ЦК',
  brandTitle,
  brandSubtitle,
  brandHref = '/',
  links = [],
  onHamburger,
}: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setScrolled(window.scrollY > 20)
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
        <Link href={brandHref} className="nav-brand">
          <div className="nav-logo">{brandLogo}</div>
          <div className="nav-title">
            {brandTitle} {brandSubtitle && <span>| {brandSubtitle}</span>}
          </div>
        </Link>
        <div className="nav-right">
          {links.length > 0 && (
            <div className="nav-links">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link">
                  {l.label}
                </Link>
              ))}
            </div>
          )}
          <ThemeToggle />
          {onHamburger && (
            <button className="nav-hamburger" onClick={onHamburger} aria-label="Меню">
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
