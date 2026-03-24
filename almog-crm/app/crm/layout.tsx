'use client'

import { useState, useEffect } from 'react'

// Simple password gate for MVP CRM
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const saved = sessionStorage.getItem('crm_auth')
    if (saved === 'true') setAuthed(true)
    setChecking(false)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // In production: verify against env var via API route
    // For MVP: store in session if matches a known hash
    // Here we rely on the /api routes to enforce the password
    sessionStorage.setItem('crm_auth', 'true')
    sessionStorage.setItem('crm_pw', pw)
    setAuthed(true)
  }

  if (checking) return null

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0E1E40, #1B3358)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Heebo', sans-serif",
        direction: 'rtl',
      }}>
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px',
          padding: '40px',
          width: '360px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            כניסה לCRM
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', marginBottom: '28px' }}>
            ניהול לידים — אלמוג בן דוד
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="סיסמה"
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '10px',
                border: `2px solid ${error ? '#EF4444' : 'rgba(255,255,255,.15)'}`,
                background: 'rgba(255,255,255,.06)',
                color: '#fff', fontFamily: "'Heebo', sans-serif",
                fontSize: '1rem', outline: 'none', marginBottom: '16px',
                direction: 'ltr',
              }}
            />
            {error && <p style={{ color: '#FCA5A5', fontSize: '.82rem', marginBottom: '12px' }}>סיסמה שגויה</p>}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                color: '#0E1E40', borderRadius: '50px',
                border: 'none', fontFamily: "'Heebo', sans-serif",
                fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
              }}
            >
              כניסה →
            </button>
          </form>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800&display=swap');`}</style>
      </div>
    )
  }

  return <>{children}</>
}
