import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'אלמוג בן דוד | רואה חשבון מוסמך – באר שבע',
  description: 'אלמוג בן דוד, רואה חשבון מוסמך בבאר שבע. החזרי מס, פתיחת עסק, תכנון פרישה, הנהלת חשבונות. ייעוץ מקצועי ואישי.',
  keywords: 'רואה חשבון, החזר מס, באר שבע, אלמוג בן דוד, מס הכנסה, ייעוץ מס',
  openGraph: {
    locale: 'he_IL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
