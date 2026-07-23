# دليل رفع المشروع إلى Vercel

هذا المجلد هو النسخة الجاهزة للنشر. لا يحتاج إلى ملفات CSV أو SQLite أو أدوات التحويل الموجودة في المشروع الأصلي.

## قبل الرفع

يجب أن تكون قاعدة Supabase الحالية مهيأة وتحتوي على بيانات المحافظات والمدن والمواقيت. ستحتاج من لوحة Supabase إلى قيمتين فقط:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

أضف أيضاً مفتاحاً عشوائياً لحماية مهمة إبقاء Supabase نشطاً:

```text
CRON_SECRET
```

اجعل قيمته نصاً عشوائياً لا يقل عن 16 حرفاً. لا تضع القيمة الحقيقية داخل ملفات المشروع أو GitHub؛ أضفها من **Vercel → Settings → Environment Variables** لبيئة `Production`.

لا ترفع ملف `.env.local` إلى GitHub أو Vercel، ولا تضف `SUPABASE_SERVICE_ROLE_KEY` إلى مشروع Vercel؛ التطبيق المنشور يحتاج مفتاح القراءة العام فقط.

متغيرات Upstash التالية اختيارية. عند إضافتها يُفعّل حد 100 طلب في الدقيقة لكل عنوان IP، وعند عدم إضافتها يبقى الموقع والـAPI عاملين بدون Rate Limiting:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

رابط المشروع الرسمي مضبوط على:

```text
NEXT_PUBLIC_APP_URL=https://iqpr-time.vercel.app
```

أضف هذا المتغير إلى Vercel لبيئة `Production` حتى تستخدم بيانات المشاركة وOpen Graph الرابط الصحيح دائماً.

---

## الطريقة الأولى: GitHub ثم Vercel — الموصى بها

### إذا كان هذا المجلد وحده في Repository

1. أنشئ Repository جديداً في GitHub.
2. ارفع **محتويات** مجلد `vercel-ready` إلى جذر الـRepository.
3. افتح [Vercel Dashboard](https://vercel.com/new).
4. اختر **Add New → Project** ثم استورد الـRepository.
5. تأكد أن **Framework Preset** هو `Next.js`.
6. اترك أوامر Build وInstall وOutput على الوضع الافتراضي؛ ملف `vercel.json` و`package.json` جاهزان.
7. افتح قسم **Environment Variables** وأضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET` (نص عشوائي سري بطول 16 حرفاً أو أكثر)
   - `NEXT_PUBLIC_APP_URL` وقيمته `https://iqpr-time.vercel.app`
   - متغيري Upstash إن أردت Rate Limiting.
8. فعّل المتغيرات لبيئات `Production` و`Preview`.
9. اضغط **Deploy**.

بعد النشر افتح **Vercel → Settings → Cron Jobs** وتأكد من ظهور المهمة `/api/cron/supabase-keep-alive`. تعمل يومياً قرابة الساعة `06:15 UTC` (قد يتغير وقت التنفيذ داخل الساعة في خطة Hobby)، وتنفذ ثلاثة استعلامات قراءة صغيرة من دون تعديل أي بيانات.

> هذه المهمة تقلل احتمال إيقاف مشروع Supabase المجاني بسبب الخمول. Supabase لا يعلن حداً مضموناً ودقيقاً للنشاط؛ الضمان الرسمي لعدم الإيقاف بسبب الخمول متوفر في الخطط المدفوعة فقط.

### إذا رفعت المشروع الأصلي كاملاً وفي داخله `vercel-ready`

في صفحة إعداد المشروع قبل النشر اضبط:

```text
Root Directory = vercel-ready
```

ثم نفّذ الخطوات الخاصة بمتغيرات البيئة واضغط **Deploy**.

---

## الطريقة الثانية: Vercel CLI

افتح الطرفية داخل هذا المجلد ثم نفّذ:

```bash
npm install -g vercel
vercel login
vercel
```

في أول تشغيل:

- اختر إنشاء مشروع جديد أو اربطه بمشروع موجود.
- وافق على اكتشاف Next.js تلقائياً.
- لا تغيّر مجلد البناء أو Output Directory.

بعد إنشاء المشروع، أضف المتغيرات من لوحة Vercel عبر:

```text
Project → Settings → Environment Variables
```

ثم انشر النسخة الإنتاجية:

```bash
vercel --prod
```

---

## إعدادات Vercel الصحيحة

| الإعداد | القيمة |
|---|---|
| Framework Preset | Next.js |
| Node.js | 20.x |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | اتركه فارغاً |
| Root Directory | جذر هذا المجلد، أو `vercel-ready` إذا كان داخل Repository أكبر |

لا تختَر `out` كـOutput Directory؛ المشروع يحتوي API Routes وMiddleware ويحتاج نشر Next.js القياسي وليس Static Export.

---

## الفحص بعد النشر

افتح الروابط التالية بعد النشر:

```text
https://iqpr-time.vercel.app/
https://iqpr-time.vercel.app/status
https://iqpr-time.vercel.app/api/v1/health
https://iqpr-time.vercel.app/api/v1/governorates
https://iqpr-time.vercel.app/api/v1/prayer-times?city=baghdad-center&date=2026-07-23
```

النتيجة الصحيحة لفحص الصحة:

```json
{
  "status": "healthy"
}
```

إذا أضفت أو عدّلت متغيرات البيئة بعد النشر، أنشئ **Redeploy** جديداً؛ تغييرات المتغيرات لا تؤثر على عمليات النشر السابقة.

---

## حل المشاكل الشائعة

### يظهر `DATABASE_ERROR` أو صفحة الحالة متأثرة

- تأكد من صحة `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- تأكد أن المتغيرين مفعّلان لبيئة Production.
- تأكد من تشغيل مخطط Supabase وسياسات القراءة العامة RLS.
- أعد النشر بعد تعديل المتغيرات.

### الموقع يعمل لكن تحديد المعدل غير مفعّل

أضف متغيري Upstash ثم أعد النشر. عدم وجودهما لا يمنع تشغيل الموقع.

### الصور أو رابط المشاركة يستخدمان نطاقاً قديماً

أضف:

```text
NEXT_PUBLIC_APP_URL=https://iqpr-time.vercel.app
```

ثم أعد النشر.

### Vercel لا يكتشف المشروع

- تأكد أن `package.json` موجود في Root Directory المحدد.
- إذا كان المشروع داخل Repository أكبر، اجعل Root Directory هو `vercel-ready`.
- لا ترفع مجلد `node_modules` أو `.next`.

---

## تحديث الموقع لاحقاً

عند ربط المشروع بـGitHub، كل Push إلى الفرع الرئيسي ينشئ Production Deployment، والفروع الأخرى تنشئ Preview Deployments. احتفظ بمتغيرات Supabase في إعدادات Vercel ولا تضعها داخل ملفات المشروع.
