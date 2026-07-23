'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'sans-serif', background: '#0a0f1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#ef4444' }}>حدث خطأ غير متوقع في النظام</h1>
          <p style={{ color: '#94a3b8', margin: '1rem 0' }}>{error.message || 'خطأ داخلي في الخادم'}</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  )
}
