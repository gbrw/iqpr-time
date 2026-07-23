'use client'

import { useEffect, useMemo, useState } from 'react'
import { Braces, CalendarDays, Check, ChevronDown, Clock3, Code2, Copy, Database, Filter, Gauge, ListTree, LoaderCircle, MapPin, Play, Search, Server, TerminalSquare } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

type RequestType = 'today' | 'date' | 'month' | 'year' | 'governorates' | 'cities' | 'search'
type Governorate = { id: number; name_ar: string; name_en: string; slug: string }
type City = { id: number; name_ar: string; name_en: string; slug: string }

const requestIcons = { today: Clock3, date: CalendarDays, month: ListTree, year: Database, governorates: MapPin, cities: Filter, search: Search }
const baghdadDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' })

export default function PlaygroundPage() {
  const { isArabic } = useLanguage()
  const [requestType, setRequestType] = useState<RequestType>('today')
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [governorate, setGovernorate] = useState('baghdad')
  const [city, setCity] = useState('baghdad-center')
  const [date, setDate] = useState(baghdadDate)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(2026)
  const [query, setQuery] = useState('بغداد')
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [response, setResponse] = useState<unknown>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [copied, setCopied] = useState<'url' | 'json' | null>(null)

  const t = isArabic ? {
    eyebrow: 'مختبر API التفاعلي', title: 'اختبر كل استعلام قبل دمجه', lead: 'كوّن الطلب بصرياً، أرسله مباشرة، وافحص الاستجابة الكاملة وزمن التنفيذ دون كتابة أي كود.',
    request: 'نوع الاستعلام', location: 'الموقع', parameters: 'المعاملات', governorate: 'المحافظة', city: 'المدينة', date: 'التاريخ', month: 'الشهر', year: 'السنة', query: 'نص البحث',
    selectGov: 'اختر المحافظة', selectCity: 'اختر المدينة', loadingCities: 'جاري تحميل المدن...', send: 'إرسال الطلب', sending: 'جاري الإرسال...', copyUrl: 'نسخ الرابط', copyJson: 'نسخ JSON', copied: 'تم النسخ',
    empty: 'ستظهر الاستجابة هنا بعد إرسال الطلب', ready: 'جاهز للتنفيذ', types: { today: ['مواقيت اليوم', '/prayer-times/today'], date: ['يوم محدد', '/prayer-times'], month: ['شهر كامل', '/prayer-times/month'], year: ['سنة كاملة', '/prayer-times/year'], governorates: ['المحافظات', '/governorates'], cities: ['المدن', '/cities'], search: ['بحث المدن', '/search/cities'] },
  } : {
    eyebrow: 'Interactive API playground', title: 'Test every request before integration', lead: 'Build the request visually, send it live, and inspect the full response and timing without writing code.',
    request: 'Request type', location: 'Location', parameters: 'Parameters', governorate: 'Governorate', city: 'City', date: 'Date', month: 'Month', year: 'Year', query: 'Search query',
    selectGov: 'Select governorate', selectCity: 'Select city', loadingCities: 'Loading cities...', send: 'Send request', sending: 'Sending...', copyUrl: 'Copy URL', copyJson: 'Copy JSON', copied: 'Copied',
    empty: 'The response will appear here after you send the request', ready: 'Ready to run', types: { today: ['Today', '/prayer-times/today'], date: ['Specific date', '/prayer-times'], month: ['Full month', '/prayer-times/month'], year: ['Full year', '/prayer-times/year'], governorates: ['Governorates', '/governorates'], cities: ['Cities', '/cities'], search: ['City search', '/search/cities'] },
  }

  const needsCity = ['today', 'date', 'month', 'year'].includes(requestType)
  const needsDate = requestType === 'date'
  const needsMonth = requestType === 'month'
  const needsYear = requestType === 'month' || requestType === 'year'

  const url = useMemo(() => {
    const params = new URLSearchParams()
    let path = '/api/v1'
    if (requestType === 'governorates') path += '/governorates'
    if (requestType === 'cities') { path += '/cities'; if (governorate) params.set('governorate', governorate) }
    if (requestType === 'search') { path += '/search/cities'; params.set('q', query) }
    if (requestType === 'today') { path += '/prayer-times/today'; params.set('city', city) }
    if (requestType === 'date') { path += '/prayer-times'; params.set('city', city); params.set('date', date) }
    if (requestType === 'month') { path += '/prayer-times/month'; params.set('city', city); params.set('month', String(month)); params.set('year', String(year)) }
    if (requestType === 'year') { path += '/prayer-times/year'; params.set('city', city); params.set('year', String(year)) }
    const suffix = params.toString(); return suffix ? `${path}?${suffix}` : path
  }, [requestType, governorate, city, date, month, year, query])

  useEffect(() => { fetch('/api/v1/governorates').then(r => r.json()).then(body => body.success && setGovernorates(body.data.governorates)).catch(() => undefined) }, [])
  useEffect(() => {
    if (!governorate) return setCities([])
    setLoadingCities(true)
    fetch(`/api/v1/cities?governorate=${encodeURIComponent(governorate)}`).then(r => r.json()).then(body => {
      if (!body.success) return
      setCities(body.data.cities); setCity(current => body.data.cities.some((item: City) => item.slug === current) ? current : (body.data.cities[0]?.slug ?? ''))
    }).finally(() => setLoadingCities(false))
  }, [governorate])

  async function runRequest() {
    setLoading(true); setResponse(null); setStatus(null); const started = performance.now()
    try { const res = await fetch(url); const body = await res.json(); setStatus(res.status); setResponse(body) }
    catch { setStatus(0); setResponse({ success: false, error: { code: 'NETWORK_ERROR', message: isArabic ? 'تعذر الاتصال بالخدمة' : 'Could not reach the service' } }) }
    finally { setElapsed(Math.round(performance.now() - started)); setLoading(false) }
  }

  async function copy(kind: 'url' | 'json') {
    const value = kind === 'url' ? `${window.location.origin}${url}` : JSON.stringify(response, null, 2)
    await navigator.clipboard.writeText(value); setCopied(kind); window.setTimeout(() => setCopied(null), 1600)
  }

  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><TerminalSquare size={16} /> {t.eyebrow}</span><h1 className="title-lg">{t.title}</h1><p className="lead">{t.lead}</p></div><span className="icon-box gold"><Braces size={24} /></span></div></section>
    <section className="page-content"><div className="container playground-layout">
      <div className="card playground-controls">
        <div className="control-section"><span className="control-label">01 · {t.request}</span><div className="request-tabs">{(Object.keys(t.types) as RequestType[]).map(key => { const Icon = requestIcons[key]; return <button key={key} className={`request-tab ${requestType === key ? 'active' : ''}`} onClick={() => { setRequestType(key); setResponse(null); setStatus(null) }}><Icon size={15} /> {t.types[key][0]}<span>{t.types[key][1]}</span></button> })}</div></div>

        {(needsCity || requestType === 'cities') && <div className="control-section"><span className="control-label">02 · {t.location}</span><div className="field-grid"><div className="field"><label htmlFor="pg-gov">{t.governorate}</label><div className="input-wrap"><MapPin className="input-icon" size={16} /><select id="pg-gov" className="form-control" value={governorate} onChange={e => setGovernorate(e.target.value)}><option value="">{t.selectGov}</option>{governorates.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>{needsCity && <div className="field"><label htmlFor="pg-city">{t.city}</label><div className="input-wrap"><ChevronDown className="input-icon" size={16} /><select id="pg-city" className="form-control" disabled={loadingCities} value={city} onChange={e => setCity(e.target.value)}><option value="">{loadingCities ? t.loadingCities : t.selectCity}</option>{cities.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>}</div></div>}

        {(needsDate || needsMonth || needsYear || requestType === 'search') && <div className="control-section"><span className="control-label">03 · {t.parameters}</span><div className="field-grid">{needsDate && <div className="field"><label htmlFor="pg-date">{t.date}</label><input id="pg-date" className="form-control" type="date" min="2026-01-01" max="2026-12-31" value={date} onChange={e => setDate(e.target.value)} /></div>}{needsMonth && <div className="field"><label htmlFor="pg-month">{t.month}</label><select id="pg-month" className="form-control" value={month} onChange={e => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Intl.DateTimeFormat(isArabic ? 'ar-IQ' : 'en', { month: 'long' }).format(new Date(2026, index, 1))}</option>)}</select></div>}{needsYear && <div className="field"><label htmlFor="pg-year">{t.year}</label><input id="pg-year" className="form-control" type="number" min="2020" max="2100" value={year} onChange={e => setYear(Number(e.target.value))} /></div>}{requestType === 'search' && <div className="field" style={{ gridColumn: '1 / -1' }}><label htmlFor="pg-query">{t.query}</label><input id="pg-query" className="form-control" value={query} maxLength={100} onChange={e => setQuery(e.target.value)} /></div>}</div></div>}

        <div className="control-section"><button className="btn btn-primary btn-lg w-full" disabled={loading || (needsCity && !city) || (requestType === 'search' && !query.trim())} onClick={runRequest}>{loading ? <LoaderCircle className="spin" size={19} /> : <Play size={19} />}{loading ? t.sending : t.send}</button></div>
      </div>

      <div className="console"><div className="console-url"><span className="method-get">GET</span><code>{url}</code><button className="btn btn-sm" onClick={() => copy('url')}><Copy size={14} /> {copied === 'url' ? t.copied : t.copyUrl}</button></div><div className="console-meta"><span>{status === null ? t.ready : <span className={status >= 200 && status < 300 ? 'badge badge-success' : 'badge badge-danger'}>{status || 'ERR'}</span>}</span><span>{elapsed !== null && `${elapsed} ms`}</span>{response !== null && <button className="btn btn-sm" onClick={() => copy('json')}><Code2 size={14} /> {copied === 'json' ? t.copied : t.copyJson}</button>}</div><div className="console-body">{response !== null ? <pre>{JSON.stringify(response, null, 2)}</pre> : <div className="console-empty"><div><Server size={34} /><p>{t.empty}</p></div></div>}</div></div>
    </div></section>
  </>
}
