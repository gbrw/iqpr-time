'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, CheckCircle2, Clock3, Database, Gauge, LoaderCircle, RefreshCw, Server, TriangleAlert, Wifi } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

type Health = { status: 'healthy' | 'degraded'; timestamp?: string; response_time_ms?: number; checks?: Record<string, string> }

export default function StatusPage() {
  const { isArabic } = useLanguage()
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkedAt, setCheckedAt] = useState('')
  const t = isArabic ? {
    eyebrow: 'مراقبة الخدمة', title: 'حالة الأنظمة لحظة بلحظة', lead: 'فحص مباشر للـAPI وقاعدة البيانات وزمن الاستجابة. يتم تحديث الحالة تلقائياً كل دقيقة.', healthy: 'جميع الأنظمة تعمل بصورة طبيعية', degraded: 'بعض الأنظمة متأثرة حالياً', checking: 'جاري فحص الأنظمة...', last: 'آخر فحص', refresh: 'إعادة الفحص', response: 'زمن الاستجابة', operational: 'تعمل', affected: 'متأثرة', services: [['بوابة API', 'استقبال الطلبات ومعالجة الاستجابات'], ['قاعدة البيانات', 'بيانات المدن ومواقيت الصلاة'], ['البيانات السنوية', 'نسخة بيانات 2026 المدققة']],
  } : {
    eyebrow: 'Service monitoring', title: 'Live system status', lead: 'A direct check of the API, database, and response time. Status refreshes automatically every minute.', healthy: 'All systems are operating normally', degraded: 'Some systems are currently degraded', checking: 'Checking systems...', last: 'Last checked', refresh: 'Refresh status', response: 'Response time', operational: 'Operational', affected: 'Degraded', services: [['API gateway', 'Request intake and response processing'], ['Database', 'City and prayer-time records'], ['Annual dataset', 'Validated 2026 data release']],
  }

  const check = useCallback(async () => {
    setLoading(true)
    try { const response = await fetch('/api/v1/health', { cache: 'no-store' }); const body = await response.json(); setHealth(body); setCheckedAt(new Date().toLocaleTimeString(isArabic ? 'ar-IQ' : 'en-GB', { timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit' })) }
    catch { setHealth({ status: 'degraded' }) }
    finally { setLoading(false) }
  }, [isArabic])

  useEffect(() => { check(); const timer = window.setInterval(check, 60_000); return () => window.clearInterval(timer) }, [check])
  const healthy = health?.status === 'healthy'
  const stateLabel = loading ? t.checking : healthy ? t.healthy : t.degraded
  const services = t.services.map((service, index) => ({ service, ok: index === 1 ? health?.checks?.database === 'ok' : healthy }))

  return <><section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><Activity size={16} /> {t.eyebrow}</span><h1 className="title-lg">{t.title}</h1><p className="lead">{t.lead}</p></div><span className="icon-box gold"><Wifi size={24} /></span></div></section><section className="page-content"><div className="container-narrow"><div className="card status-overview"><div className="status-main"><span className={`status-orb ${!healthy && !loading ? 'degraded' : ''}`}>{loading ? <LoaderCircle className="spin" size={27} /> : healthy ? <CheckCircle2 size={28} /> : <TriangleAlert size={28} />}</span><div><h2 className="title-md">{stateLabel}</h2><p className="muted">{checkedAt && `${t.last}: ${checkedAt} · Asia/Baghdad`}</p></div></div><div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>{health?.response_time_ms !== undefined && <span className="badge"><Clock3 size={14} /> {t.response}: {health.response_time_ms} ms</span>}<button className="btn btn-secondary btn-sm" onClick={check} disabled={loading}><RefreshCw size={15} /> {t.refresh}</button></div></div><div className="section-heading" style={{ marginTop: 42, marginBottom: 20 }}><span className="eyebrow"><Gauge size={15} /> System components</span><h2 className="title-md">{isArabic ? 'مكوّنات الخدمة' : 'Service components'}</h2></div><div className="service-list">{services.map(({ service, ok }, index) => { const Icon = index === 0 ? Server : index === 1 ? Database : Activity; return <div className="card service-row" key={service[0]}><div className="service-name"><span className="icon-box"><Icon size={19} /></span><div><strong>{service[0]}</strong><p className="muted" style={{ fontSize: '.77rem' }}>{service[1]}</p></div></div><span className={`badge ${ok ? 'badge-success' : 'badge-danger'}`}>{ok ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}{ok ? t.operational : t.affected}</span></div> })}</div></div></section></>
}
