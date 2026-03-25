'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CRMLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('אנא הכנס סיסמה')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/crm-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!res.ok) {
      setError('סיסמה שגויה. נסה שוב.')
      setLoading(false)
      return
    }

    sessionStorage.setItem('crm_auth', 'true')
    router.replace('/crm')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0E1E40 0%, #0c1c3a 60%, #091525 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        animation: 'fadeIn 0.6s ease both',
      }}>
        {/* Logo Area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            fontSize: '1.8rem', marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(201,168,76,0.3)',
          }}>
            🏛️
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '6px' }}>
            כניסה למערכת CRM
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
            אלמוג בן דוד | ניהול לקוחות
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(12px)',
          }}
        >
          {error && (
            <div style={{
              background: 'rgba(229,62,62,0.15)',
              border: '1px solid rgba(229,62,62,0.3)',
              borderRadius: '10px', padding: '12px 16px',
              color: '#FC8181', fontSize: '0.88rem',
              marginBottom: '20px', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.7)', marginBottom: '8px',
            }}>
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              required
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: 'white',
                fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                direction: 'ltr', outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(201,168,76,0.6)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: '#0E1E40', fontWeight: 800, fontSize: '1rem',
              border: 'none', borderRadius: '50px',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'Heebo, sans-serif',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(201,168,76,0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'מתחבר...' : 'כניסה למערכת →'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem',
        }}>
          גישה מורשית בלבד
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  )
}
