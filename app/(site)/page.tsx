'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, ArrowLeft, ArrowRight, Braces, CalendarDays, Check, CheckCircle2, ChevronDown, CloudSun, Code2, Copy, Database, Globe2, LoaderCircle, LocateFixed, MapPin, MoonStar, Search, Share2, ShieldCheck, Sparkles, Sun, Sunrise, Sunset, TerminalSquare, Zap } from 'lucide-react'
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
  const [resultCopied, setResultCopied] = useState(false)
  const [locating, setLocating] = useState(false)
  const [sharingStory, setSharingStory] = useState(false)

  const text = isArabic ? {
    eyebrow: 'الواجهة العراقية المفتوحة لمواقيت الصلاة', titleA: 'مواقيت دقيقة.', titleB: 'استعلام واحد بسيط.',
    lead: 'بيانات يومية موثّقة لـ121 مدينة عراقية، جاهزة للأشخاص والمطورين عبر واجهة سريعة وواضحة دون تسجيل.',
    try: 'جرّب الاستعلام', docs: 'اقرأ التوثيق', free: 'مجانية بالكامل', noAccount: 'لا تحتاج حساباً', timezone: 'بتوقيت بغداد',
    queryTitle: 'اعرف مواقيت مدينتك', querySub: 'اختر المكان والتاريخ لتحصل على النتيجة فوراً.', gov: 'المحافظة', city: 'المدينة', date: 'التاريخ',
    selectGov: 'اختر المحافظة', selectCity: 'اختر المدينة', loadingCities: 'جاري تحميل المدن...', search: 'عرض المواقيت', searching: 'جاري الاستعلام...',
    error: 'تعذر جلب البيانات. تحقق من اختياراتك وحاول مجدداً.', missing: 'اختر مدينة وتاريخاً صالحاً أولاً.', copy: 'نسخ رابط API', copied: 'تم النسخ', raw: 'فتح JSON', useLocation: 'استخدم موقعي', locating: 'جارٍ تحديد موقعك...', locationError: 'تعذر تحديد أقرب مدينة. تأكد من السماح للموقع ثم حاول مجدداً.', share: 'مشاركة كصورة', sharing: 'جاري تجهيز الصورة...', copyTimes: 'نسخ المواقيت', timesCopied: 'تم نسخ المواقيت', prayerTimesFor: 'مواقيت الصلاة في',
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
    error: 'We could not load the data. Check your selections and try again.', missing: 'Select a city and a valid date first.', copy: 'Copy API URL', copied: 'Copied', raw: 'Open JSON', useLocation: 'Use my location', locating: 'Locating...', locationError: 'Could not find the nearest city. Allow location access and try again.', share: 'Share as story image', sharing: 'Preparing image...', copyTimes: 'Copy prayer times', timesCopied: 'Prayer times copied', prayerTimesFor: 'Prayer times for',
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
    const normalizedGovernorate = governorate.trim().toLowerCase()
    if (!normalizedGovernorate) {
      setCities([])
      setCity('')
      return
    }

    setLoadingCities(true)
    setError('')

    fetch(`/api/v1/cities?governorate=${encodeURIComponent(normalizedGovernorate)}`, { cache: 'no-store' })
      .then(async r => {
        const body = await r.json()
        if (!r.ok || !body.success) {
          throw new Error(body?.error?.message || 'Could not load cities')
        }
        return body
      })
      .then(body => {
        const nextCities: City[] = Array.isArray(body?.data?.cities) ? body.data.cities : []
        setCities(nextCities)
        setCity(current => nextCities.some(item => item.slug === current) ? current : (nextCities[0]?.slug ?? ''))
      })
      .catch(err => {
        console.error('[home/cities]', { governorate: normalizedGovernorate, error: err })
        setCities([])
        setCity('')
        setError(isArabic ? 'تعذر تحميل المدن.' : 'Could not load cities.')
      })
      .finally(() => setLoadingCities(false))
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


  function formatResultDate(value: string) {
    const parsed = new Date(`${value}T00:00:00`)
    return parsed.toLocaleDateString(isArabic ? 'ar-IQ' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  function formatHijriDate(value: string) {
    const parsed = new Date(`${value}T00:00:00`)
    return new Intl.DateTimeFormat(
      isArabic ? 'ar-IQ-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura',
      { year: 'numeric', month: 'long', day: 'numeric' }
    ).format(parsed)
  }



  function getShareTimeParts(value: string) {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
    if (!match) return { time: value, period: '' }
    let hour = Number(match[1])
    const minute = match[2]
    const period = hour >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM')
    hour = hour % 12 || 12
    return { time: `${hour}:${minute}`, period }
  }

  function formatShareTime(value: string) {
    const { time, period } = getShareTimeParts(value)
    return isArabic && period ? `${period} ${time}` : `${time} ${period}`.trim()
  }

  function buildShareText() {
    if (!result) return ''
    const cityName = isArabic ? result.city.name_ar : result.city.name_en
    const governorateName = isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en
    const lines = prayerKeys.map(key => `${text.prayer[key as keyof typeof text.prayer]}: ${formatShareTime(result.prayer_times[key])}`)
    return `${isArabic ? 'مواقيت الصلاة لهذا اليوم' : 'Prayer times for today'}
${isArabic ? 'المحافظة' : 'Governorate'}: ${governorateName}
${isArabic ? 'المدينة' : 'City'}: ${cityName}
${isArabic ? 'الميلادي' : 'Gregorian'}: ${formatResultDate(result.date)}
${isArabic ? 'الهجري' : 'Hijri'}: ${formatHijriDate(result.date)}

${lines.join('\n')}

${isArabic ? 'شارك الأجر بنشر مواقيت الصلاة' : 'Share the prayer times'}
${window.location.origin}`
  }

  async function copyPrayerTimes() {
    if (!result) return
    await navigator.clipboard.writeText(buildShareText())
    setResultCopied(true)
    window.setTimeout(() => setResultCopied(false), 1800)
  }

  function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + width, y, x + width, y + height, r)
    ctx.arcTo(x + width, y + height, x, y + height, r)
    ctx.arcTo(x, y + height, x, y, r)
    ctx.arcTo(x, y, x + width, y, r)
    ctx.closePath()
  }

  function drawCenteredText(ctx: CanvasRenderingContext2D, value: string, y: number, font: string, color: string) {
    ctx.save()
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = isArabic ? 'rtl' : 'ltr'
    ctx.fillText(value, 540, y)
    ctx.restore()
  }

  async function createStoryImageBlob() {
    if (!result) throw new Error('No result')

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not supported')

    try {
      await document.fonts.load('700 60px "IBM Plex Sans Arabic"')
      await document.fonts.load('500 32px "IBM Plex Sans Arabic"')
    } catch {}

    const fontFamily = '"IBM Plex Sans Arabic", Arial, sans-serif'
    const cityName = isArabic ? result.city.name_ar : result.city.name_en
    const governorateName = isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en
    const gregorianDate = formatResultDate(result.date)
    const hijriDate = formatHijriDate(result.date)

    const bg = ctx.createLinearGradient(0, 0, 1080, 1920)
    bg.addColorStop(0, '#edf7f4')
    bg.addColorStop(.52, '#fbfdfc')
    bg.addColorStop(1, '#e8f3f0')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1080, 1920)

    ctx.globalAlpha = .38
    ctx.fillStyle = '#c9e8e0'
    ctx.beginPath(); ctx.arc(955, 125, 235, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f3dfad'
    ctx.beginPath(); ctx.arc(80, 1790, 190, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    roundedRect(ctx, 390, 74, 300, 72, 36)
    ctx.fillStyle = '#dff3ee'; ctx.fill()
    drawCenteredText(ctx, 'IQPR Time', 110, `700 37px ${fontFamily}`, '#073f40')
    drawCenteredText(ctx, isArabic ? 'مواقيت الصلاة لهذا اليوم' : 'Prayer times for today', 220, `700 56px ${fontFamily}`, '#0b3334')

    roundedRect(ctx, 70, 295, 940, 355, 42)
    ctx.fillStyle = '#ffffff'; ctx.fill()
    ctx.strokeStyle = '#d3e6e1'; ctx.lineWidth = 3; ctx.stroke()

    const infoRows = isArabic
      ? [
          ['المحافظة', governorateName],
          ['المدينة', cityName],
          ['الميلادي', gregorianDate],
          ['الهجري', hijriDate],
        ]
      : [
          ['Governorate', governorateName],
          ['City', cityName],
          ['Gregorian', gregorianDate],
          ['Hijri', hijriDate],
        ]

    infoRows.forEach(([label, value], index) => {
      const y = 355 + index * 72
      ctx.save()
      ctx.textBaseline = 'middle'
      if (isArabic) {
        ctx.direction = 'rtl'
        ctx.textAlign = 'right'
        ctx.font = `600 27px ${fontFamily}`
        ctx.fillStyle = '#78908e'
        ctx.fillText(label, 925, y)
        ctx.font = `700 33px ${fontFamily}`
        ctx.fillStyle = '#123f40'
        ctx.fillText(value, 755, y)
      } else {
        ctx.direction = 'ltr'
        ctx.textAlign = 'left'
        ctx.font = `600 27px ${fontFamily}`
        ctx.fillStyle = '#78908e'
        ctx.fillText(label, 155, y)
        ctx.font = `700 33px ${fontFamily}`
        ctx.fillStyle = '#123f40'
        ctx.fillText(value, 330, y)
      }
      ctx.restore()

      if (index < infoRows.length - 1) {
        ctx.strokeStyle = '#e7f0ed'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(120, y + 36)
        ctx.lineTo(960, y + 36)
        ctx.stroke()
      }
    })

    const startY = 715
    const rowH = 137
    prayerKeys.forEach((key, index) => {
      const y = startY + index * rowH
      roundedRect(ctx, 70, y, 940, 108, 26)
      ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f5faf8'
      ctx.fill()
      ctx.strokeStyle = '#dae9e5'
      ctx.lineWidth = 2
      ctx.stroke()

      const prayerName = text.prayer[key as keyof typeof text.prayer]
      const { time, period } = getShareTimeParts(result.prayer_times[key])

      ctx.save()
      ctx.textBaseline = 'middle'
      if (isArabic) {
        ctx.direction = 'rtl'
        ctx.textAlign = 'right'
        ctx.font = `700 38px ${fontFamily}`
        ctx.fillStyle = '#173f40'
        ctx.fillText(prayerName, 915, y + 54)

        ctx.direction = 'ltr'
        ctx.textAlign = 'left'
        ctx.font = `700 33px ${fontFamily}`
        ctx.fillStyle = '#0d7c75'
        ctx.fillText(period, 135, y + 54)

        ctx.font = `700 45px ${fontFamily}`
        ctx.fillText(time, 205, y + 54)
      } else {
        ctx.direction = 'ltr'
        ctx.textAlign = 'left'
        ctx.font = `700 38px ${fontFamily}`
        ctx.fillStyle = '#173f40'
        ctx.fillText(prayerName, 135, y + 54)

        ctx.textAlign = 'right'
        ctx.font = `700 45px ${fontFamily}`
        ctx.fillStyle = '#0d7c75'
        ctx.fillText(`${time} ${period}`, 915, y + 54)
      }
      ctx.restore()
    })

    roundedRect(ctx, 260, 1605, 560, 84, 42)
    ctx.fillStyle = '#0d7c75'
    ctx.fill()
    drawCenteredText(ctx, 'iqpr-time-neon.vercel.app', 1647, `700 28px ${fontFamily}`, '#ffffff')

    drawCenteredText(ctx, isArabic ? 'شارك الأجر بنشر مواقيت الصلاة' : 'Share the prayer times', 1760, `600 31px ${fontFamily}`, '#476e6b')

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create image')), 'image/png', 1)
    })
  }

  async function sharePrayerTimes() {
    if (!result || sharingStory) return
    setSharingStory(true)
    try {
      const blob = await createStoryImageBlob()
      const citySlug = result.city.slug || 'prayer-times'
      const file = new File([blob], `iqpr-${citySlug}-${result.date}.png`, { type: 'image/png' })
      const title = `${text.prayerTimesFor} ${isArabic ? result.city.name_ar : result.city.name_en}`

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title, text: title })
          return
        } catch (err) {
          if ((err as DOMException)?.name === 'AbortError') return
        }
      }

      // Fallback: download the ready-to-share story image.
      const imageUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1500)
    } finally {
      setSharingStory(false)
    }
  }

  async function useMyLocation() {
    if (!('geolocation' in navigator)) return setError(text.locationError)
    setError('')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const { latitude, longitude } = position.coords
        const response = await fetch(`/api/v1/location/nearest?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`, { cache: 'no-store' })
        const body = await response.json()
        if (!response.ok || !body.success || !body.data?.city) throw new Error()
        const nextGovernorate = body.data.city.governorate_slug
        const nextCity = body.data.city.slug
        setGovernorate(nextGovernorate)
        setCity(nextCity)
        setResult(null)
      } catch {
        setError(text.locationError)
      } finally {
        setLocating(false)
      }
    }, () => {
      setError(text.locationError)
      setLocating(false)
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 })
  }

  const featureIcons = [Search, Braces, ShieldCheck, Globe2, TerminalSquare, Database]
  const Arrow = isArabic ? ArrowLeft : ArrowRight
  const codeSample = "const response = await fetch(\n  '/api/v1/prayer-times/today?city=baghdad-center'\n)\n\nconst { data } = await response.json()\nconsole.log(data.prayer_times.fajr) // 03:32"

  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={16} /> {text.eyebrow}</span><h1 className="title-xl">{text.titleA}<br /><span>{text.titleB}</span></h1><p className="lead">{text.lead}</p><div className="hero-actions"><a href="#query" className="btn btn-primary btn-lg">{text.try} <Arrow size={18} /></a><Link href="/docs" className="btn btn-secondary btn-lg"><Code2 size={18} /> {text.docs}</Link></div><div className="trust-row"><span><CheckCircle2 size={16} /> {text.free}</span><span><CheckCircle2 size={16} /> {text.noAccount}</span><span><CheckCircle2 size={16} /> {text.timezone}</span></div></div>
      <div className="query-card" id="query"><div className="query-card-inner"><div className="query-head"><div><h2 className="title-md">{text.queryTitle}</h2><p>{text.querySub}</p></div><div className="query-head-actions"><button type="button" className="btn btn-secondary btn-sm location-btn" onClick={useMyLocation} disabled={locating}>{locating ? <LoaderCircle className="spin" size={16} /> : <LocateFixed size={16} />}{locating ? text.locating : text.useLocation}</button><span className="icon-box gold"><MapPin size={21} /></span></div></div>
        <form className="query-form" onSubmit={submitQuery}><div className="query-row">
          <div className="field"><label htmlFor="home-governorate">{text.gov}</label><div className="input-wrap"><MapPin className="input-icon" size={17} /><select id="home-governorate" className="form-control" value={governorate} onChange={e => { setGovernorate(e.target.value); setResult(null) }}><option value="">{text.selectGov}</option>{governorates.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
          <div className="field"><label htmlFor="home-city">{text.city}</label><div className="input-wrap"><ChevronDown className="input-icon" size={17} /><select id="home-city" className="form-control" value={city} disabled={loadingCities || !cities.length} onChange={e => { setCity(e.target.value); setResult(null) }}><option value="">{loadingCities ? text.loadingCities : text.selectCity}</option>{cities.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
        </div><div className="field"><label htmlFor="home-date">{text.date}</label><div className="date-picker-wrap"><div className="date-display" aria-hidden="true"><CalendarDays size={17} /><span>{date ? new Date(`${date}T00:00:00`).toLocaleDateString(isArabic ? 'ar-IQ' : 'en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : text.date}</span></div><input id="home-date" type="date" className="date-native-input" value={date} onChange={e => { setDate(e.target.value); setResult(null) }} min="2026-01-01" max="2026-12-31" aria-label={text.date} /></div></div>{error && <div className="query-error"><ShieldCheck size={16} /> {error}</div>}<button className="btn btn-primary btn-lg w-full" disabled={loading || loadingCities}>{loading ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}{loading ? text.searching : text.search}</button></form>
        {result && <div className="result-panel"><div className="result-context"><div className="result-context-icon"><MapPin size={19} /></div><div><span>{text.prayerTimesFor}</span><strong>{isArabic ? result.city.name_ar : result.city.name_en}</strong><small>{isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en} · {formatResultDate(result.date)}</small></div></div><div className="prayer-grid">{prayerKeys.map((key, index) => { const Icon = prayerIcons[index]; return <div className="prayer-item" key={key}><Icon size={17} /><span>{text.prayer[key as keyof typeof text.prayer]}</span><strong>{result.prayer_times[key]}</strong></div> })}</div><div className="result-actions primary-actions"><button type="button" className="btn btn-primary btn-sm" onClick={sharePrayerTimes} disabled={sharingStory}>{sharingStory ? <LoaderCircle className="spin" size={15} /> : <Share2 size={15} />} {sharingStory ? text.sharing : text.share}</button><button type="button" className="btn btn-secondary btn-sm" onClick={copyPrayerTimes}>{resultCopied ? <Check size={15} /> : <Copy size={15} />}{resultCopied ? text.timesCopied : text.copyTimes}</button></div><div className="result-actions secondary-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={copyApiUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? text.copied : text.copy}</button><a className="btn btn-ghost btn-sm" href={apiUrl} target="_blank" rel="noreferrer"><Braces size={15} /> {text.raw}</a></div></div>}
      </div></div>
    </div></section>
    <section className="section section-soft"><div className="container stats-grid">{text.stats.map(([number, label]) => <div className="card stat" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></section>
    <section className="section"><div className="container"><div className="section-heading center"><span className="eyebrow"><Zap size={16} /> {text.whyEyebrow}</span><h2 className="title-lg">{text.whyTitle}</h2><p className="lead">{text.whyLead}</p></div><div className="features-grid">{text.features.map(([title, description], index) => { const Icon = featureIcons[index]; return <article className="card feature-card" key={title}><span className={`icon-box ${index % 3 === 1 ? 'gold' : ''}`}><Icon size={21} /></span><h3>{title}</h3><p>{description}</p></article> })}</div></div></section>
    <section className="section section-soft"><div className="container developer-panel"><div className="developer-copy"><span className="eyebrow" style={{ color: '#7ed8ca' }}><Braces size={16} /> {text.devEyebrow}</span><h2 className="title-lg">{text.devTitle}</h2><p>{text.devLead}</p><Link href="/docs" className="btn btn-primary">{text.devCta} <Arrow size={17} /></Link></div><div className="developer-code"><div className="code-toolbar"><span>{text.codeLabel}</span><span className="badge">GET</span></div><pre className="code-block"><code>{codeSample}</code></pre></div></div></section>
  </>
}
