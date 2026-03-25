import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תודה! | אלמוג בן דוד',
  description: 'השאלון התקבל. אלמוג תיצור איתך קשר בהקדם.',
}

export default function ThankYouPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0E1E40 0%, #0c1c3a 50%, #091525 100%)',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.6s ease both',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '2.5rem',
          boxShadow: '0 16px 48px rgba(34,197,94,0.4)',
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        }}>
          ✓
        </div>

        {/* Main Message */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '48px 40px',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 900,
            color: 'white',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}>
            קיבלנו!{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              תודה רבה
            </span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.05rem',
            lineHeight: 1.8,
            marginBottom: '0',
          }}>
            אלמוג תעבור על השאלון שלך ותיצור איתך קשר בהקדם האפשרי –
            בדרך כלל תוך 24 שעות ביום עסקים.
          </p>
        </div>

        {/* What's Next */}
        <div style={{
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          textAlign: 'right',
        }}>
          <h3 style={{
            fontWeight: 800, color: '#E8C96A',
            fontSize: '0.95rem', marginBottom: '16px',
          }}>
            מה קורה עכשיו?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { num: '1', text: 'אלמוג בודקת את השאלון שלך' },
              { num: '2', text: 'נחזור אליך עם הערכה ראשונית' },
              { num: '3', text: 'אם יש זכאות – נמשיך לשלב המסמכים' },
            ].map((item) => (
              <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#0E1E40', fontSize: '0.78rem',
                  flexShrink: 0,
                }}>
                  {item.num}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.88rem',
          marginBottom: '16px',
        }}>
          בינתיים, שמור אותנו בוואטסאפ לשאלות מהירות
        </p>
        <a
          href="https://wa.me/972547312262"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 40px',
            background: '#25D366',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          שלח הודעה לאלמוג
        </a>

        <div style={{ marginTop: '8px' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.88rem',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
          >
            חזרה לאתר →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
