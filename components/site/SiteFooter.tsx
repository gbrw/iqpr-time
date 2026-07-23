'use client'

import Link from 'next/link'
import { Code2, Database, FileText, MoonStar } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

export default function SiteFooter() {
  const { isArabic } = useLanguage()
  const links = isArabic
    ? [['/docs', 'التوثيق'], ['/source', 'مصدر البيانات'], ['/usage-policy', 'سياسة الاستخدام'], ['/status', 'حالة الخدمة']]
    : [['/docs', 'Documentation'], ['/source', 'Data source'], ['/usage-policy', 'Usage policy'], ['/status', 'Service status']]

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="brand-mark"><MoonStar size={20} strokeWidth={1.8} /></span>
          <div>
            <strong>IQPR Time</strong>
            <p>{isArabic ? 'واجهة برمجية مستقلة ومفتوحة للمطورين.' : 'An independent, open API for developers.'}</p>
          </div>
        </div>
        <nav className="footer-links" aria-label={isArabic ? 'روابط التذييل' : 'Footer links'}>
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="footer-meta">
          <span><Database size={15} /> 121 {isArabic ? 'مدينة' : 'cities'}</span>
          <span><Code2 size={15} /> REST API v1</span>
          <Link href="/source"><FileText size={15} /> {isArabic ? 'تفاصيل المصدر' : 'Source details'}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 IQPR Time</span>
        <span>{isArabic ? 'مشروع تقني مستقل وغير تابع رسمياً لأي جهة دينية.' : 'An independent project with no official religious affiliation.'}</span>
      </div>
    </footer>
  )
}
