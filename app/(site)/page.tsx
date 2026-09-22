'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlarmClock, ArrowLeft, ArrowRight, Braces, CalendarDays, CalendarRange, Check, CheckCircle2, ChevronDown, CloudSun, Code2, Copy, Database, Globe2, LoaderCircle, LocateFixed, MapPin, MoonStar, Search, Share2, ShieldCheck, Sparkles, Sun, Sunrise, Sunset, Table2, TerminalSquare, Zap } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

type Governorate = { id: number; name_ar: string; name_en: string; slug: string }
type City = { id: number; name_ar: string; name_en: string; slug: string }
type PrayerResult = { city: { name_ar: string; name_en: string; slug: string; governorate: { name_ar: string; name_en: string } }; date: string; prayer_times: Record<string, string> }
type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
type WeekDay = { date: string; fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string }
type WeekResult = { city: PrayerResult['city']; start_date: string; end_date: string; count: number; days: WeekDay[] }

const prayerIcons = [AlarmClock, Sunrise, Sun, CloudSun, Sunset, MoonStar]
const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const todayInBaghdad = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' })

export default function HomePage() {
  const { isArabic } = useLanguage()
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [governorate, setGovernorate] = useState('baghdad')
  const [city, setCity] = useState('baghdad-center')
  const [date, setDate] = useState(todayInBaghdad)
  const pendingLocationCityRef = useRef<string | null>(null)
  const [locationSelectionVersion, setLocationSelectionVersion] = useState(0)
  const [storageHydrated, setStorageHydrated] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PrayerResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)
  const [locating, setLocating] = useState(false)
  const [sharingStory, setSharingStory] = useState(false)
  const [weekResult, setWeekResult] = useState<WeekResult | null>(null)
  const [loadingWeek, setLoadingWeek] = useState(false)
  const [weekError, setWeekError] = useState('')
  const [weekImageUrl, setWeekImageUrl] = useState('')
  const [sharingWeek, setSharingWeek] = useState(false)

  const text = isArabic ? {
    eyebrow: 'الواجهة العراقية المفتوحة لمواقيت الصلاة', titleA: 'مواقيت دقيقة.', titleB: 'استعلام واحد بسيط.',
    lead: 'بيانات يومية موثّقة لـ121 مدينة عراقية، جاهزة للأشخاص والمطورين عبر واجهة سريعة وواضحة دون تسجيل.',
    try: 'جرّب الاستعلام', docs: 'اقرأ التوثيق', free: 'مجانية بالكامل', noAccount: 'لا تحتاج حساباً', timezone: 'بتوقيت بغداد',
    queryTitle: 'اعرف مواقيت مدينتك', querySub: 'اختر المكان والتاريخ لتحصل على النتيجة فوراً.', gov: 'المحافظة', city: 'المدينة', date: 'التاريخ',
    selectGov: 'اختر المحافظة', selectCity: 'اختر المدينة', loadingCities: 'جاري تحميل المدن...', search: 'عرض المواقيت', searching: 'جاري الاستعلام...',
    error: 'تعذر جلب البيانات. تحقق من اختياراتك وحاول مجدداً.', missing: 'اختر مدينة وتاريخاً صالحاً أولاً.', copy: 'نسخ رابط API', copied: 'تم النسخ', raw: 'فتح JSON', useLocation: 'استخدم موقعي', locating: 'جارٍ تحديد موقعك...', locationError: 'تعذر تحديد أقرب مدينة. تأكد من السماح للموقع ثم حاول مجدداً.', share: 'مشاركة كصورة', sharing: 'جاري تجهيز الصورة...', copyTimes: 'نسخ المواقيت', timesCopied: 'تم نسخ المواقيت', prayerTimesFor: 'مواقيت الصلاة في', weekTitle: 'مواقيت الصلاة لهذا الأسبوع', weekSub: 'من الأحد إلى السبت', weekLoading: 'جاري تحميل الأسبوع...', weekError: 'تعذر تحميل مواقيت الأسبوع.', gregorian: 'ميلادي', hijri: 'هجري', weekShare: 'مشاركة الأسبوع كصورة', weekSave: 'حفظ صورة الأسبوع', weekPreparing: 'جاري تجهيز صورة الأسبوع...',
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
    error: 'We could not load the data. Check your selections and try again.', missing: 'Select a city and a valid date first.', copy: 'Copy API URL', copied: 'Copied', raw: 'Open JSON', useLocation: 'Use my location', locating: 'Locating...', locationError: 'Could not find the nearest city. Allow location access and try again.', share: 'Share as story image', sharing: 'Preparing image...', copyTimes: 'Copy prayer times', timesCopied: 'Prayer times copied', prayerTimesFor: 'Prayer times for', weekTitle: 'Prayer times for this week', weekSub: 'Sunday through Saturday', weekLoading: 'Loading week...', weekError: 'Could not load weekly prayer times.', gregorian: 'Gregorian', hijri: 'Hijri', weekShare: 'Share week as image', weekSave: 'Save weekly image', weekPreparing: 'Preparing weekly image...',
    stats: [['19', 'Governorates'], ['121', 'Cities & districts'], ['44,165', 'Verified records'], ['100', 'Requests per minute']],
    whyEyebrow: 'Built for clarity and reliability', whyTitle: 'Everything you need, without the friction', whyLead: 'One interface works for everyday visitors and gives developers structured data they can integrate in minutes.',
    features: [['Flexible search', 'Find a city by its Arabic or English name, or use its developer-friendly slug.'], ['Consistent responses', 'Stable JSON for a single day, full month, or an entire year.'], ['Safe and reliable', 'Smart rate limiting, security headers, and open CORS support.'], ['Correct timezone', 'All dates and times are aligned to the Asia/Baghdad timezone.'], ['Interactive docs', 'Ready examples, Swagger, and a complete playground for every endpoint.'], ['Validated data', 'Format, chronology, completeness, and duplicate checks before release.']],
    devEyebrow: 'For developers', devTitle: 'Add prayer times to your app in minutes', devLead: 'A single GET request returns the city, date, and six daily times in stable JSON.', devCta: 'Open developer guide', codeLabel: 'JavaScript · fetch',
    prayer: { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  }

  const apiUrl = useMemo(() => `/api/v1/prayer-times?city=${encodeURIComponent(city)}&date=${date}`, [city, date])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('iqpr:last-location')

      if (saved) {
        const parsed = JSON.parse(saved) as {
          governorate?: string
          city?: string
        }

        if (parsed.governorate) {
          if (parsed.city) {
            pendingLocationCityRef.current = parsed.city
          }

          setCity('')
          setGovernorate(parsed.governorate)
          setLocationSelectionVersion(version => version + 1)
        }
      }
    } catch {
      // Ignore invalid/stale localStorage values.
    } finally {
      setStorageHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!storageHydrated) return
    if (!governorate || !city) return
    if (loadingCities) return
    if (!cities.some(item => item.slug === city)) return

    try {
      window.localStorage.setItem(
        'iqpr:last-location',
        JSON.stringify({ governorate, city })
      )
    } catch {}
  }, [storageHydrated, governorate, city, cities, loadingCities])

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

        const requestedCity = pendingLocationCityRef.current
        if (requestedCity && nextCities.some(item => item.slug === requestedCity)) {
          setCity(requestedCity)
          pendingLocationCityRef.current = null
          return
        }

        setCity(current =>
          nextCities.some(item => item.slug === current)
            ? current
            : (nextCities[0]?.slug ?? '')
        )
      })
      .catch(err => {
        console.error('[home/cities]', { governorate: normalizedGovernorate, error: err })
        setCities([])
        setCity('')
        setError(isArabic ? 'تعذر تحميل المدن.' : 'Could not load cities.')
      })
      .finally(() => setLoadingCities(false))
  }, [governorate, isArabic, locationSelectionVersion])

  useEffect(() => {
    let cancelled = false
    let objectUrl = ''

    if (!weekResult) {
      setWeekImageUrl('')
      return
    }

    createWeeklyImageBlob()
      .then(blob => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setWeekImageUrl(objectUrl)
      })
      .catch(() => setWeekImageUrl(''))

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [weekResult, isArabic])

  async function loadWeek(selectedCity: string, selectedDate: string) {
    if (!selectedCity || !selectedDate) return
    setLoadingWeek(true)
    setWeekError('')
    setWeekResult(null)
    try {
      const response = await fetch(`/api/v1/prayer-times/week?city=${encodeURIComponent(selectedCity)}&date=${selectedDate}`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok || !body.success) throw new Error()
      setWeekResult(body.data)
    } catch {
      setWeekError(text.weekError)
    } finally {
      setLoadingWeek(false)
    }
  }

  async function submitQuery(event: React.FormEvent) {
    event.preventDefault(); setError(''); setResult(null)
    if (!city || !date) return setError(text.missing)
    setLoading(true)
    try {
      const response = await fetch(apiUrl); const body = await response.json()
      if (!response.ok || !body.success) throw new Error()
      setResult(body.data)
      void loadWeek(city, date)
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



  function formatWeekDay(value: string) {
    const parsed = new Date(`${value}T00:00:00`)
    return parsed.toLocaleDateString(isArabic ? 'ar-IQ' : 'en-GB', { weekday: 'short' })
  }

  function formatShortGregorian(value: string) {
    const parsed = new Date(`${value}T00:00:00`)
    return parsed.toLocaleDateString(isArabic ? 'ar-IQ' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatShortHijri(value: string) {
    const parsed = new Date(`${value}T00:00:00`)
    return new Intl.DateTimeFormat(isArabic ? 'ar-IQ-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
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
      await document.fonts.load('500 28px "IBM Plex Sans Arabic"')
    } catch {}

    const fontFamily = '"IBM Plex Sans Arabic", Arial, sans-serif'
    const cityName = isArabic ? result.city.name_ar : result.city.name_en
    const governorateName = isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en
    const dateObj = new Date(`${result.date}T00:00:00`)
    const gregDay = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(dateObj)
    const gregMonth = new Intl.DateTimeFormat(isArabic ? 'ar-IQ' : 'en-GB', { month: 'long' }).format(dateObj)
    const gregYear = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(dateObj)
    const weekDay = new Intl.DateTimeFormat(isArabic ? 'ar-IQ' : 'en-GB', { weekday: 'long' }).format(dateObj)

    const hijriParts = new Intl.DateTimeFormat(
      isArabic ? 'ar-IQ-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura',
      { day: 'numeric', month: 'long', year: 'numeric' }
    ).formatToParts(dateObj)
    const hijriDay = hijriParts.find(p => p.type === 'day')?.value || ''
    const hijriMonth = hijriParts.find(p => p.type === 'month')?.value || ''
    const hijriYear = hijriParts.find(p => p.type === 'year')?.value || ''

    const prayerEn: Record<PrayerKey, string> = {
      fajr: 'ALFAJR',
      sunrise: 'SUNRISE',
      dhuhr: 'DUHUR',
      asr: 'ALASR',
      maghrib: 'MAGHRIB',
      isha: 'ALISHA',
    }

    const bg = ctx.createLinearGradient(0, 0, 1080, 1920)
    bg.addColorStop(0, '#eef7f4')
    bg.addColorStop(.55, '#ffffff')
    bg.addColorStop(1, '#e8f2ef')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1080, 1920)

    // subtle decorative corners
    ctx.globalAlpha = .18
    ctx.fillStyle = '#a9d9cf'
    ctx.beginPath(); ctx.arc(1030, 80, 220, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#efd69b'
    ctx.beginPath(); ctx.arc(20, 1880, 190, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    // Brand
    roundedRect(ctx, 390, 64, 300, 70, 35)
    ctx.fillStyle = '#dcefeb'; ctx.fill()
    drawCenteredText(ctx, 'IQPR Time', 99, `700 36px ${fontFamily}`, '#073f40')
    drawCenteredText(ctx, isArabic ? 'مواقيت الصلاة لهذا اليوم' : 'Prayer times for today', 190, `700 50px ${fontFamily}`, '#0b3334')
    drawCenteredText(ctx, `${cityName} · ${governorateName}`, 250, `700 33px ${fontFamily}`, '#0d746e')

    // Date board inspired by mosque display screens
    roundedRect(ctx, 66, 315, 948, 270, 30)
    ctx.fillStyle = '#ffffff'; ctx.fill()
    ctx.strokeStyle = '#d4e5e1'; ctx.lineWidth = 3; ctx.stroke()

    // separators
    ctx.strokeStyle = '#e3ece9'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(360, 345); ctx.lineTo(360, 555); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(720, 345); ctx.lineTo(720, 555); ctx.stroke()

    // Gregorian block
    ctx.save()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.direction = isArabic ? 'rtl' : 'ltr'
    ctx.font = `500 27px ${fontFamily}`; ctx.fillStyle = '#718986'
    ctx.fillText(isArabic ? 'التاريخ الميلادي' : 'Gregorian', 213, 365)
    ctx.font = `700 66px ${fontFamily}`; ctx.fillStyle = '#0d7c75'
    ctx.fillText(gregDay, 213, 438)
    ctx.font = `600 27px ${fontFamily}`; ctx.fillStyle = '#163f40'
    ctx.fillText(`${gregMonth} ${gregYear}`, 213, 505)
    ctx.restore()

    // Weekday block
    ctx.save()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.direction = isArabic ? 'rtl' : 'ltr'
    ctx.font = `500 27px ${fontFamily}`; ctx.fillStyle = '#718986'
    ctx.fillText(isArabic ? 'اليوم' : 'Day', 540, 365)
    ctx.font = `700 54px ${fontFamily}`; ctx.fillStyle = '#0b3f40'
    ctx.fillText(weekDay, 540, 435)
    ctx.font = `600 28px ${fontFamily}`; ctx.fillStyle = '#6e8582'
    ctx.fillText(cityName, 540, 505)
    ctx.restore()

    // Hijri block
    ctx.save()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.direction = isArabic ? 'rtl' : 'ltr'
    ctx.font = `500 27px ${fontFamily}`; ctx.fillStyle = '#718986'
    ctx.fillText(isArabic ? 'التاريخ الهجري' : 'Hijri', 867, 365)
    ctx.font = `700 66px ${fontFamily}`; ctx.fillStyle = '#0d7c75'
    ctx.fillText(hijriDay, 867, 438)
    ctx.font = `600 27px ${fontFamily}`; ctx.fillStyle = '#163f40'
    ctx.fillText(`${hijriMonth} ${hijriYear}`, 867, 505)
    ctx.restore()

    // Prayer board
    const startY = 650
    const rowH = 132
    prayerKeys.forEach((key, index) => {
      const y = startY + index * rowH
      roundedRect(ctx, 70, y, 940, 104, 18)
      ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f6faf9'
      ctx.fill()
      ctx.strokeStyle = '#dbe9e5'; ctx.lineWidth = 2; ctx.stroke()

      const prayerAr = text.prayer[key as keyof typeof text.prayer]
      const { time, period } = getShareTimeParts(result.prayer_times[key])

      // English left
      ctx.save()
      ctx.textBaseline = 'middle'
      ctx.direction = 'ltr'
      ctx.textAlign = 'left'
      ctx.font = `700 30px ${fontFamily}`
      ctx.fillStyle = '#27494a'
      ctx.fillText(prayerEn[key], 120, y + 52)

      // Time center — period visually to the left
      ctx.textAlign = 'center'
      ctx.font = `700 48px ${fontFamily}`
      ctx.fillStyle = '#0d7c75'
      ctx.fillText(time, 540, y + 52)
      ctx.textAlign = 'right'
      ctx.font = `700 27px ${fontFamily}`
      ctx.fillText(period, 452, y + 52)

      // Arabic right
      ctx.direction = 'rtl'
      ctx.textAlign = 'right'
      ctx.font = `700 40px ${fontFamily}`
      ctx.fillStyle = '#173f40'
      ctx.fillText(prayerAr, 940, y + 52)
      ctx.restore()
    })

    // Footer details
    roundedRect(ctx, 110, 1510, 860, 104, 24)
    ctx.fillStyle = '#f4faf8'; ctx.fill()
    ctx.strokeStyle = '#dbe9e5'; ctx.lineWidth = 2; ctx.stroke()

    ctx.save()
    ctx.textBaseline = 'middle'
    ctx.direction = isArabic ? 'rtl' : 'ltr'
    ctx.textAlign = 'center'
    ctx.font = `600 27px ${fontFamily}`
    ctx.fillStyle = '#5f7a77'
    ctx.fillText(
      isArabic ? `المحافظة: ${governorateName}   •   المدينة: ${cityName}` : `${governorateName} • ${cityName}`,
      540,
      1544
    )
    ctx.font = `500 24px ${fontFamily}`
    ctx.fillStyle = '#7a918e'
    ctx.fillText(
      isArabic ? `${formatResultDate(result.date)}   •   ${formatHijriDate(result.date)}` : `${formatResultDate(result.date)} • ${formatHijriDate(result.date)}`,
      540,
      1581
    )
    ctx.restore()

    roundedRect(ctx, 320, 1660, 440, 66, 33)
    ctx.fillStyle = '#0d7c75'; ctx.fill()
    drawCenteredText(ctx, 'iqpr-time-neon.vercel.app', 1693, `600 24px ${fontFamily}`, '#ffffff')
    drawCenteredText(ctx, isArabic ? 'شارك الأجر بنشر مواقيت الصلاة' : 'Share the prayer times', 1790, `500 27px ${fontFamily}`, '#557471')

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create image')), 'image/png', 1)
    })
  }

  async function createWeeklyImageBlob() {
    if (!weekResult) throw new Error('No weekly result')

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not supported')

    try {
      await document.fonts.load('700 48px "IBM Plex Sans Arabic"')
      await document.fonts.load('500 22px "IBM Plex Sans Arabic"')
    } catch {}

    const fontFamily = '"IBM Plex Sans Arabic", Arial, sans-serif'
    const cityName = isArabic ? weekResult.city.name_ar : weekResult.city.name_en
    const governorateName = isArabic ? weekResult.city.governorate.name_ar : weekResult.city.governorate.name_en

    const bg = ctx.createLinearGradient(0, 0, 1080, 1920)
    bg.addColorStop(0, '#eef7f4')
    bg.addColorStop(.55, '#ffffff')
    bg.addColorStop(1, '#edf5f2')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1080, 1920)

    // Soft premium accents.
    ctx.globalAlpha = .18
    ctx.fillStyle = '#d8c28d'
    ctx.beginPath(); ctx.arc(45, 1835, 160, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#b8ddd5'
    ctx.beginPath(); ctx.arc(1035, 70, 190, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    roundedRect(ctx, 390, 58, 300, 66, 33)
    ctx.fillStyle = '#dcefeb'; ctx.fill()
    drawCenteredText(ctx, 'IQPR Time', 91, `700 34px ${fontFamily}`, '#073f40')
    drawCenteredText(ctx, isArabic ? 'مواقيت الصلاة لهذا الأسبوع' : 'Prayer times for this week', 170, `700 46px ${fontFamily}`, '#0b3334')
    drawCenteredText(ctx, `${cityName} · ${governorateName}`, 226, `700 31px ${fontFamily}`, '#0d746e')

    // Weekly range card with a soft beige accent.
    roundedRect(ctx, 120, 274, 840, 108, 22)
    ctx.fillStyle = '#fffaf0'; ctx.fill()
    ctx.strokeStyle = '#dfc98e'; ctx.lineWidth = 2; ctx.stroke()

    drawCenteredText(
      ctx,
      `${formatShortGregorian(weekResult.start_date)} — ${formatShortGregorian(weekResult.end_date)}`,
      310,
      `700 28px ${fontFamily}`,
      '#173f40'
    )
    drawCenteredText(
      ctx,
      `${formatShortHijri(weekResult.start_date)} — ${formatShortHijri(weekResult.end_date)}`,
      349,
      `500 23px ${fontFamily}`,
      '#718986'
    )

    // Table header. Extra side margins keep Instagram story controls away.
    const tableX = 120
    const tableW = 840
    const colStep = tableW / 6
    const colXs = isArabic
      ? Array.from({ length: 6 }, (_, i) => tableX + tableW - colStep / 2 - i * colStep)
      : Array.from({ length: 6 }, (_, i) => tableX + colStep / 2 + i * colStep)

    roundedRect(ctx, tableX, 418, tableW, 70, 18)
    ctx.fillStyle = '#0b706a'; ctx.fill()

    prayerKeys.forEach((key, i) => {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.direction = isArabic ? 'rtl' : 'ltr'
      ctx.font = `700 21px ${fontFamily}`
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text.prayer[key as keyof typeof text.prayer], colXs[i], 453)
      ctx.restore()
    })

    const startY = 508
    const dayH = 162

    weekResult.days.slice(0, 7).forEach((day, dayIndex) => {
      const y = startY + dayIndex * dayH
      const weekday = formatWeekDay(day.date)
      const gregShort = formatShortGregorian(day.date)
      const hijriShort = formatShortHijri(day.date)
      const isFriday = new Date(`${day.date}T00:00:00`).getDay() === 5

      roundedRect(ctx, tableX, y, tableW, 146, 20)

      if (isFriday) {
        ctx.fillStyle = '#fff8e7'
      } else {
        ctx.fillStyle = dayIndex % 2 === 0 ? '#ffffff' : '#f3f8f6'
      }
      ctx.fill()

      ctx.strokeStyle = isFriday ? '#d5b56a' : '#dce9e5'
      ctx.lineWidth = isFriday ? 3 : 2
      ctx.stroke()

      // Day name — primary.
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.direction = isArabic ? 'rtl' : 'ltr'
      ctx.font = `700 27px ${fontFamily}`
      ctx.fillStyle = isFriday ? '#9a6c13' : '#123f40'
      ctx.fillText(weekday, 540, y + 27)

      // Gregorian and Hijri together on a single organized line.
      ctx.font = `500 19px ${fontFamily}`
      ctx.fillStyle = '#748a87'
      ctx.fillText(`${gregShort}  •  ${hijriShort}`, 540, y + 57)
      ctx.restore()

      ctx.strokeStyle = isFriday ? '#ead7a6' : '#e6efed'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(tableX + 26, y + 76)
      ctx.lineTo(tableX + tableW - 26, y + 76)
      ctx.stroke()

      prayerKeys.forEach((key, i) => {
        const { time, period } = getShareTimeParts(day[key as keyof WeekDay] as string)
        const cx = colXs[i]

        ctx.save()
        ctx.textBaseline = 'middle'
        ctx.direction = 'ltr'

        ctx.textAlign = 'center'
        ctx.font = `700 28px ${fontFamily}`
        ctx.fillStyle = isFriday ? '#8d6b23' : '#0d7c75'
        ctx.fillText(time, cx + 5, y + 112)

        // ص / م stays visually on the left side of the numeric time.
        ctx.textAlign = 'right'
        ctx.font = `700 18px ${fontFamily}`
        ctx.fillText(period, cx - 34, y + 112)
        ctx.restore()
      })
    })

    // CTA, kept safely away from Instagram's bottom controls.
    roundedRect(ctx, 280, 1660, 520, 72, 36)
    ctx.fillStyle = '#0b706a'; ctx.fill()
    drawCenteredText(ctx, 'iqpr-time-neon.vercel.app', 1696, `700 26px ${fontFamily}`, '#ffffff')

    drawCenteredText(
      ctx,
      isArabic ? 'شارك الأجر بنشر مواقيت الصلاة' : 'Share the prayer times',
      1770,
      `600 29px ${fontFamily}`,
      '#4f716e'
    )

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create weekly image')), 'image/png', 1)
    })
  }

  async function shareWeeklyImage() {
    if (!weekResult || sharingWeek) return
    setSharingWeek(true)
    try {
      const blob = await createWeeklyImageBlob()
      const file = new File([blob], `iqpr-${weekResult.city.slug}-${weekResult.start_date}-7days.png`, { type: 'image/png' })
      const title = isArabic ? `مواقيت الصلاة لهذا الأسبوع - ${weekResult.city.name_ar}` : `Prayer times for this week - ${weekResult.city.name_en}`
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title, text: title })
          return
        } catch (err) {
          if ((err as DOMException)?.name === 'AbortError') return
        }
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    } finally {
      setSharingWeek(false)
    }
  }

  async function saveWeeklyImage() {
    if (!weekResult) return
    const blob = await createWeeklyImageBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `iqpr-${weekResult.city.slug}-${weekResult.start_date}-7days.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
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

        // Keep governorate + city as one logical selection.  The city list is
        // reloaded for the detected governorate first, then the detected city
        // is applied only if it belongs to that list.
        pendingLocationCityRef.current = nextCity
        setCity('')
        setGovernorate(nextGovernorate)
        setLocationSelectionVersion(version => version + 1)
        setResult(null)
        setWeekResult(null)
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
          <div className="field"><label htmlFor="home-governorate">{text.gov}</label><div className="input-wrap"><MapPin className="input-icon" size={17} /><select id="home-governorate" className="form-control" value={governorate} onChange={e => {
  pendingLocationCityRef.current = null
  setCity('')
  setGovernorate(e.target.value)
  setResult(null)
  setWeekResult(null)
}}><option value="">{text.selectGov}</option>{governorates.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
          <div className="field"><label htmlFor="home-city">{text.city}</label><div className="input-wrap"><ChevronDown className="input-icon" size={17} /><select id="home-city" className="form-control" value={city} disabled={loadingCities || !cities.length} onChange={e => {
  setCity(e.target.value)
  setResult(null)
  setWeekResult(null)
}}><option value="">{loadingCities ? text.loadingCities : text.selectCity}</option>{cities.map(item => <option key={item.id} value={item.slug}>{isArabic ? item.name_ar : item.name_en}</option>)}</select></div></div>
        </div><div className="field"><label htmlFor="home-date">{text.date}</label><div className="date-picker-wrap"><div className="date-display" aria-hidden="true"><CalendarDays size={17} /><span>{date ? new Date(`${date}T00:00:00`).toLocaleDateString(isArabic ? 'ar-IQ' : 'en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : text.date}</span></div><input id="home-date" type="date" className="date-native-input" value={date} onChange={e => { setDate(e.target.value); setResult(null) }} min="2026-01-01" max="2026-12-31" aria-label={text.date} /></div></div>{error && <div className="query-error"><ShieldCheck size={16} /> {error}</div>}<button className="btn btn-primary btn-lg w-full" disabled={loading || loadingCities}>{loading ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}{loading ? text.searching : text.search}</button></form>
        {result && <div className="result-panel">
          <div className="result-context result-context-premium">
            <div className="result-context-icon"><MapPin size={19} /></div>
            <div className="result-place"><span>{isArabic ? 'مواقيت الصلاة لهذا اليوم' : 'Prayer times for today'}</span><strong>{isArabic ? result.city.name_ar : result.city.name_en}</strong><small>{isArabic ? result.city.governorate.name_ar : result.city.governorate.name_en}</small></div>
            <div className="result-date-pair"><span><b>{text.gregorian}</b>{formatResultDate(result.date)}</span><span><b>{text.hijri}</b>{formatHijriDate(result.date)}</span></div>
          </div>
          <div className="prayer-grid">{prayerKeys.map((key, index) => { const Icon = prayerIcons[index]; return <div className="prayer-item" key={key}><Icon size={17} /><span>{text.prayer[key as keyof typeof text.prayer]}</span><strong>{formatShareTime(result.prayer_times[key])}</strong></div> })}</div>
          <div className="result-actions primary-actions"><button type="button" className="btn btn-primary btn-sm" onClick={sharePrayerTimes} disabled={sharingStory}>{sharingStory ? <LoaderCircle className="spin" size={15} /> : <Share2 size={15} />} {sharingStory ? text.sharing : text.share}</button><button type="button" className="btn btn-secondary btn-sm" onClick={copyPrayerTimes}>{resultCopied ? <Check size={15} /> : <Copy size={15} />}{resultCopied ? text.timesCopied : text.copyTimes}</button></div>
          <div className="result-actions secondary-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={copyApiUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? text.copied : text.copy}</button><a className="btn btn-ghost btn-sm" href={apiUrl} target="_blank" rel="noreferrer"><Braces size={15} /> {text.raw}</a></div>

          <section className="week-panel" aria-labelledby="week-title">
            <div className="week-head"><div className="week-head-icon"><CalendarRange size={20} /></div><div><h3 id="week-title">{text.weekTitle}</h3><p>{text.weekSub}</p></div>{weekResult && <span className="week-range">{formatShortGregorian(weekResult.start_date)} — {formatShortGregorian(weekResult.end_date)}</span>}</div>
            {loadingWeek && <div className="week-state"><LoaderCircle className="spin" size={18} /> {text.weekLoading}</div>}
            {weekError && !loadingWeek && <div className="week-state week-state-error"><ShieldCheck size={17} /> {weekError}<button type="button" className="btn btn-ghost btn-sm" onClick={() => loadWeek(city, date)}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</button></div>}
            {weekResult && !loadingWeek && <div className="week-image-section">
              <div className="week-image-frame">
                {weekImageUrl ? <img src={weekImageUrl} alt={isArabic ? 'صورة مواقيت الصلاة للأيام السبعة' : '7-day prayer times image'} /> : <div className="week-image-loading"><LoaderCircle className="spin" size={20} /> {text.weekPreparing}</div>}
              </div>
              <div className="week-image-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={shareWeeklyImage} disabled={sharingWeek || !weekImageUrl}>{sharingWeek ? <LoaderCircle className="spin" size={15} /> : <Share2 size={15} />}{sharingWeek ? text.weekPreparing : text.weekShare}</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={saveWeeklyImage} disabled={!weekImageUrl}><CalendarRange size={15} />{text.weekSave}</button>
              </div>
            </div>}
          </section>
        </div>}
      </div></div>
    </div></section>
    <section className="section section-soft"><div className="container stats-grid">{text.stats.map(([number, label]) => <div className="card stat" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></section>
    <section className="section"><div className="container"><div className="section-heading center"><span className="eyebrow"><Zap size={16} /> {text.whyEyebrow}</span><h2 className="title-lg">{text.whyTitle}</h2><p className="lead">{text.whyLead}</p></div><div className="features-grid">{text.features.map(([title, description], index) => { const Icon = featureIcons[index]; return <article className="card feature-card" key={title}><span className={`icon-box ${index % 3 === 1 ? 'gold' : ''}`}><Icon size={21} /></span><h3>{title}</h3><p>{description}</p></article> })}</div></div></section>
    <section className="section section-soft"><div className="container developer-panel"><div className="developer-copy"><span className="eyebrow" style={{ color: '#7ed8ca' }}><Braces size={16} /> {text.devEyebrow}</span><h2 className="title-lg">{text.devTitle}</h2><p>{text.devLead}</p><Link href="/docs" className="btn btn-primary">{text.devCta} <Arrow size={17} /></Link></div><div className="developer-code"><div className="code-toolbar"><span>{text.codeLabel}</span><span className="badge">GET</span></div><pre className="code-block"><code>{codeSample}</code></pre></div></div></section>
  </>
}
