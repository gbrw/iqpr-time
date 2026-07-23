import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-primary, #10b981)' }}>404 — الصفحة غير موجودة</h1>
      <p style={{ color: 'var(--color-text-muted, #94a3b8)', marginBottom: '2rem', maxWidth: 500 }}>
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
      </p>
      <Link href="/" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        العودة للصفحة الرئيسية
      </Link>
    </div>
  )
}
