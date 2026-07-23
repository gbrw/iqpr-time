'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Braces, Check, Copy, ExternalLink, FileJson, KeyRound, ListTree, Play, Server, ShieldCheck, TerminalSquare } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

type Endpoint = { path: string; ar: string; en: string; params?: [string, string, string, string][]; example: string }

const endpoints: Endpoint[] = [
  { path: '/governorates', ar: 'قائمة المحافظات مع عدد المدن التابعة لكل محافظة.', en: 'List governorates with the number of cities in each one.', example: 'GET /api/v1/governorates' },
  { path: '/cities', ar: 'قائمة المدن كاملة أو مصفّاة حسب المحافظة.', en: 'List all cities or filter them by governorate.', params: [['governorate', 'string', 'اختياري', 'Governorate slug, optional'], ['governorate_id', 'number', 'اختياري', 'Governorate ID, optional']], example: 'GET /api/v1/cities?governorate=baghdad' },
  { path: '/prayer-times/today', ar: 'مواقيت اليوم الحالي حسب توقيت بغداد.', en: "Today's prayer times in the Baghdad timezone.", params: [['city', 'string', 'مطلوب', 'Required city slug or name']], example: 'GET /api/v1/prayer-times/today?city=baghdad-center' },
  { path: '/prayer-times', ar: 'مواقيت مدينة في تاريخ محدد.', en: 'Prayer times for a city on a specific date.', params: [['city', 'string', 'مطلوب', 'Required city slug or name'], ['date', 'YYYY-MM-DD', 'مطلوب', 'Required date']], example: 'GET /api/v1/prayer-times?city=mosul&date=2026-07-23' },
  { path: '/prayer-times/{city}/{date}', ar: 'الصيغة المختصرة للاستعلام عبر المسار.', en: 'Short path-parameter form of the daily query.', params: [['city', 'string', 'مطلوب', 'Required'], ['date', 'YYYY-MM-DD | today', 'مطلوب', 'Required']], example: 'GET /api/v1/prayer-times/basra-city/today' },
  { path: '/prayer-times/month', ar: 'جدول شهر كامل لمدينة واحدة.', en: 'A full month for one city.', params: [['city', 'string', 'مطلوب', 'Required'], ['month', '1–12', 'مطلوب', 'Required'], ['year', 'number', 'اختياري', 'Optional; defaults to current year']], example: 'GET /api/v1/prayer-times/month?city=erbil-city&month=7&year=2026' },
  { path: '/prayer-times/year', ar: 'جدول السنة الكامل لمدينة واحدة.', en: 'A complete year for one city.', params: [['city', 'string', 'مطلوب', 'Required'], ['year', 'number', 'اختياري', 'Optional']], example: 'GET /api/v1/prayer-times/year?city=najaf-city&year=2026' },
  { path: '/search/cities', ar: 'البحث باسم المدينة العربي أو الإنجليزي أو المعرّف.', en: 'Search by Arabic name, English name, or slug.', params: [['q', 'string', 'مطلوب', 'Required search text'], ['limit', '1–50', 'اختياري', 'Optional result limit']], example: 'GET /api/v1/search/cities?q=بغداد&limit=10' },
  { path: '/version', ar: 'إصدار البيانات وإحصاءات التغطية.', en: 'Data version and coverage statistics.', example: 'GET /api/v1/version' },
  { path: '/health', ar: 'فحص جاهزية الخدمة وقاعدة البيانات.', en: 'Service and database readiness check.', example: 'GET /api/v1/health' },
]

export default function DocsPage() {
  const { isArabic } = useLanguage()
  const [copied, setCopied] = useState<string | null>(null)
  const Arrow = isArabic ? ArrowLeft : ArrowRight
  const t = isArabic ? {
    eyebrow: 'التوثيق البرمجي', title: 'مرجع واضح، من أول طلب إلى الإنتاج', lead: 'كل نقاط الاتصال تستخدم GET، تعيد JSON، لا تحتاج مفتاح API، وتعمل بتوقيت Asia/Baghdad.',
    quick: 'البدء السريع', base: 'الرابط الأساسي', auth: 'المصادقة', authValue: 'غير مطلوبة', format: 'صيغة الاستجابة', endpoints: 'نقاط الاتصال', params: 'المعاملات', name: 'الاسم', type: 'النوع', requirement: 'الحالة',
    response: 'غلاف استجابة موحّد', errors: 'رموز الأخطاء', copy: 'نسخ', copied: 'تم النسخ', try: 'جرّب في المختبر', swagger: 'فتح Swagger',
    errorsList: [['400', 'مدخلات ناقصة أو غير صالحة'], ['404', 'المدينة أو المواقيت غير موجودة'], ['429', 'تم تجاوز حد الطلبات'], ['500', 'خطأ في قاعدة البيانات'], ['503', 'الخدمة متأثرة مؤقتاً']],
  } : {
    eyebrow: 'API documentation', title: 'A clear reference, from first call to production', lead: 'Every endpoint uses GET, returns JSON, needs no API key, and operates in the Asia/Baghdad timezone.',
    quick: 'Quick start', base: 'Base URL', auth: 'Authentication', authValue: 'Not required', format: 'Response format', endpoints: 'Endpoints', params: 'Parameters', name: 'Name', type: 'Type', requirement: 'Requirement',
    response: 'Consistent response envelope', errors: 'Error codes', copy: 'Copy', copied: 'Copied', try: 'Try in playground', swagger: 'Open Swagger',
    errorsList: [['400', 'Missing or invalid input'], ['404', 'City or prayer times not found'], ['429', 'Rate limit exceeded'], ['500', 'Database error'], ['503', 'Service temporarily degraded']],
  }

  async function copy(value: string, id: string) { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(null), 1500) }
  const responseSample = JSON.stringify({ success: true, source: { name: 'ديوان الوقف السني', official_affiliation: false }, data: { city: { name_ar: 'مركز بغداد', name_en: 'Baghdad Center', slug: 'baghdad-center' }, date: '2026-07-23', prayer_times: { fajr: '03:32', sunrise: '05:08', dhuhr: '12:14', asr: '15:55', maghrib: '19:11', isha: '20:39' } }, meta: { version: 1, timezone: 'Asia/Baghdad' } }, null, 2)

  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><BookOpen size={16} /> {t.eyebrow}</span><h1 className="title-lg">{t.title}</h1><p className="lead">{t.lead}</p></div><div className="hero-actions"><Link href="/playground" className="btn btn-primary"><Play size={17} /> {t.try}</Link><Link href="/swagger" className="btn btn-secondary"><ExternalLink size={17} /> {t.swagger}</Link></div></div></section>
    <section className="page-content"><div className="container content-grid">
      <aside className="card side-nav"><a href="#quick"><TerminalSquare size={16} /> {t.quick}</a><a href="#endpoints"><ListTree size={16} /> {t.endpoints}</a><a href="#response"><FileJson size={16} /> {t.response}</a><a href="#errors"><ShieldCheck size={16} /> {t.errors}</a></aside>
      <div className="docs-stack">
        <section id="quick" className="card docs-card"><span className="eyebrow"><TerminalSquare size={15} /> {t.quick}</span><h2 className="title-md" style={{ marginBottom: 18 }}>{isArabic ? 'ابدأ بطلب واحد' : 'Start with one request'}</h2><div className="info-grid"><div><span className="muted" style={{ fontSize: '.75rem' }}>{t.base}</span><p className="mono">/api/v1</p></div><div><span className="muted" style={{ fontSize: '.75rem' }}>{t.auth}</span><p><KeyRound size={15} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t.authValue}</p></div><div><span className="muted" style={{ fontSize: '.75rem' }}>{t.format}</span><p>application/json · UTF-8</p></div><div><span className="muted" style={{ fontSize: '.75rem' }}>Rate limit</span><p>100 requests / minute</p></div></div><div className="code-block" style={{ marginTop: 22 }}><code>curl &quot;/api/v1/prayer-times/today?city=baghdad-center&quot;</code></div></section>

        <section id="endpoints"><div className="section-heading"><span className="eyebrow"><Server size={15} /> {t.endpoints}</span><h2 className="title-md">{isArabic ? 'مرجع نقاط الاتصال' : 'Endpoint reference'}</h2></div><div className="docs-stack">{endpoints.map(endpoint => <article className="card docs-card" key={endpoint.path}><div className="endpoint-top"><span className="method-get">GET</span><code className="endpoint-path">{endpoint.path}</code></div><p className="muted">{isArabic ? endpoint.ar : endpoint.en}</p>{endpoint.params && <div style={{ overflowX: 'auto' }}><table className="params-table"><thead><tr><th>{t.name}</th><th>{t.type}</th><th>{t.requirement}</th></tr></thead><tbody>{endpoint.params.map(param => <tr key={param[0]}><td><code className="inline-code">{param[0]}</code></td><td>{param[1]}</td><td>{isArabic ? param[2] : param[3]}</td></tr>)}</tbody></table></div>}<div className="code-toolbar" style={{ marginTop: 18, marginBottom: 8, color: 'var(--ink-soft)' }}><span>Example</span><button className="btn btn-ghost btn-sm" onClick={() => copy(endpoint.example.replace('GET ', ''), endpoint.path)}>{copied === endpoint.path ? <Check size={14} /> : <Copy size={14} />}{copied === endpoint.path ? t.copied : t.copy}</button></div><pre className="code-block"><code>{endpoint.example}</code></pre></article>)}</div></section>

        <section id="response" className="card docs-card"><span className="eyebrow"><FileJson size={15} /> {t.response}</span><p className="muted" style={{ marginBottom: 18 }}>{isArabic ? 'كل طلب ناجح يعيد المصدر والبيانات والوصف التشغيلي بنفس البنية.' : 'Every successful call returns source, data, and operational metadata in the same structure.'}</p><pre className="code-block"><code>{responseSample}</code></pre></section>

        <section id="errors" className="card docs-card"><span className="eyebrow"><ShieldCheck size={15} /> {t.errors}</span><div className="service-list">{t.errorsList.map(([code, label]) => <div className="card service-row" key={code}><span>{label}</span><code className={`badge ${code === '429' ? '' : Number(code) >= 500 ? 'badge-danger' : ''}`}>{code}</code></div>)}</div><div style={{ marginTop: 24 }}><Link href="/playground" className="btn btn-primary">{t.try} <Arrow size={17} /></Link></div></section>
      </div>
    </div></section>
  </>
}
