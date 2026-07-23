'use client'

import { Braces, ExternalLink } from 'lucide-react'
import SwaggerClient from '@/components/site/SwaggerClient'
import { useLanguage } from '@/components/site/LanguageProvider'

export default function SwaggerPage() {
  const { isArabic } = useLanguage()
  return <><section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><Braces size={16} /> OpenAPI 3.1</span><h1 className="title-lg">{isArabic ? 'مرجع Swagger التفاعلي' : 'Interactive Swagger reference'}</h1><p className="lead">{isArabic ? 'استعرض المخطط الكامل ونفّذ الطلبات مباشرة من المتصفح.' : 'Browse the complete schema and execute requests directly from your browser.'}</p></div><a className="btn btn-secondary" href="/openapi.json" target="_blank" rel="noreferrer"><ExternalLink size={16} /> openapi.json</a></div></section><section className="page-content"><div className="container"><div className="swagger-shell"><SwaggerClient /></div></div></section></>
}
