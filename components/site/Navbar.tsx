'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Braces, Globe2, Menu, MoonStar, X } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isArabic, toggleLanguage } = useLanguage()

  const links = isArabic
    ? [['/', 'الرئيسية'], ['/playground', 'جرّب الاستعلام'], ['/docs', 'التوثيق'], ['/status', 'الحالة']]
    : [['/', 'Home'], ['/playground', 'API playground'], ['/docs', 'Docs'], ['/status', 'Status']]

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <span className="brand-mark"><MoonStar size={21} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>IQPR Time</strong>
            <small>API</small>
          </span>
        </Link>

        <nav className={`navbar-nav ${open ? 'is-open' : ''}`} aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="language-switch" onClick={toggleLanguage} aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}>
            <Globe2 size={17} />
            <span>{isArabic ? 'EN' : 'عربي'}</span>
          </button>
          <Link href="/playground" className="btn btn-primary nav-cta">
            <Braces size={17} /> {isArabic ? 'ابدأ الآن' : 'Try it'}
          </Link>
          <button className="menu-button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
