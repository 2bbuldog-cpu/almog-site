'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '')
      setLoading(false)
    })
  }, [])

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) return
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'הסיסמאות אינן תואמות' })
      return
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'סיסמה חייבת להכיל לפחות 6 תווים' })
      return
    }
    setSaving(true)
    setMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMsg({ type: 'error', text: 'שגיאה בעדכון הסיסמה: ' + error.message })
    } else {
      setMsg({ type: 'success', text: '✓ הסיסמה עודכנה בהצלחה' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    border: '2px solid #E2E8F0', borderRadius: '10px',
    fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
    outline: 'none', color: '#0E1E40', direction: 'ltr',
    transition: 'border-color 0.2s ease',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: '#718096' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          <div>טוען...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ direction: 'rtl', maxWidth: '520px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>⚙️ הגדרות</h1>
      <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '28px' }}>ניהול חשבון המערכת</p>

      {/* Account Info */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 28px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px',
      }}>
        <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '16px', fontSize: '0.95rem' }}>
          👤 פרטי חשבון
        </h3>
        <div style={{ padding: '12px 16px', background: '#F7F9FC', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600, marginBottom: '4px' }}>אימייל כניסה</div>
          <div style={{ fontWeight: 700, color: '#0E1E40', direction: 'ltr', fontSize: '0.9rem' }}>{email}</div>
        </div>
      </div>

      {/* Change Password */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 28px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px',
      }}>
        <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '20px', fontSize: '0.95rem' }}>
          🔒 שינוי סיסמה
        </h3>
        <form onSubmit={changePassword}>
          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
              background: msg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(229,62,62,0.08)',
              border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(229,62,62,0.2)'}`,
              color: msg.type === 'success' ? '#15803D' : '#C53030',
              fontSize: '0.85rem', fontWeight: 600,
            }}>
              {msg.text}
            </div>
          )}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#718096', marginBottom: '6px' }}>
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#718096', marginBottom: '6px' }}>
              אימות סיסמה
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                ...inputStyle,
                borderColor: confirmPassword && confirmPassword !== newPassword ? '#C53030' : '#E2E8F0',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = confirmPassword && confirmPassword !== newPassword ? '#C53030' : '#E2E8F0' }}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newPassword}
            style={{
              padding: '12px 28px', borderRadius: '50px',
              background: saving || !newPassword ? '#E2E8F0' : 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              color: saving || !newPassword ? '#A0AEC0' : '#0E1E40',
              fontWeight: 800, fontSize: '0.9rem',
              border: 'none', cursor: saving || !newPassword ? 'default' : 'pointer',
              fontFamily: 'Heebo, sans-serif',
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? 'שומר...' : 'עדכן סיסמה'}
          </button>
        </form>
      </div>

      {/* Info */}
      <div style={{
        background: 'rgba(14,30,64,0.04)', borderRadius: '12px', padding: '16px 18px',
        border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#718096', lineHeight: 1.7,
      }}>
        <strong style={{ color: '#0E1E40' }}>מערכת CRM — אלמוג בן דוד רו&quot;ח</strong><br />
        גישה מורשית בלבד · כל הנתונים מאוחסנים בצורה מאובטחת ב-Supabase
      </div>
    </div>
  )
}
