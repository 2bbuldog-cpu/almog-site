// Root homepage — redirects to the existing HTML static site
// or can serve as the Next.js homepage

import { redirect } from 'next/navigation'

export default function HomePage() {
  // For now: if the static HTML index.html exists, we redirect there.
  // Later this can be replaced with a full Next.js homepage component.
  redirect('/hazarat-mas')
}
