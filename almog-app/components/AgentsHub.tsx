'use client'

export default function AgentsHub() {
  const cards = [
    {
      title: 'יצירת לידים',
      description: 'לכידה וסינון אוטומטי של לידים חדשים ממקורות שונים.',
      icon: '🎯',
    },
    {
      title: 'ניהול לקוחות',
      description: 'מעקב אחר תקשורת, מסמכים ומשימות — במקום אחד.',
      icon: '👥',
    },
    {
      title: 'כלים פיננסיים',
      description: 'חישובי מס, הערכות החזר וסיכומים פיננסיים בלחיצה.',
      icon: '📊',
    },
  ]

  return (
    <section style={{ padding: '64px 16px', direction: 'rtl' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0E1E40', marginBottom: '12px' }}>
          מרכז הסוכנים
        </h2>
        <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '48px' }}>
          כלים חכמים לייעול העבודה וצמיחת בסיס הלקוחות
        </p>
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {cards.map((card) => (
            <div
              key={card.title}
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(14,30,64,0.08)',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
              }}
            >
              <span style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{card.icon}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                {card.title}
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
                {card.description}
              </p>
              <a
                href="/crm"
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                  color: '#0E1E40',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                }}
              >
                התחל עכשיו
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
