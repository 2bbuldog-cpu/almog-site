'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ThankYouContent() {
  const params = useSearchParams()
  const min = Number(params.get('min') || 0)
  const max = Number(params.get('max') || 0)
  const level = params.get('score') || 'medium'

  const levelMessages: Record<string, { headline: string; sub: string; color: string }> = {
    high: {
      headline: 'נראה שמגיע לך החזר משמעותי!',
      sub: 'על בסיס התשובות שלך, הפוטנציאל הוא גבוה. אלמוג תיצור איתך קשר לאימות ובדיקה מעמיקה.',
      color: '#10B981',
    },
    medium: {
      headline: 'יש סיכוי טוב להחזר מס!',
      sub: 'ראינו כמה טריגרים חשובים בתשובות שלך. אלמוג תבחן את הפרטים ותחזור אליך.',
      color: '#C9A84C',
    },
    low: {
      headline: 'קיבלנו את הפרטים שלך!',
      sub: 'גם אם ההחזר לא גדול — שווה לבדוק. אלמוג תבחן ותיצור קשר תוך 24 שעות.',
      color: '#6366F1',
    },
  }

  const msg = levelMessages[level] || levelMessages.medium

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060f22 0%, #0c1c3a 50%, #0E1E40 100%)',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>

      {/* Check icon */}
      <div style={{
        width: '88px', height: '88px',
        borderRadius: '50%',
        background: `${msg.color}22`,
        border: `3px solid ${msg.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.4rem',
        marginBottom: '28px',
        animation: 'pop .5s ease both',
      }}>
        ✓
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.25)',
        borderRadius: '50px', padding: '7px 20px',
        color: '#E8C96A', fontSize: '.82rem', fontWeight: 700,
        marginBottom: '20px',
      }}>
        השאלון התקבל בהצלחה
      </div>

      <h1 style={{
        fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
        fontWeight: 900,
        color: '#fff',
        lineHeight: 1.2,
        marginBottom: '16px',
        maxWidth: '520px',
      }}>
        {msg.headline}
      </h1>

      <p style={{
        color: 'rgba(255,255,255,.6)',
        fontSize: '1.05rem',
        lineHeight: 1.7,
        maxWidth: '440px',
        marginBottom: '36px',
      }}>
        {msg.sub}
      </p>

      {/* Refund estimate card */}
      {min > 0 && max > 0 && (
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: '20px',
          padding: '28px 36px',
          marginBottom: '36px',
          minWidth: '280px',
        }}>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', marginBottom: '10px' }}>
            הערכת החזר משוערת
          </p>
          <div style={{ color: '#E8C96A', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1 }}>
            ₪{min.toLocaleString('he-IL')} – ₪{max.toLocaleString('he-IL')}
          </div>
          <p style={{
            color: 'rgba(255,255,255,.35)',
            fontSize: '.75rem',
            marginTop: '10px',
            lineHeight: 1.5,
          }}>
            * הערכה ראשונית בלבד — הסכום המדויק ייקבע לאחר בדיקת המסמכים
          </p>
        </div>
      )}

      {/* What happens next */}
      <div style={{
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: '16px',
        padding: '28px 32px',
        maxWidth: '480px',
        width: '100%',
        marginBottom: '32px',
        textAlign: 'right',
      }}>
        <h3 style={{ color: '#fff', fontWeight: 800, marginBottom: '16px', fontSize: '1.05rem' }}>
          מה קורה עכשיו?
        </h3>
        {[
          { icon: '📞', text: 'אלמוג תיצור קשר תוך 24 שעות לאימות הפרטים' },
          { icon: '📋', text: 'נשלח רשימת מסמכים נדרשים (טופסי 106, ת"ז, ועוד)' },
          { icon: '🔍', text: 'נבצע בדיקה מלאה ומעמיקה של כל שנות המס' },
          { icon: '💰', text: 'נגיש בשמך ונוודא שתקבל את הכסף המגיע לך' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            marginBottom: i < 3 ? '14px' : 0,
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.9rem', lineHeight: 1.5 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/972500000000?text=שלום אלמוג, מילאתי את השאלון באתר ואני מעוניין/ת לשמוע יותר על החזר מס"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: '#25D366',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: '50px',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          marginBottom: '16px',
          transition: 'all .3s ease',
          boxShadow: '0 8px 24px rgba(37,211,102,.3)',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>💬</span>
        שלחו הודעה בוואטסאפ עכשיו
      </a>

      <a
        href="/hazarat-mas"
        style={{
          color: 'rgba(255,255,255,.4)',
          fontSize: '.85rem',
          textDecoration: 'none',
        }}
      >
        ← חזרה לדף החזר מס
      </a>

      <style>{`
        @keyframes pop {
          0% { transform: scale(.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&display=swap');
      `}</style>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#060f22' }} />}>
      <ThankYouContent />
    </Suspense>
  )
}
