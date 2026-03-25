import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'אלמוג בן דוד | רואת חשבון מוסמכת – החזרי מס, פתיחת עסק, תכנון פרישה',
  description: 'אלמוג בן דוד, רואת חשבון מוסמכת מבאר שבע. מתמחה בהחזרי מס, פתיחת עסקים, ותכנון פרישה. ייעוץ ראשוני חינם ללא התחייבות.',
  keywords: 'רואת חשבון, החזר מס, פתיחת עסק, תכנון פרישה, באר שבע, אלמוג בן דוד, מס הכנסה',
  authors: [{ name: 'אלמוג בן דוד' }],
  openGraph: {
    title: 'אלמוג בן דוד | רואת חשבון מוסמכת',
    description: 'החזרי מס, פתיחת עסק, תכנון פרישה. ייעוץ ראשוני חינם.',
    locale: 'he_IL',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
