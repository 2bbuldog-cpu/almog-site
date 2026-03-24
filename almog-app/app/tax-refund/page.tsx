import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'החזר מס | אלמוג בן דוד – רואת חשבון',
  description: 'בדיקת זכאות להחזר מס חינם. ממוצע ₪15,000 לכל לקוח. הגשה מהירה, תוצאות אמיתיות.',
}

const triggers = [
  { icon: '🔄', title: 'החלפת עבודה', desc: 'כל מעבר בין מעסיקים עשוי ליצור זכאות להחזר' },
  { icon: '👶', title: 'חופשת לידה', desc: 'חזרה לעבודה לאחר לידה מייצרת לעיתים עודף מס' },
  { icon: '🎓', title: 'סיום תואר אקדמי', desc: 'זיכוי מס על שכר לימוד לשנים שלאחר הסיום' },
  { icon: '👨‍👩‍👧', title: 'ילדים', desc: 'נקודות זיכוי על ילדים, לרבות ילדים עם צרכים מיוחדים' },
  { icon: '💝', title: 'תרומות', desc: 'תרומות לעמותות מוכרות מזכות בהחזר מס' },
  { icon: '🏘️', title: 'מגורים בפריפריה', desc: 'ישובי עדיפות לאומית זכאים להטבות מס' },
  { icon: '💼', title: 'כמה מקומות עבודה', desc: 'עבודה אצל מספר מעסיקים לרוב מובילה לתשלום יתר' },
  { icon: '📊', title: 'הכנסות לא קבועות', desc: 'בונוסים, מענקים או הכנסות משתנות מצריכות בדיקה' },
]

const processSteps = [
  {
    icon: '📋',
    num: '01',
    title: 'שאלון חינם',
    desc: 'מילוי שאלון קצר אונליין בכ-5 דקות. לא צריך להביא שום דבר בשלב זה.',
  },
  {
    icon: '📁',
    num: '02',
    title: 'הכנת המסמכים',
    desc: 'אלמוג תוביל אותך בדיוק אילו מסמכים נחוצים ותסביר כיצד להשיגם.',
  },
  {
    icon: '📨',
    num: '03',
    title: 'הגשה לרשות המסים',
    desc: 'אנחנו מגישים את הבקשה ועוקבים אחרי ההתקדמות בשבילך.',
  },
  {
    icon: '🏦',
    num: '04',
    title: 'קבלת הכסף',
    desc: 'ההחזר מועבר ישירות לחשבון הבנק שלך. ממוצע של 3-6 שבועות.',
  },
]

const trustItems = [
  { icon: '🏛️', text: 'מוסמכת רשות המסים' },
  { icon: '👥', text: 'מאות לקוחות מרוצים' },
  { icon: '🤝', text: 'ללא עמלת הצלחה עד קבלת כסף' },
  { icon: '🔒', text: 'סודיות מלאה ושמירה על פרטיות' },
]

const faqs = [
  {
    q: 'מהו טווח הסכומים שאפשר לקבל?',
    a: 'החזרי מס נעים בין מאות לעשרות אלפי שקלים. הממוצע בלקוחות שלנו עומד על ₪15,000. יש מקרים שהגענו ל-₪40,000 עבור מספר שנים יחד.',
  },
  {
    q: 'האם אפשר לתבוע החזר על שנים עברו?',
    a: 'כן! ניתן לתבוע החזר על עד 6 שנים אחורה. כלומר כיום ניתן להגיש עבור שנות המס 2019 ואילך.',
  },
  {
    q: 'מה קורה אם לא מגיע לי החזר?',
    a: 'הבדיקה הראשונית היא חינם. אם לאחר הבדיקה עולה שלא מגיע לך החזר – לא תשלם אגורה. הגישה שלנו היא "שלם רק אם מצאנו לך כסף".',
  },
  {
    q: 'מה לגבי שכירים בלבד – גם להם מגיע?',
    a: 'בהחלט! רוב לקוחותינו הם שכירים. שכירים שהחליפו עבודה, יצאו לחופשת לידה, סיימו תואר, או עובדים אצל יותר ממעסיק אחד – לרוב זכאים להחזר.',
  },
  {
    q: 'האם יש סכנה שאדרש לשלם יותר?',
    a: 'אנחנו בודקים את כל הפרמטרים לפני ההגשה ולא מגישים בקשה אם יש ספק. בכל השנים לא הגשנו בקשה שגרמה ללקוח לחוב. הבדיקה שלנו מגינה עליך.',
  },
]

function FAQItemServer({ q, a }: { q: string; a: string }) {
  return (
    <details style={{
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      marginBottom: '12px',
      background: 'white',
      overflow: 'hidden',
    }}>
      <summary style={{
        padding: '20px 24px',
        cursor: 'pointer',
        fontWeight: 700,
        color: '#0E1E40',
        fontSize: '1rem',
        listStyle: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
      }}>
        <span>{q}</span>
        <span style={{ color: '#C9A84C', fontSize: '1.2rem', flexShrink: 0, marginRight: '8px' }}>▾</span>
      </summary>
      <div style={{
        padding: '0 24px 20px',
        color: '#4A5568',
        lineHeight: 1.7,
        fontSize: '0.95rem',
      }}>
        {a}
      </div>
    </details>
  )
}

export default function TaxRefundPage() {
  return (
    <div style={{ fontFamily: 'Heebo, sans-serif', direction: 'rtl', paddingTop: '80px' }}>

      {/* ===== HERO ===== */}
      <section style={{
        background: 'linear-gradient(160deg, #0E1E40 0%, #0c1c3a 50%, #091525 100%)',
        padding: '80px 24px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px', background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.35)', borderRadius: '50px',
            marginBottom: '28px', color: '#E8C96A', fontSize: '0.82rem', fontWeight: 700,
          }}>
            💰 מבצע: בדיקת זכאות חינם
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '20px',
          }}>
            החזר מס ממוצע של{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ₪15,000
            </span>
            {' '}– כבר חיכה לך
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem',
            lineHeight: 1.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px',
          }}>
            בדיקה חינם תוך 2 דקות. ללא התחייבות. תשלום רק אם מצאנו לך כסף.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/questionnaire" style={{
              padding: '18px 44px',
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: '#0E1E40', fontWeight: 800, fontSize: '1.1rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(201,168,76,0.4)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              בדיקה חינם עכשיו →
            </Link>
            <a href="https://wa.me/972500000000" target="_blank" rel="noopener noreferrer" style={{
              padding: '17px 36px', background: 'transparent',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              borderRadius: '50px', border: '2px solid rgba(255,255,255,0.3)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              💬 שאל שאלה בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      {/* ===== WHO IS IT FOR ===== */}
      <section style={{ padding: '100px 24px', background: '#F7F9FC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 18px', background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)', borderRadius: '50px',
              marginBottom: '16px', color: '#C9A84C', fontSize: '0.82rem', fontWeight: 700,
            }}>
              ✦ האם זה בשבילך?
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#0E1E40', marginBottom: '12px' }}>
              מי זכאי להחזר מס?
            </h2>
            <p style={{ color: '#4A5568', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              אם אחד מהמצבים הבאים מוכר לך – כנראה שמגיע לך כסף בחזרה
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
          className="triggers-grid"
          >
            {triggers.map((item, i) => (
              <div key={item.title} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px 20px',
                boxShadow: '0 4px 20px rgba(14,30,64,0.06)',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-6px)'
                el.style.borderColor = '#C9A84C'
                el.style.boxShadow = '0 16px 40px rgba(14,30,64,0.12)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.borderColor = '#E2E8F0'
                el.style.boxShadow = '0 4px 20px rgba(14,30,64,0.06)'
              }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, color: '#0E1E40', fontSize: '1rem', marginBottom: '8px' }}>{item.title}</div>
                <p style={{ color: '#718096', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <p style={{ color: '#4A5568', fontSize: '1rem', marginBottom: '20px' }}>
              לא בטוח אם זה מתאים לך? מלא את השאלון ונבדוק בחינם
            </p>
            <Link href="/questionnaire" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 36px', background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: '#0E1E40', fontWeight: 800, fontSize: '1rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(201,168,76,0.3)',
            }}>
              בדוק אם מגיע לי החזר
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: '#0E1E40', marginBottom: '12px' }}>
              איך זה עובד?
            </h2>
            <p style={{ color: '#4A5568', fontSize: '1rem' }}>4 שלבים פשוטים מהשאלון ועד הכסף בחשבון</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
          className="process-grid"
          >
            {processSteps.map((step, i) => (
              <div key={step.num} style={{
                textAlign: 'center',
                position: 'relative',
              }}>
                {i < processSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '-12px',
                    width: '24px',
                    height: '2px',
                    background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
                    opacity: 0.4,
                  }} className="process-arrow" />
                )}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg, #C9A84C, #E8C96A)' : '#F7F9FC',
                  border: i === 0 ? 'none' : '2px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.6rem',
                  boxShadow: i === 0 ? '0 8px 24px rgba(201,168,76,0.25)' : 'none',
                }}>
                  {step.icon}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(201,168,76,0.1)',
                  color: '#C9A84C',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  marginBottom: '10px',
                }}>
                  שלב {step.num}
                </div>
                <h3 style={{ fontWeight: 800, color: '#0E1E40', fontSize: '1rem', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: '#4A5568', fontSize: '0.85rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST INDICATORS ===== */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #0E1E40, #1B3358)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
          }}>
            {trustItems.map((item) => (
              <div key={item.text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'white',
              }}>
                <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BIG CTA ===== */}
      <section style={{
        padding: '100px 24px',
        background: '#F7F9FC',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(160deg, #0E1E40, #1B3358)',
            borderRadius: '24px',
            padding: '60px 48px',
            boxShadow: '0 24px 80px rgba(14,30,64,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30%', right: '-20%',
              width: '300px', height: '300px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 900, color: 'white', marginBottom: '16px',
              position: 'relative', zIndex: 1,
            }}>
              התחל בדיקה חינם עכשיו
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '1rem', lineHeight: 1.7, marginBottom: '36px',
              position: 'relative', zIndex: 1,
            }}>
              פחות מ-5 דקות • חינם לחלוטין • תשלום רק אם מצאנו לך כסף
            </p>
            <Link href="/questionnaire" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '18px 48px',
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: '#0E1E40', fontWeight: 800, fontSize: '1.1rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(201,168,76,0.4)',
              position: 'relative', zIndex: 1,
            }}>
              💰 בדוק אם מגיע לי →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2rem)',
            fontWeight: 900, color: '#0E1E40',
            marginBottom: '40px', textAlign: 'center',
          }}>
            שאלות נפוצות על החזר מס
          </h2>
          {faqs.map((faq) => (
            <FAQItemServer key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 900px) {
          .triggers-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .process-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .process-arrow { display: none !important; }
        }
        @media (max-width: 600px) {
          .triggers-grid { grid-template-columns: 1fr !important; }
          .process-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
