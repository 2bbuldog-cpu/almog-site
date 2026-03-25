import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import TestimonialsCarousel from './TestimonialsCarousel'

const bullets = [
  {
    label: 'שכירים שעבדו ביותר ממקום אחד',
    detail: 'כל מעבר בין מעסיקים עשוי ליצור תשלום יתר למס הכנסה',
  },
  {
    label: 'חיילים משוחררים וסטודנטים',
    detail: 'שנות שירות צבאי וזיכויי שכר לימוד מזכים לרוב בהחזר',
  },
  {
    label: 'מי שלא בדק בשנים האחרונות',
    detail: 'ניתן לתבוע עד 6 שנים אחורה — הכסף עדיין ממתין',
  },
]

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

function getTestimonialImages() {
  const dir = path.join(process.cwd(), 'public', 'testimonials')
  try {
    if (!fs.existsSync(dir)) return []
    const files = fs.readdirSync(dir)
    return files
      .filter(f => SUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map((f, i) => ({ src: `/testimonials/${f}`, alt: `פידבק לקוח ${i + 1}` }))
  } catch {
    return []
  }
}

export default function HazaratMasPage() {
  const testimonialImages = getTestimonialImages()

  return (
    <div style={{ fontFamily: 'Heebo, sans-serif', direction: 'rtl', color: '#0E1E40' }}>

      {/* ── BRAND BAR ── */}
      <div style={{
        background: '#0E1E40',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: '#C9A84C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.95rem',
          color: '#0E1E40',
          flexShrink: 0,
        }}>
          א
        </div>
        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>אלמוג בן דוד</span>
        <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 500 }}>רואת חשבון מוסמכת</span>
      </div>

      {/* ── HERO ── */}
      <section style={{
        background: '#0E1E40',
        padding: 'clamp(56px, 10vw, 104px) 24px clamp(64px, 12vw, 120px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            מגיע לך כסף מהמדינה
          </h1>

          <p style={{
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            color: '#C9A84C',
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            רוב הלקוחות מקבלים בין 2,000–8,000 ₪
          </p>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75,
            marginBottom: '40px',
          }}>
            בדוק תוך 60 שניות אם מגיע לך החזר מס
          </p>

          <Link href="/hazarat-mas/form" style={{
            display: 'inline-block',
            padding: '18px 52px',
            background: '#C9A84C',
            color: '#0E1E40',
            fontWeight: 800,
            fontSize: '1.1rem',
            borderRadius: '50px',
            textDecoration: 'none',
          }}>
            בדוק כמה מגיע לך
          </Link>

          <p style={{
            marginTop: '14px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.82rem',
          }}>
            ללא התחייבות · בדיקה ראשונית חינם
          </p>

          <p style={{
            marginTop: '10px',
            color: 'rgba(255,255,255,0.22)',
            fontSize: '0.75rem',
          }}>
            הבדיקה מתבצעת לפי סדר פניות
          </p>
        </div>
      </section>

      {/* ── BULLETS ── */}
      <section style={{
        background: '#F7F9FC',
        padding: 'clamp(48px, 8vw, 80px) 24px',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
            fontWeight: 800,
            color: '#0E1E40',
            marginBottom: '28px',
            textAlign: 'center',
          }}>
            מי זכאי להחזר?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bullets.map((item) => (
              <div key={item.label} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#C9A84C',
                  flexShrink: 0,
                  marginTop: '7px',
                }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#4A5568', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      {testimonialImages.length > 0 && (
        <TestimonialsCarousel images={testimonialImages} />
      )}

      {/* ── TRUST ── */}
      <section style={{
        background: '#FFFFFF',
        padding: 'clamp(48px, 8vw, 80px) 24px',
        textAlign: 'center',
        borderTop: '1px solid #E2E8F0',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 22px',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            marginBottom: '36px',
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.2rem',
              color: '#0E1E40',
              flexShrink: 0,
            }}>
              א
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0E1E40' }}>
                אלמוג בן דוד
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4A5568' }}>
                רואת חשבון מוסמכת
              </div>
            </div>
          </div>

          <p style={{
            color: '#4A5568',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            marginBottom: '32px',
          }}>
            אלפי שקלים עשויים לחכות לך. הבדיקה חינם ולוקחת פחות מדקה.
          </p>

          <Link href="/hazarat-mas/form" style={{
            display: 'inline-block',
            padding: '18px 52px',
            background: '#C9A84C',
            color: '#0E1E40',
            fontWeight: 800,
            fontSize: '1rem',
            borderRadius: '50px',
            textDecoration: 'none',
          }}>
            בדוק כמה מגיע לך
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#0E1E40',
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          © אלמוג בן דוד, רואת חשבון מוסמכת · כל הזכויות שמורות
        </p>
      </footer>

    </div>
  )
}
