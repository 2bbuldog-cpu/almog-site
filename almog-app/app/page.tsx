'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
const WHATSAPP_URL = 'https://wa.me/972547312262'

const services = [
  {
    title: 'החזרי מס',
    description: 'בדיקה חינם, הגשה מהירה, תוצאות אמיתיות. בממוצע ₪15,000 חזרה לכיס.',
    href: '/tax-refund',
    cta: 'בדוק זכאות חינם',
  },
  {
    title: 'פתיחת עסק',
    description: 'עוסק פטור, מורשה או חברה? נחליט יחד מה הכי משתלם עבורך.',
    href: '/service-business',
    cta: 'קבל ייעוץ',
  },
  {
    title: 'תכנון פרישה',
    description: 'תכנון פיננסי לקראת פרישה — כמה צברת, כמה תצטרך, מה עושים עכשיו.',
    href: '/service-retirement',
    cta: 'לפרטים נוספים',
  },
]

const whyUs = [
  { title: 'מקצועיות', desc: 'רישיון מלא מרשות המסים, ניסיון של מעל 10 שנים' },
  { title: 'זמינות', desc: 'זמינה בוואטסאפ גם בשעות הלא שגרתיות' },
  { title: 'שקיפות', desc: 'מחירים ברורים מראש, ללא הפתעות ועמלות נסתרות' },
  { title: 'תוצאות', desc: 'מאות לקוחות מרוצים ומליוני שקלים שהוחזרו' },
]

const steps = [
  { num: '01', title: 'בדיקה חינם', desc: 'מילוי שאלון קצר אונליין – פחות מ-5 דקות' },
  { num: '02', title: 'הגשת מסמכים', desc: 'אנחנו מסבירים בדיוק מה צריך ומגישים בשבילך' },
  { num: '03', title: 'קבלת כסף', desc: 'הכסף מועבר ישירות לחשבון הבנק שלך' },
]

const testimonials = [
  {
    name: 'ידידה כהן',
    city: 'באר שבע',
    amount: '22,000 ₪',
    text: 'לא ידעתי שמגיע לי כל כך הרבה כסף. אלמוג הסבירה הכל בסבלנות ותוך שבועיים הכסף היה בחשבון שלי.',
    initials: 'יכ',
  },
  {
    name: 'מרים לוי',
    city: 'אשדוד',
    amount: '18,500 ₪',
    text: 'ניסיתי לעשות לבד ולא הצלחתי. אלמוג דאגה לכל הניירת ואני קיבלתי החזר על 4 שנים אחורה. ממליצה בחום!',
    initials: 'מל',
  },
  {
    name: 'דוד אברהם',
    city: 'ירושלים',
    amount: '31,000 ₪',
    text: 'החלפתי עבודה כמה פעמים ויצאתי לחופשת לידה. אלמוג זיהתה את כל הזכאויות שלי. שירות יוצא מן הכלל.',
    initials: 'דא',
  },
]

const faqs = [
  {
    q: 'כמה כסף אפשר לקבל בהחזר מס?',
    a: 'ההחזר הממוצע שלנו עומד על ₪15,000, אך יש מקרים של ₪30,000-40,000. הסכום תלוי בשנות המס, רמת ההכנסה, מצב משפחתי ונסיבות אישיות כמו החלפת עבודה, חופשת לידה, ולימודים.',
  },
  {
    q: 'עד כמה שנים אחורה אפשר לתבוע?',
    a: 'ניתן לתבוע החזר מס עד 6 שנים אחורה. כלומר, נכון ל-2024, ניתן להגיש עבור שנות המס 2019-2023 (ועבור 2024 מ-2025 ואילך).',
  },
  {
    q: 'כמה זמן לוקח התהליך?',
    a: 'לאחר הגשת המסמכים המלאה, מס הכנסה מעבד את הבקשה בתוך 3-6 שבועות בממוצע. אנחנו עוקבים אחרי הבקשה ומודיעים לך עם כל עדכון.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'הבדיקה הראשונית חינם לחלוטין. התשלום הוא רק במקרה שאנחנו מצליחים להחזיר לך כסף – עמלת הצלחה שנקבעת מראש ומפורטת בהסכם. ללא הצלחה – ללא תשלום.',
  },
  {
    q: 'מה צריך להכין?',
    a: 'תלושי שכר, טפסי 106 מהמעסיק, תעודת זהות, ספח תעודת זהות ומספר חשבון בנק. לפי הנסיבות, ייתכן שיידרשו מסמכים נוספים כמו אישור לידה, אישור תרומה, אישור לימודים וכו\'.',
  },
  {
    q: 'מה ההבדל בין תיאום מס להחזר מס?',
    a: 'תיאום מס הוא הסדר מראש שמונע תשלום מס עודף לאורך השנה – בעיקר רלוונטי כשיש כמה מקומות עבודה. החזר מס הוא תביעה בדיעבד על מס שכבר שולם יתר על המידה. שני השירותים חשובים וחוסכים כסף.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        border: `1px solid ${open ? '#C9A84C' : '#E2E8F0'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
        transition: 'border-color 0.3s ease',
        background: 'white',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'right',
          fontFamily: 'Heebo, sans-serif',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#0E1E40',
          direction: 'rtl',
        }}
      >
        <span style={{ flex: 1, textAlign: 'right' }}>{q}</span>
        <span style={{
          marginRight: '12px',
          fontSize: '1.2rem',
          color: '#C9A84C',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
          flexShrink: 0,
        }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 24px 20px',
          color: '#4A5568',
          lineHeight: 1.7,
          fontSize: '0.95rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Heebo, sans-serif', direction: 'rtl' }}>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0E1E40 0%, #0c1c3a 50%, #091525 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '80px',
      }}>
        {/* Subtle background texture */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
          background: 'radial-gradient(ellipse at 70% 40%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
          className="hero-grid"
          >
            {/* Text Content */}
            <div style={{ animation: 'fadeIn 0.8s ease both' }}>
              <div style={{
                marginBottom: '20px',
                color: 'rgba(232,201,106,0.8)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}>
                רואת חשבון מוסמכת | באר שבע ואונליין
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '20px',
                letterSpacing: '-0.3px',
              }}>
                מגיע לך יותר{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ממה שאתה חושב
                </span>
              </h1>

              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                marginBottom: '36px',
                maxWidth: '500px',
              }}>
                אלמוג בן דוד, רואת חשבון מוסמכת – מתמחה בהחזרי מס, פתיחת עסק ותכנון פרישה.
                ייעוץ ראשוני חינם, ללא התחייבות.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/sheelon"
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                    color: '#0E1E40',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  בדיקת זכאות — חינם
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '13px 28px',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'all 0.25s ease',
                  }}
                >
                  ייעוץ ראשוני בוואטסאפ
                </a>
              </div>

              <div style={{
                marginTop: '48px',
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
              }}>
                {[
                  { num: '500+', label: 'לקוחות מרוצים' },
                  { num: '₪15K', label: 'החזר ממוצע' },
                  { num: '10+', label: 'שנות ניסיון' },
                ].map((stat) => (
                  <div key={stat.num}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>{stat.num}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Almog Image */}
            <div className="hero-image-wrap" style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              animation: 'fadeIn 1s ease 0.3s both',
            }}>
              <div style={{
                width: '400px',
                maxWidth: '100%',
                position: 'relative',
              }}>
                <Image
                  src="/almog-nobg.png"
                  alt="אלמוג בן דוד"
                  width={400}
                  height={500}
                  style={{
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.35))',
                    maxWidth: '100%',
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.75rem',
          animation: 'fadeIn 1s ease 1.5s both',
        }}>
          <div style={{
            width: '24px',
            height: '38px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '6px',
          }}>
            <div style={{
              width: '4px',
              height: '8px',
              background: 'rgba(201,168,76,0.6)',
              borderRadius: '2px',
              animation: 'bounce 1.5s ease infinite alternate',
            }} />
          </div>
          גלול למטה
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section style={{
        background: '#C9A84C',
        padding: '24px',
        borderBottom: '1px solid rgba(14,30,64,0.1)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '56px',
          flexWrap: 'wrap',
        }}>
          {[
            { num: '500+', label: 'לקוחות' },
            { num: '₪15,000', label: 'החזר ממוצע' },
            { num: '10+', label: 'שנות ניסיון' },
          ].map((item) => (
            <div key={item.num} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0E1E40', lineHeight: 1 }}>
                {item.num}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(14,30,64,0.65)', fontWeight: 600, marginTop: '3px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="page-section" style={{ padding: '100px 24px', background: '#F7F9FC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 800,
              color: '#0E1E40',
              marginBottom: '12px',
            }}>
              השירותים שלנו
            </h2>
            <p style={{ fontSize: '1rem', color: '#4A5568', lineHeight: 1.6 }}>
              בדיקה ראשונית חינם, ללא התחייבות
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="services-grid"
          >
            {services.map((service, i) => (
              <div
                key={service.title}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  boxShadow: '0 2px 12px rgba(14,30,64,0.06)',
                  border: '1px solid #E2E8F0',
                  borderTop: '3px solid #C9A84C',
                  transition: 'all 0.25s ease',
                  animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = '0 8px 28px rgba(14,30,64,0.1)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.boxShadow = '0 2px 12px rgba(14,30,64,0.06)'
                }}
              >
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#0E1E40',
                  marginBottom: '12px',
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: '#4A5568',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  flex: 1,
                  marginBottom: '24px',
                }}>
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#C9A84C',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'gap 0.3s ease',
                  }}
                >
                  {service.cta} ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY US SECTION ===== */}
      <section className="page-section" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
          className="why-grid"
          >
            {/* Left: Image */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(14,30,64,0.12)',
                position: 'relative',
              }}>
                <Image
                  src="/almog-bg.jpg"
                  alt="אלמוג בן דוד"
                  width={520}
                  height={580}
                  style={{ objectFit: 'cover', width: '100%', height: '480px', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '24px',
                  background: 'rgba(14,30,64,0.92)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  color: 'white',
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#E8C96A' }}>₪15,000</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>ממוצע החזר מס</div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: '#0E1E40',
                marginBottom: '12px',
                lineHeight: 1.25,
              }}>
                למה לבחור באלמוג?
              </h2>
              <p style={{ color: '#4A5568', lineHeight: 1.7, marginBottom: '32px', fontSize: '0.95rem' }}>
                עשר שנות ניסיון, מאות לקוחות מרוצים, שקיפות מלאה בכל שלב.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {whyUs.map((item) => (
                  <div key={item.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '4px',
                      height: '44px',
                      borderRadius: '2px',
                      background: '#C9A84C',
                      flexShrink: 0,
                      marginTop: '2px',
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ color: '#4A5568', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="page-section" style={{ padding: '100px 24px', background: '#F7F9FC' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0E1E40', marginBottom: '10px' }}>
              איך זה עובד
            </h2>
            <p style={{ color: '#4A5568', fontSize: '0.95rem' }}>מהרגע שממלאים את השאלון ועד שהכסף בחשבון</p>
          </div>

          <div style={{ display: 'flex', gap: '24px', position: 'relative' }} className="steps-grid">
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '15%',
              left: '15%',
              height: '2px',
              background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
              opacity: 0.3,
              zIndex: 0,
            }} className="steps-line" />
            {steps.map((step, i) => (
              <div key={step.num} style={{
                flex: 1,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                animation: `fadeIn 0.5s ease ${i * 0.15}s both`,
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: i === 0 ? 'linear-gradient(135deg, #C9A84C, #E8C96A)' : 'white',
                  border: i === 0 ? 'none' : '3px solid #C9A84C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: i === 0 ? '#0E1E40' : '#C9A84C',
                  boxShadow: '0 8px 24px rgba(201,168,76,0.2)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontWeight: 800, color: '#0E1E40', fontSize: '1.1rem', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '220px', margin: '0 auto' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/questionnaire" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: '#0E1E40', fontWeight: 800, fontSize: '1.05rem',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
            }}>
              התחל עכשיו – חינם וללא התחייבות →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="page-section" style={{ padding: '100px 24px', background: '#0E1E40' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600,
              letterSpacing: '0.04em', marginBottom: '12px',
            }}>
              ביקורות לקוחות
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
              הם כבר קיבלו את ההחזר שלהם
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={t.name} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '32px 28px',
                animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.08)'
                el.style.borderColor = 'rgba(201,168,76,0.4)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  marginBottom: '20px',
                }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ color: '#E8C96A', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{
                  color: 'rgba(255,255,255,0.8)', lineHeight: 1.7,
                  fontSize: '0.95rem', marginBottom: '24px', fontStyle: 'italic',
                }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#0E1E40', fontSize: '0.85rem',
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{t.city}</div>
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(232,201,106,0.2))',
                    border: '1px solid rgba(201,168,76,0.35)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ color: '#E8C96A', fontWeight: 900, fontSize: '1rem' }}>{t.amount}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>החזר מס</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ===== FAQ SECTION ===== */}
      <section className="page-section" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0E1E40', marginBottom: '10px' }}>
              שאלות נפוצות
            </h2>
            <p style={{ color: '#4A5568', fontSize: '0.95rem' }}>תשובות לשאלות שעולות לרוב לפני שמתחילים</p>
          </div>

          <div>
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="contact" className="page-section" style={{
        padding: '100px 24px',
        background: 'linear-gradient(160deg, #0E1E40 0%, #0c1c3a 60%, #091525 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800, color: 'white',
            marginBottom: '16px', lineHeight: 1.25,
          }}>
            מוכן לבדוק מה מגיע לך?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '36px' }}>
            השאלון לוקח פחות מ-5 דקות. חינם לחלוטין, ללא התחייבות.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/questionnaire"
              style={{
                padding: '14px 36px',
                background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                color: '#0E1E40', fontWeight: 700, fontSize: '1rem',
                borderRadius: '50px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              בדיקת זכאות — חינם
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '13px 32px',
                background: 'transparent', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '1rem',
                borderRadius: '50px', border: '1.5px solid rgba(255,255,255,0.3)',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}
            >
              ייעוץ בוואטסאפ
            </a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '20px' }}>
            תשלום רק אם מצאנו לך כסף
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#091525',
        padding: '40px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ color: '#E8C96A', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
            אלמוג בן דוד | רואת חשבון מוסמכת
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            © {new Date().getFullYear()} כל הזכויות שמורות | אין לראות באתר זה ייעוץ מקצועי מחייב
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'פרטיות', href: '/privacy' },
              { label: 'תנאי שימוש', href: '/terms' },
              { label: 'נגישות', href: '/accessibility' },
            ].map(link => (
              <a key={link.label} href={link.href} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textDecoration: 'none' }}>
                {link.label}
              </a>
            ))}
            <Link href="/crm" style={{ color: 'rgba(201,168,76,0.5)', fontSize: '0.82rem', textDecoration: 'none' }}>
              כניסה למערכת
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .why-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .steps-grid { flex-direction: column !important; }
          .steps-line { display: none !important; }
        }
        @media (min-width: 901px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @keyframes bounce {
          to { transform: translateY(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
