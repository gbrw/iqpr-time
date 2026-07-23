import type { Metadata } from 'next'
import '../../app/globals.css'
import Navbar from '@/components/site/Navbar'
import SiteFooter from '@/components/site/SiteFooter'
import { LanguageProvider } from '@/components/site/LanguageProvider'

export const metadata: Metadata = {
  title: {
    default: 'IQPR Time — مواقيت الصلاة في العراق',
    template: '%s | IQPR Time',
  },
  description: 'REST API احترافية مجانية لمواقيت الصلاة في العراق',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </LanguageProvider>
  )
}
