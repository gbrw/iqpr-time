import type { Metadata } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iqpr-time.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'IQPR Time — مواقيت الصلاة في العراق',
    template: '%s | IQPR Time',
  },
  description:
    'REST API احترافية مجانية لمواقيت الصلاة في جميع محافظات ومدن العراق. بيانات دقيقة من ديوان الوقف السني، متاحة لجميع المطورين.',
  keywords: [
    'prayer times Iraq',
    'مواقيت الصلاة العراق',
    'API',
    'REST API',
    'Iraq',
    'Muslim',
    'فجر',
    'مغرب',
    'ديوان الوقف السني',
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    url: appUrl,
    siteName: 'IQPR Time',
    title: 'IQPR Time',
    description: 'REST API مجانية لمواقيت الصلاة في جميع مدن العراق',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'IQPR Time' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IQPR Time',
    description: 'REST API مجانية لمواقيت الصلاة في جميع مدن العراق',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
