'use client'

import { AlertTriangle, Ban, CheckCircle2, Gauge, Scale, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/components/site/LanguageProvider'

export default function UsagePolicyPage() {
  const { isArabic } = useLanguage()
  const t = isArabic ? {
    eyebrow: 'استخدام عادل وواضح', title: 'سياسة استخدام بسيطة', lead: 'يمكن استخدام الخدمة في المشاريع الشخصية والتجارية مع احترام المصدر وحدود الطلبات وعدم تضليل المستخدمين.',
    allowed: 'الاستخدام المسموح', allowedItems: ['التطبيقات والمواقع والبوتات المجانية والتجارية.', 'المشاريع الشخصية والأكاديمية ومفتوحة المصدر.', 'تخزين النتائج مؤقتاً لتحسين أداء تطبيقك.', 'الإشارة بوضوح إلى مصدر البيانات واستقلالية المنصة.'],
    blocked: 'الاستخدام المحظور', blockedItems: ['الادعاء بأن المنصة تمثل جهة دينية أو حكومية رسمياً.', 'إعادة بيع الخدمة أو البيانات الخام كما هي.', 'محاولة تجاوز تحديد المعدل أو تعطيل الخدمة.', 'نشر أوقات معدلة أو مضللة مع نسبتها إلى المنصة.'],
    limits: 'حدود الطلبات', limitText: 'الحد الافتراضي 100 طلب في الدقيقة لكل عنوان IP. عند تجاوزه تعيد الخدمة 429 مع Retry-After.', disclaimer: 'إخلاء المسؤولية', disclaimerText: 'تُقدّم البيانات كما هي للأغراض المعلوماتية. لا تتحمل المنصة مسؤولية القرارات الدينية المبنية عليها، وقد تتغير البيانات أو الخدمة عند إصدار نسخة جديدة.',
  } : {
    eyebrow: 'Fair and clear usage', title: 'A simple usage policy', lead: 'Use the service in personal and commercial projects while respecting attribution, request limits, and user trust.',
    allowed: 'Allowed use', allowedItems: ['Free and commercial apps, websites, and bots.', 'Personal, academic, and open-source projects.', 'Temporary caching to improve your application performance.', 'Clear attribution to the data source and the platform’s independence.'],
    blocked: 'Prohibited use', blockedItems: ['Claiming the platform officially represents a religious or government body.', 'Reselling the raw service or data as-is.', 'Attempting to bypass rate limits or disrupt the service.', 'Publishing altered or misleading times while attributing them to the platform.'],
    limits: 'Request limits', limitText: 'The default limit is 100 requests per minute per IP address. Exceeding it returns 429 with Retry-After.', disclaimer: 'Disclaimer', disclaimerText: 'Data is provided as-is for informational purposes. The platform is not responsible for religious decisions based on it, and the service or data may change with a new release.',
  }
  return <><section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow"><Scale size={16} /> {t.eyebrow}</span><h1 className="title-lg">{t.title}</h1><p className="lead">{t.lead}</p></div><span className="icon-box gold"><ShieldCheck size={24} /></span></div></section><section className="page-content"><div className="container-narrow"><div className="info-grid"><article className="card info-card"><div className="info-card-head"><span className="icon-box"><CheckCircle2 size={21} /></span><h2 className="title-md">{t.allowed}</h2></div><ul>{t.allowedItems.map(item => <li key={item}>{item}</li>)}</ul></article><article className="card info-card"><div className="info-card-head"><span className="icon-box gold"><Ban size={21} /></span><h2 className="title-md">{t.blocked}</h2></div><ul>{t.blockedItems.map(item => <li key={item}>{item}</li>)}</ul></article></div><div className="card status-overview" style={{ marginTop: 20 }}><div className="status-main"><span className="status-orb"><Gauge size={26} /></span><div><h2 className="title-md">{t.limits}</h2><p className="muted">{t.limitText}</p></div></div><span className="badge">100 req/min</span></div><div className="notice" style={{ marginTop: 20 }}><AlertTriangle size={21} /><div><strong>{t.disclaimer}</strong><p>{t.disclaimerText}</p></div></div></div></section></>
}
