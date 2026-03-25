import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'החזר מס – בדוק זכאות תוך 60 שניות | אלמוג בן דוד',
  description: 'שכיר? יתכן שמגיע לך החזר מס של אלפי שקלים. בדיקה חינם, ללא התחייבות. אלמוג בן דוד, רואת חשבון מוסמכת.',
  robots: 'index, follow',
}

export default function HazaratMasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
