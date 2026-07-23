'use client'

import { AlertTriangle, CalendarCheck, CheckCircle2, Database, Landmark, MapPinned, MoonStar } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

export default function SourcePage() {
  const { isArabic } = useLanguage()
  const t = isArabic ? {
    eyebrow: 'الشفافية أولاً', title: 'مصدر البيانات ومنهج إعدادها', lead: 'نعرض مصدر المواقيت وطريقة تجهيزها وحدود استخدامها بوضوح حتى تعرف بالضبط ما الذي تعتمد عليه.',
    noticeTitle: 'مشروع تقني مستقل', notice: 'هذه المنصة لا تتبع رسمياً لأي جهة دينية أو حكومية ولا تمثل ديوان الوقف السني. البيانات مجمعة من جداول منشورة ومتاحة للأغراض المعلوماتية.',
    cards: [['المصدر', 'جداول المواقيت السنوية المنشورة والمنسوبة إلى ديوان الوقف السني العراقي.'], ['التغطية', '19 محافظة و121 مدينة وناحية، مع 365 يوماً كاملاً لكل مدينة.'], ['التوقيت', 'صيغة 24 ساعة وجميع النتائج ضمن المنطقة الزمنية Asia/Baghdad (UTC+3).'], ['التدقيق', 'فحص القيم الناقصة، الصيغة، ترتيب الصلوات، التكرار، واكتمال أيام السنة.']],
    method: 'كيف تصل البيانات إلى الـAPI؟', steps: [['جمع الجداول', 'تجميع جداول المدن من المصدر العام.'], ['التنظيف والتحويل', 'تحويل الأوقات إلى صيغة 24 ساعة وتوحيد أسماء المدن.'], ['التدقيق الآلي', 'فحص 44,165 سجلاً قبل اعتماد النسخة.'], ['النشر', 'استيراد النسخة المدققة إلى قاعدة البيانات وإتاحتها عبر API.']],
    accuracy: 'ملاحظة حول الدقة', accuracyText: 'المواقيت معلوماتية وقد تختلف دقيقة أو دقيقتين عن الأذان المحلي. للمسائل الشرعية والعبادية يرجى الرجوع إلى المرجع الديني المعتمد في منطقتك.',
  } : {
    eyebrow: 'Transparency first', title: 'Data source and preparation', lead: 'We clearly explain where the times come from, how they are prepared, and their usage limits so you know what you rely on.',
    noticeTitle: 'An independent technical project', notice: 'This platform is not officially affiliated with or representative of any religious or government body. Data is compiled from published schedules for informational use.',
    cards: [['Source', 'Annual prayer schedules published and attributed to the Iraqi Sunni Endowment Diwan.'], ['Coverage', '19 governorates and 121 cities or districts, with 365 full days for each city.'], ['Timezone', '24-hour format, with all results in Asia/Baghdad (UTC+3).'], ['Validation', 'Checks for missing values, format, chronology, duplicates, and full-year coverage.']],
    method: 'How does the data reach the API?', steps: [['Collect schedules', 'Compile city schedules from the public source.'], ['Clean and transform', 'Convert to 24-hour time and normalize city names.'], ['Automated validation', 'Verify all 44,165 records before release.'], ['Publish', 'Import the validated version and expose it through the API.']],
    accuracy: 'Accuracy note', accuracyText: 'Times are informational and can differ by a minute or two from the local call to prayer. For religious matters, refer to the trusted authority in your area.',
  }
  const icons = [Landmark, MapPinned, MoonStar, CheckCircle2]
  return <><section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><Database size={16} /> {t.eyebrow}</span><h1 className="title-lg">{t.title}</h1><p className="lead">{t.lead}</p></div><span className="icon-box gold"><Landmark size={24} /></span></div></section><section className="page-content"><div className="container-narrow"><div className="notice" style={{ marginBottom: 24 }}><AlertTriangle size={22} /><div><strong>{t.noticeTitle}</strong><p>{t.notice}</p></div></div><div className="info-grid">{t.cards.map(([title, body], index) => { const Icon = icons[index]; return <article className="card info-card" key={title}><div className="info-card-head"><span className="icon-box"><Icon size={20} /></span><h2 className="title-md">{title}</h2></div><p className="muted">{body}</p></article> })}</div><section className="section" style={{ paddingBottom: 40 }}><div className="section-heading"><span className="eyebrow"><CalendarCheck size={16} /> Data pipeline</span><h2 className="title-lg">{t.method}</h2></div><div className="service-list">{t.steps.map(([title, body], index) => <div className="card service-row" key={title}><div className="service-name"><span className="icon-box gold" style={{ width: 38, height: 38 }}>{index + 1}</span><div><strong>{title}</strong><p className="muted" style={{ fontSize: '.8rem' }}>{body}</p></div></div></div>)}</div></section><div className="notice"><AlertTriangle size={21} /><div><strong>{t.accuracy}</strong><p>{t.accuracyText}</p></div></div></div></section></>
}
