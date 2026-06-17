import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeScript from '@/components/layout/ThemeScript'
import AmbientBackground from '@/components/layout/AmbientBackground'
import BackToTop from '@/components/layout/BackToTop'

export const metadata: Metadata = {
  metadataBase: new URL('https://xn--n1aeq.online'),
  title: {
    default: 'ЦОР — образовательная платформа · Савчишен А.А.',
    template: '%s · ЦОР',
  },
  description:
    'Учебная платформа: предметы-курсы магистратуры с теорией, заданиями, интерактивом и итоговыми результатами. Савчишен А.А., ТГПУ им. Л. Н. Толстого.',
  authors: [{ name: 'Савчишен Алексей Алексеевич' }],
  icons: { icon: '/assets/img/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ЦОР — образовательная платформа',
    images: ['/assets/img/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07131e' },
    { media: '(prefers-color-scheme: light)', color: '#f4f8fc' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="light" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Unbounded:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmbientBackground />
        {children}
        <BackToTop />
      </body>
    </html>
  )
}
