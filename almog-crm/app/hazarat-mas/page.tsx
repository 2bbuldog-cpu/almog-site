'use client'

// Tax refund landing page — points visitors to the questionnaire
// The full-featured design is in /service-tax-refund.html
// This Next.js version enables the questionnaire flow

import Link from 'next/link'


const s = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Heebo', sans-serif",
    direction: 'rtl' as const,
    background: '#F7F9FC',
    color: '#1A1A2E',
  },
}

export default function TaxRefundPage() {
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={{
        background: 'rgba(14,30,64,.97)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="אלמוג בן דוד" style={{ height: '44px' }} />
        </a>
        <Link href="/sheelon" style={{
          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
          color: '#0E1E40', padding: '10px 22px', borderRadius: '50px',
          fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
        }}>
          התחל בדיקה חינם ←
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0E1E40 0%, #1B3358 50%, #2A4A7A 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(201,168,76,.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.3)',
            color: '#E8C96A', padding: '7px 20px', borderRadius: '50px',
            fontSize: '.85rem', fontWeight: 700, marginBottom: '24px',
          }}>
            ✦ ייעוץ ראשוני חינם — ללא התחייבות
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900, color: '#fff', lineHeight: 1.15,
            marginBottom: '16px',
          }}>
            מגיע לך <span style={{ color: '#E8C96A' }}>החזר מס</span>?<br />
            בואו נבדוק יחד — חינם
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,.72)',
            lineHeight: 1.7, marginBottom: '36px',
          }}>
            מיליוני ישראלים זכאים להחזרי מס שהם לא יודעים עליהם.
            שאלון של 5 דקות יגלה לך את הפוטנציאל שלך.
          </p>
          <Link href="/sheelon" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            color: '#0E1E40', padding: '16px 40px', borderRadius: '50px',
            fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(201,168,76,.4)',
          }}>
            מלא/י שאלון חינם ←
          </Link>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '32px', flexWrap: 'wrap' as const }}>
            {['ממוצע החזר: 8,000–25,000 ₪', 'עד 6 שנים אחורה', 'ללא סיכון — מצליחים בלבד', 'תוצאה תוך 24 שעות'].map(t => (
              <span key={t} style={{ color: 'rgba(255,255,255,.55)', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#E8C96A' }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Who qualifies */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '48px', height: '3px', background: 'linear-gradient(90deg, #C9A84C, #E8C96A)', borderRadius: '2px', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0E1E40', marginBottom: '12px' }}>
            מי זכאי להחזר מס?
          </h2>
          <p style={{ color: '#4A5568', fontSize: '1rem', lineHeight: 1.7 }}>
            אם אחד מהמצבים הבאים אירע לך — כדאי מאוד לבדוק
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px',
        }}>
          {[
            { icon: '💼', title: 'החלפת מקום עבודה', desc: 'כל מעבר בין מעסיקים עלול לגרום לניכוי יתר' },
            { icon: '👶', title: 'חופשת לידה', desc: 'חופשה ללא שכר = ייתכן תשלום מס עודף' },
            { icon: '🎓', title: 'סיום תואר אקדמי', desc: 'זיכוי מס ל-3 שנים שרבים לא ממצים' },
            { icon: '👨‍👩‍👧', title: 'הורים לילדים', desc: 'נקודות זיכוי שמקטינות את חבות המס' },
            { icon: '📍', title: 'תושב ישוב מזכה', desc: 'הנחה מיוחדת לתושבי פריפריה ועיירות פיתוח' },
            { icon: '🤝', title: 'תרומות לעמותות', desc: 'זיכוי של 35% מסכום התרומה' },
            { icon: '🔄', title: 'כמה מקומות עבודה', desc: 'עבודה מקבילה בכמה מקומות — טריגר נפוץ' },
            { icon: '📋', title: 'מילואים ואבטלה', desc: 'כל הפסקה בהכנסה עשויה להצדיק החזר' },
          ].map(c => (
            <div key={c.title} style={{
              background: '#fff', borderRadius: '14px',
              padding: '24px', border: '2px solid #E2E8F0',
              transition: 'all .25s ease',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#C9A84C'
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 12px 32px rgba(14,30,64,.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#E2E8F0'
                el.style.transform = ''
                el.style.boxShadow = ''
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{c.icon}</div>
              <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '6px' }}>{c.title}</h3>
              <p style={{ fontSize: '.85rem', color: '#4A5568', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section style={{ background: '#0E1E40', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '3px', background: 'linear-gradient(90deg, #C9A84C, #E8C96A)', borderRadius: '2px', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
            איך זה עובד?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: '48px', fontSize: '1rem', lineHeight: 1.7 }}>
            4 שלבים פשוטים — מהשאלון ועד הכסף בחשבון
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { n: '1', title: 'מלא שאלון', desc: '5 דקות, ללא מסמכים. אנחנו מבינים את הפוטנציאל שלך.' },
              { n: '2', title: 'בדיקה מלאה', desc: 'אלמוג בודקת את כל שנות המס שלך ומאתרת כל זיכוי.' },
              { n: '3', title: 'הגשה בשמך', desc: 'אנחנו מגישים את הבקשה לרשות המסים — אתה לא עושה כלום.' },
              { n: '4', title: 'כסף בחשבון', desc: 'רשות המסים מעבירה את הסכום ישירות לחשבון הבנק שלך.' },
            ].map(step => (
              <div key={step.n} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                  color: '#0E1E40', fontSize: '1.5rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(201,168,76,.35)',
                }}>{step.n}</div>
                <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.85rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0E1E40', marginBottom: '12px' }}>
            מוכן/ה לבדוק כמה כסף מגיע לך?
          </h2>
          <p style={{ color: '#4A5568', marginBottom: '32px', lineHeight: 1.7 }}>
            השאלון לוקח פחות מ-5 דקות. לא צריך מסמכים. לא צריך לצאת מהבית.
          </p>
          <Link href="/sheelon" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            color: '#0E1E40', padding: '16px 40px', borderRadius: '50px',
            fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(201,168,76,.35)',
          }}>
            בדוק/י עכשיו — חינם ←
          </Link>
          <p style={{ color: '#8492A6', fontSize: '.82rem', marginTop: '14px' }}>
            ייעוץ ראשוני חינם · ללא התחייבות · תוצאה תוך 24 שעות
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0E1E40', padding: '24px',
        textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: '.82rem',
      }}>
        אלמוג בן דוד | רואה חשבון מוסמך | באר שבע ·
        <a href="/privacy.html" style={{ color: '#E8C96A', marginRight: '8px' }}>פרטיות</a> ·
        <a href="/terms.html" style={{ color: '#E8C96A', marginRight: '8px' }}>תנאי שימוש</a>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 600px) {
          .process-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
