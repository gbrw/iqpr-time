'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, ArrowLeft, ArrowRight, Braces, CalendarDays, Check, CheckCircle2, ChevronDown, CloudSun, Code2, Copy, Database, Globe2, LoaderCircle, MapPin, MoonStar, Search, ShieldCheck, Sparkles, Sun, Sunrise, Sunset, TerminalSquare, Zap } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

type Governorate = { id: number; name_ar: string; name_en: string; slug: string }
type City = { id: number; name_ar: string; name_en: string; slug: string }
type PrayerResult = { city: { name_ar: string; name_en: string; slug: string; governorate: { name_ar: string; name_en: string } }; date: string; prayer_times: Record<string, string> }

const prayerIcons = [AlarmClock, Sunrise, Sun, CloudSun, Sunset, MoonStar]
const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const todayInBaghdad = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' })

export default function HomePage() {
  const { isArabic } = useLanguage()
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [governorate, setGovernorate] = useState('baghdad')
  const [city, setCity] = useState('baghdad-center')
  const [date, setDate] = useState(todayInBaghdad)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PrayerResult | null>(null)
  const [copied, setCopied] = useState(false)

  const text = isArabic ? {
    eyebrow: 'الواجهة العراقية المفتوحة لمواقيت الصلاة', titleA: 'مواقيت دقيقة.', titleB: 'استعلام واحد بسيط.',
    lead: 'بيانات يومية موثّقة لـ121 مدينة عراقية، جاهزة للأشخاص والمطورين عبر واجهة سريعة وواضحة دون تسجيل.',
    try: 'جرّب الاستعلام', docs: 'اقرأ التوثيق', free: 'مجانية بالكامل', noAccount: 'لا تحتاج حساباً', timezone: 'بتوقيت بغداد',
    queryTitle: 'اعرف مواقيت مدينتك', querySub: 'اختر المكان والتاريخ لتحصل على النتيجة فوراً.', gov: 'المحافظة', city: 'المدينة', date: 'التاريخ',
    selectGov: 'اختر المحافظة', selectCity: 'اختر المدينة', loadingCities: 'جاري تحميل المدن...', search: 'عرض المواقيت', searching: 'جاري الاستعلام...',
    error: 'تعذر جلب البيانات. تحقق من اختياراتك وحاول مجدداً.', missing: 'اختر مدينة وتاريخاً صالحاً أولاً.', copy: 'نسخ رابط API', copied: 'تم النسخ', raw: 'فتح JSON',
    stats: [['19', 'محافظة عراقية'], ['121', 'مدينة وناحية'], ['44,165', 'سجل موثّق'], ['100', 'طلب في الدقيقة']],
    whyEyebrow: 'مصمّمة للوضوح والاعتمادية', whyTitle: 'كل ما تحتاجه، بدون تعقيد', whyLead: 'واجهة واحدة تخدم المستخدم العادي وتمنح المطور بيانات منظمة يمكن دمجها خلال دقائق.',
    features: [['بحث مرن', 'ابحث باسم المدينة العربي أو الإنجليزي أو استخدم المعرّف البرمجي مباشرة.'], ['استجابة موحّدة', 'صيغة JSON ثابتة وواضحة لليوم أو الشهر أو السنة الكاملة.'], ['حماية واستقرار', 'تحديد ذكي لمعدل الطلبات مع ترويسات أمان وCORS مفتوح.'], ['توقيت صحيح', 'كل التواريخ والأوقات مضبوطة على منطقة Asia/Baghdad.'], ['توثيق تفاعلي', 'أمثلة جاهزة وSwagger ومختبر كامل لتجربة كل نقطة اتصال.'], ['بيانات مدققة', 'فحوص للصيغة والتسلسل والاكتمال قبل نشر كل نسخة بيانات.']],
    devEyebrow: 'للمطورين', devTitle: 'أضف المواقيت إلى تطبيقك خلال دقائق', devLead: 'طلب GET واحد يعيد بيانات المدينة والتاريخ ومواقيت الصلوات الست بصيغة JSON مستقرة.', devCta: 'افتح دليل المطور', codeLabel: 'JavaScript · fetch',
    prayer: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' },
  } : {
    eyebrow: 'The open Iraqi prayer times interface', titleA: 'Accurate times.', titleB: 'One simple request.',
    lead: 'Verified daily data for 121 Iraqi cities, ready for people and developers through a fast, clear API with no signup.',
    try: 'Try the query', docs: 'Read the docs', free: 'Completely free', noAccount: 'No account needed', timezone: 'Baghdad time',
    queryTitle: 'Find prayer times', querySub: 'Choose a place and date to get an instant result.', gov: 'Governorate', city: 'City', date: 'Date',
    selectGov: 'Select governorate', selectCity: 'Select city', loadingCities: 'Loading cities...', search: 'Show prayer times', searching: 'Running query...',
    error: 'We could not load the data. Check your selections and try again.', missing: 'Select a city and a valid date first.', copy: 'Copy API URL', copied: 'Copied', raw: 'Open JSON',
    stats: [['19', 'Governorates'], ['121', 'Cities & districts'], ['44,165', 'Verified records'], ['100', 'Requests per minute']],
    whyEyebrow: 'Built for clarity and reliability', whyTitle: 'Everything you need, without the friction', whyLead: 'One interface works for everyday visitors and gives developers structured data they can integrate in minutes.',
    features: [['Flexible search', 'Find a city by its Arabic or English name, or use its developer-friendly slug.'], ['Consistent responses', 'Stable JSON for a single day, full month, or an entire year.'], ['Safe and reliable', 'Smart rate limiting, security headers, and open CORS support.'], ['Correct timezone', 'All dates and times are aligned to the Asia/Baghdad timezone.'], ['Interactive docs', 'Ready examples, Swagger, and a complete playground for every endpoint.'], ['Validated data', 'Format, chronology, completeness, and duplicate checks before release.']],
    devEyebrow: 'For developers', devTitle: 'Add prayer times to your app in minutes', devLead: 'A single GET request returns the city, date, and six daily times in stable JSON.', devCta: 'Open developer guide', codeLabel: 'JavaScript · fetch',
    prayer: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  }

  const apiUrl = useMemo(() => `/api/v1/prayer-times?city=${encodeURIComponent(city)}&date=${date}`, [city, date])

  useEffect(() => {
    fetch('/api/v1/governorates').then(r => r.json()).then(body => { if (body.success) setGovernorates(body.data.governorates) }).catch(() => setError(isArabic ? 'تعذر تحميل المحافظات.' : 'Could not load governorates.'))
  }, [isArabic])

  useEffect(() => {
    if (!governorate) return
    setLoadingCities(true)
    fetch(`/api/v1/cities?governorate=${encodeURIComponent(governorate)}`).then(r => r.json()).then(body => {
      if (!body.success) throw new Error()
      setCities(body.data.cities)
      setCity(current => body.data.cities.some((item: City) => item.slug === current) ? current : (body.data.cities[0]?.slug ?? ''))
    }).catch(() => setError(isArabic ? 'تعذر تحميل المدن.' : 'Could not load cities.')).finally(() => setLoadingCities(false))
  }, [governorate, isArabic])

  async function submitQuery(event: React.FormEvent) {
    event.preventDefault(); setError(''); setResult(null)
    if (!city || !date) return setError(text.missing)
    setLoading(true)
    try {
      const response = await fetch(apiUrl); const body = await response.json()
      if (!response.ok || !body.success) throw new Error()
      setResult(body.data)
    } catch { setError(text.error) } finally { setLoading(false) }
  }

  async function copyApiUrl() {
    await navigator.clipboard.writeText(`${window.location.origin}${apiUrl}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800)
  }

  const featureIcons = [Search, Braces, ShieldCheck, Globe2, TerminalSquare, Database]
  const Arrow = isArabic ? ArrowLeft : ArrowRight
  const codeSample = "const response = await fetch(\n  '/api/v1/prayer-times/today?city=baghdad-center'\n)\n\nconst { data } = await response.json()\nconsole.log(data.prayer_times.fajr) // 03:32"

  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={16} /> {text.eyebrow}</span><h1 className="title-xl">{text.titleA}<br /><span>{text.titleB}</span></h1><p className="lead">{text.lead}</p><div className="hero-actions"><a href="#query" className="btn btn-primary btn-lg">{text.try} <Arrow size={18} /></a><Link href="/docs" className="btn btn-secondary btn-lg"><Code2 size={18} /> {text.docs}</Link></div><div className="trust-row"><span><CheckCircle2 size={16} /> {text.free}</span><span><CheckCircle2 size={16} /> {text.noAccount}</span><span><CheckCircle2 size={16} /> {text.timezone}</span></div></div>
      <div className="query-card" id="query"><div className="query-card-inner"><div className="query-head"><div><h2 className="title-md">{text.queryTitle}</h2><p>{text.querySub}</p></div><span className="icon-box gold"><MapPin size={21} /></span></div>
        <form className="query-form" onSubmit={submitQuery}><div className="query-row">
          <div className="field"><label htmlFor="home-governorate">{text.gov}</label><div className="input-wrap"><MapPin className="input-icon" size={17} /><select id="home-governorate" className="form-control" value={governorate} onChange={e => { setGovernorate(e.target.value); setResult(null) }}><option value="">{text.selectGov}</option>{governorates.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
          <div className="field"><label htmlFor="home-city">{text.city}</label><div className="input-wrap"><ChevronDown className="input-icon" size={17} /><select id="home-city" className="form-control" value={city} disabled={loadingCities || !cities.length} onChange={e => { setCity(e.target.value); setResult(null) }}><option value="">{loadingCities ? text.loadingCities : text.selectCity}</option>{cities.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
        </div><div className="field"><label htmlFor="home-date">{text.date}</label><div className="input-wrap"><CalendarDays className="input-icon" size={17} /><input id="home-date" type="date" className="form-control" value={date} onChange={e => { setDate(e.target.value); setResult(null) }} min="2026-01-01" max="2026-12-31" /></div></div>{error && <div className="query-error"><ShieldCheck size={16} /> {error}</div>}<button className="btn btn-primary btn-lg w-full" disabled={loading || loadingCities}>{loading ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}{loading ? text.searching : text.search}</button></form>
        {result && <div className="result-panel"><div className="result-head"><div><strong>{isArabic ? result.city.name_ar : result.city.name_en}</strong><small>{result.date} · {isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en}</small></div><span className="badge badge-success"><Check size={14} /> 200 OK</span></div><div className="prayer-grid">{prayerKeys.map((key, index) => { const Icon = prayerIcons[index]; return <div className="prayer-item" key={key}><Icon size={17} /><span>{text.prayer[key as keyof typeof text.prayer]}</span><strong>{result.prayer_times[key]}</strong></div> })}</div><div className="result-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={copyApiUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? text.copied : text.copy}</button><a className="btn btn-ghost btn-sm" href={apiUrl} target="_blank" rel="noreferrer"><Braces size={15} /> {text.raw}</a></div></div>}
      </div></div>
    </div></section>
    <section className="section section-soft"><div className="container stats-grid">{text.stats.map(([number, label]) => <div className="card stat" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></section>
    <section className="section"><div className="container"><div className="section-heading center"><span className="eyebrow"><Zap size={16} /> {text.whyEyebrow}</span><h2 className="title-lg">{text.whyTitle}</h2><p className="lead">{text.whyLead}</p></div><div className="features-grid">{text.features.map(([title, description], index) => { const Icon = featureIcons[index]; return <article className="card feature-card" key={title}><span className={`icon-box ${index % 3 === 1 ? 'gold' : ''}`}><Icon size={21} /></span><h3>{title}</h3><p>{description}</p></article> })}</div></div></section>
    <section className="section section-soft"><div className="container developer-panel"><div className="developer-copy"><span className="eyebrow" style={{ color: '#7ed8ca' }}><Braces size={16} /> {text.devEyebrow}</span><h2 className="title-lg">{text.devTitle}</h2><p>{text.devLead}</p><Link href="/docs" className="btn btn-primary">{text.devCta} <Arrow size={17} /></Link></div><div className="developer-code"><div className="code-toolbar"><span>{text.codeLabel}</span><span className="badge">GET</span></div><pre className="code-block"><code>{codeSample}</code></pre></div></div></section>
  </>
}
