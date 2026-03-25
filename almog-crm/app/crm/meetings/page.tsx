'use client'

import Link from 'next/link'

export default function MeetingsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9FC',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: '#0E1E40',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/crm" style={{ color: '#E8C96A', fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none' }}>
            אלמוג | CRM
          </Link>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'לידים', href: '/crm' },
              { label: 'לקוחות', href: '/crm/clients' },
              { label: 'פגישות', href: '/crm/meetings' },
              { label: 'מסמכים', href: '/crm/documents' },
              { label: 'הגדרות', href: '/crm/settings' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                color: item.href === '/crm/meetings' ? '#fff' : 'rgba(255,255,255,.45)',
                fontSize: '.82rem',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                background: item.href === '/crm/meetings' ? 'rgba(255,255,255,.1)' : 'transparent',
                fontWeight: item.href === '/crm/meetings' ? 700 : 400,
              }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{
            color: 'rgba(255,255,255,.4)', fontSize: '.82rem', textDecoration: 'none',
          }}>
            האתר ←
          </a>
          <button
            onClick={() => { sessionStorage.clear(); window.location.reload() }}
            style={{
              background: 'rgba(255,255,255,.08)', border: 'none',
              color: 'rgba(255,255,255,.5)', padding: '6px 14px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '.8rem',
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            יציאה
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px' }}>
        <div style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '48px 40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 900, color: '#1A1A2E',
            marginBottom: '12px',
          }}>
            פגישות
          </h1>
          <p style={{
            fontSize: '1rem', color: '#4A5568',
            fontWeight: 600, marginBottom: '8px',
          }}>
            העמוד הזה עדיין בבנייה
          </p>
          <p style={{
            fontSize: '.88rem', color: '#8492A6',
            marginBottom: '36px', lineHeight: 1.7,
          }}>
            בקרוב יהיה אפשר לנהל כאן נתונים ותהליכים רלוונטיים
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/crm" style={{
              padding: '10px 24px',
              background: '#0E1E40',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '.88rem',
              fontWeight: 700,
            }}>
              חזרה ללידים
            </Link>
            <Link href="/crm" style={{
              padding: '10px 24px',
              background: '#fff',
              color: '#0E1E40',
              border: '1px solid #CBD5E0',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '.88rem',
              fontWeight: 700,
            }}>
              לוח בקרה
            </Link>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&display=swap');`}</style>
    </div>
  )
}
