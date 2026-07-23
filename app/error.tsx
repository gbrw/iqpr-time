'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem' }}>
        عذراً، حدث خطأ أثناء تحميل الصفحة
      </h2>
      <p style={{ color: 'var(--color-text-muted, #94a3b8)', marginBottom: '1.5rem' }}>
        {error.message || 'خطأ غير متوقع'}
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        إعادة التحميل
      </button>
    </div>
  )
}
