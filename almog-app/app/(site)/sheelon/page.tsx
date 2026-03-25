'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface SheelonData {
  years: number[]
  employment_type: 'employee' | 'self_employed' | 'both' | 'unemployed' | ''
  changed_jobs: boolean | null
  changed_jobs_count: number
  had_unemployment: boolean
  had_maternity: boolean
  had_milieu: boolean
  sold_stocks: boolean
  sold_crypto: boolean
  sold_property: boolean
  children: boolean | null
  children_count: number
  single_parent: boolean
  spouse_not_working: boolean
  donations: boolean | null
  donations_amount: string
  academic_degree: boolean | null
  degree_year: string
  has_mortgage: boolean
  has_life_insurance: boolean
  special_points_extra: string[]
  income_range: '' | 'under_60k' | '60k_120k' | '120k_200k' | 'over_200k'
  city: string
  full_name: string
  phone: string
  email: string
  notes: string
}

const INITIAL: SheelonData = {
  years: [],
  employment_type: '',
  changed_jobs: null,
  changed_jobs_count: 0,
  had_unemployment: false,
  had_maternity: false,
  had_milieu: false,
  sold_stocks: false,
  sold_crypto: false,
  sold_property: false,
  children: null,
  children_count: 0,
  single_parent: false,
  spouse_not_working: false,
  donations: null,
  donations_amount: '',
  academic_degree: null,
  degree_year: '',
  has_mortgage: false,
  has_life_insurance: false,
  special_points_extra: [],
  income_range: '',
  city: '',
  full_name: '',
  phone: '',
  email: '',
  notes: '',
}

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
const TOTAL_STEPS = 9

const STEP_LABELS = ['שנות מס', 'תעסוקה', 'אירועי עבודה', 'אירועי הון', 'משפחה', 'זיכויים', 'נקודות', 'מידע', 'פרטים']

// ─── Live refund estimator ──────────────────────────────────────────────────

function estimateRefund(data: SheelonData): { min: number; max: number } | null {
  if (data.years.length === 0) return null
  let min = 0, max = 0
  const y = data.years.length
  min += y * 1500; max += y * 4000
  if (data.changed_jobs) { min += 2500; max += 7000 }
  if (data.had_maternity) { min += 4000; max += 10000 }
  if (data.had_milieu) { min += 800; max += 2500 }
  if (data.had_unemployment) { min += 1000; max += 3500 }
  if (data.sold_stocks || data.sold_crypto || data.sold_property) { min += 2000; max += 9000 }
  if (data.children && data.children_count > 0) { min += data.children_count * 1500; max += data.children_count * 3500 }
  if (data.single_parent) { min += 1500; max += 3000 }
  if (data.donations) { const d = parseInt(data.donations_amount) || 0; min += Math.round(d * 0.2); max += Math.round(d * 0.35) }
  if (data.academic_degree) { min += 800; max += 2500 }
  if (data.has_mortgage) { min += 500; max += 2000 }
  if (data.has_life_insurance) { min += 400; max += 1500 }
  min += data.special_points_extra.length * 600; max += data.special_points_extra.length * 2000
  const incBonus = data.income_range === '120k_200k' ? 2000 : data.income_range === 'over_200k' ? 3500 : 0
  min += incBonus; max += incBonus * 1.5
  return { min: Math.round(min / 500) * 500, max: Math.round(max / 500) * 500 }
}

function fmtILS(n: number) { return '₪' + n.toLocaleString('he-IL') }

const SPECIAL_OPTIONS = [
  { id: 'disability', label: 'נכות (75% ומעלה)', icon: '♿' },
  { id: 'new_immigrant', label: 'עולה חדש (3 שנים ראשונות)', icon: '✈️' },
  { id: 'divorced', label: 'גרוש/ה', icon: '⚖️' },
  { id: 'soldier', label: 'שחרור מצבאי', icon: '🪖' },
  { id: 'periphery', label: 'מגורים בפריפריה', icon: '📍' },
  { id: 'bereaved', label: 'שכול', icon: '🕊️' },
]

// ─── Color palette ───────────────────────────────────────────────────────────

const C = {
  navy: '#0E1E40',
  navyMid: '#1B3358',
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  goldPale: '#FDF5E0',
  white: '#FFFFFF',
  light: '#F7F9FC',
  border: '#E2E8F0',
  textMid: '#4A5568',
  textLight: '#718096',
  green: '#15803D',
  greenBg: 'rgba(34,197,94,0.08)',
  error: '#C53030',
  errorBg: 'rgba(229,62,62,0.08)',
}

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function StepTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: C.navy, margin: 0, lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ color: C.textMid, fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.5 }}>{sub}</p>}
    </div>
  )
}

function YesNo({
  value, onChange, yesLabel = 'כן', noLabel = 'לא',
}: { value: boolean | null; onChange: (v: boolean) => void; yesLabel?: string; noLabel?: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {[
        { v: true, label: yesLabel, icon: '✓' },
        { v: false, label: noLabel, icon: '✗' },
      ].map(({ v, label, icon }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            border: `2px solid ${value === v ? (v ? C.green : C.error) : C.border}`,
            background: value === v ? (v ? C.greenBg : C.errorBg) : C.white,
            color: value === v ? (v ? C.green : C.error) : C.textMid,
            fontWeight: value === v ? 800 : 500,
            fontSize: '0.95rem', cursor: 'pointer',
            fontFamily: 'Heebo, sans-serif',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}

function CheckCard({
  checked, onChange, label, icon, sub,
}: { checked: boolean; onChange: () => void; label: string; icon?: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: '12px',
        border: `2px solid ${checked ? C.gold : C.border}`,
        background: checked ? C.goldPale : C.white,
        textAlign: 'right', cursor: 'pointer',
        fontFamily: 'Heebo, sans-serif',
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '8px',
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '6px',
        border: `2px solid ${checked ? C.gold : C.border}`,
        background: checked ? C.gold : C.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.white, fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
        transition: 'all 0.2s ease',
      }}>
        {checked ? '✓' : ''}
      </div>
      {icon && <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: checked ? 700 : 500, color: checked ? C.navy : C.textMid, fontSize: '0.92rem' }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '2px' }}>{sub}</div>}
      </div>
    </button>
  )
}

function FieldInput({
  label, value, onChange, type = 'text', placeholder, error, small,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; error?: string; small?: string
}) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.textMid, marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '13px 16px',
          border: `2px solid ${error ? C.error : C.border}`,
          borderRadius: '10px', fontSize: '0.95rem',
          fontFamily: 'Heebo, sans-serif', direction: 'rtl',
          outline: 'none', color: C.navy, background: C.white,
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => { if (!error) (e.target as HTMLInputElement).style.borderColor = C.gold }}
        onBlur={(e) => { if (!error) (e.target as HTMLInputElement).style.borderColor = C.border }}
      />
      {error && <div style={{ color: C.error, fontSize: '0.78rem', marginTop: '4px', fontWeight: 600 }}>⚠ {error}</div>}
      {small && !error && <div style={{ color: C.textLight, fontSize: '0.75rem', marginTop: '4px' }}>{small}</div>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SheelonPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SheelonData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const update = (patch: Partial<SheelonData>) => setData(d => ({ ...d, ...patch }))

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // Enter key to advance
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      goNext()
    }
  }, [loading, step]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const estimate = estimateRefund(data)

  const toggleYear = (y: number) => update({
    years: data.years.includes(y) ? data.years.filter(x => x !== y) : [...data.years, y],
  })

  const toggleExtra = (id: string) => update({
    special_points_extra: data.special_points_extra.includes(id)
      ? data.special_points_extra.filter(x => x !== id)
      : [...data.special_points_extra, id],
  })

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 1 && data.years.length === 0) e.years = 'נא לבחור לפחות שנה אחת'
    if (step === 2 && !data.employment_type) e.employment_type = 'נא לבחור סוג תעסוקה'
    if (step === 9) {
      if (!data.full_name.trim()) e.full_name = 'שם מלא הוא שדה חובה'
      if (!data.phone.trim()) e.phone = 'מספר טלפון הוא שדה חובה'
      else if (!/^0\d{8,9}$/.test(data.phone.replace(/[-\s]/g, ''))) e.phone = 'מספר טלפון לא תקין'
    }
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (!validate()) return
    setFieldErrors({})
    setSubmitError('')
    if (step < TOTAL_STEPS) setStep(s => s + 1)
    else submitForm()
  }

  const goBack = () => {
    setFieldErrors({})
    setSubmitError('')
    if (step > 1) setStep(s => s - 1)
  }

  const buildPayload = () => {
    const sp = [...data.special_points_extra]
    if (data.single_parent) sp.push('single_parent')
    if (data.spouse_not_working) sp.push('spouse_not_working')
    if (data.sold_stocks) sp.push('stocks_sale')
    if (data.sold_crypto) sp.push('crypto_sale')
    if (data.sold_property) sp.push('property_sale')
    if (data.had_unemployment) sp.push('unemployment')
    if (data.had_milieu) sp.push('reserve_duty')
    if (data.has_mortgage) sp.push('mortgage')
    if (data.has_life_insurance) sp.push('life_insurance')
    return {
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || null,
      years: data.years,
      employment_type: data.employment_type || null,
      changed_jobs: data.changed_jobs ?? false,
      changed_jobs_count: data.changed_jobs ? data.changed_jobs_count : 0,
      children: data.children ?? false,
      children_count: data.children ? data.children_count : 0,
      maternity_leave: data.had_maternity,
      academic_degree: data.academic_degree ?? false,
      degree_year: data.degree_year || null,
      donations: data.donations ?? false,
      donations_amount: data.donations && data.donations_amount ? data.donations_amount : null,
      city: data.city.trim() || null,
      special_points: sp,
      income_range: data.income_range || null,
      notes: data.notes.trim() || null,
    }
  }

  const submitForm = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      const url = '/api/leads'
      const payload = buildPayload()
      console.log('Submitting to:', url)
      console.log('Payload:', payload)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (result.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result.error || 'שגיאה בשמירת הנתונים. נסה שוב.')
      }
    } catch (err) {
      console.error('Fetch error (sheelon):', err)
      setSubmitError('שגיאת תקשורת. בדוק חיבור לאינטרנט ונסה שוב.')
    }
    setLoading(false)
  }

  // ─── Success Screen ──────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0E1E40 0%, #152b5a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Heebo, sans-serif', direction: 'rtl', padding: '24px',
      }}>
        <div style={{
          background: C.white, borderRadius: '24px', padding: '48px 32px',
          textAlign: 'center', maxWidth: '460px', width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          animation: 'fadeUp 0.5s ease both',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(201,168,76,0.35)',
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: C.navy, margin: '0 0 12px' }}>
            תודה! קיבלנו את הפרטים
          </h1>
          <p style={{ color: C.textMid, fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 28px' }}>
            אלמוג תחזור אליך בהקדם עם הערכת ההחזר שמגיע לך.
            <br />
            <strong>בדרך כלל מענה תוך 24 שעות.</strong>
          </p>
          <div style={{
            background: C.goldPale, border: `1px solid rgba(201,168,76,0.3)`,
            borderRadius: '12px', padding: '16px', marginBottom: '28px',
          }}>
            <div style={{ fontSize: '0.82rem', color: C.textLight, marginBottom: '4px' }}>שנות מס שנבחרו</div>
            <div style={{ fontWeight: 800, color: C.navy, fontSize: '1rem' }}>
              {data.years.sort((a,b)=>a-b).join(', ')}
            </div>
          </div>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '50px',
              background: '#25D366', color: C.white,
              fontWeight: 700, fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
            }}
          >
            💬 שלח וואטסאפ
          </a>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    )
  }

  // ─── Layout ──────────────────────────────────────────────────────────────

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0E1E40 0%, #152b5a 40%, #1a3568 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 48px',
      fontFamily: 'Heebo, sans-serif', direction: 'rtl',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', width: '100%', maxWidth: '600px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: '50px', padding: '8px 20px', marginBottom: '16px',
        }}>
          <span style={{ color: C.goldLight, fontSize: '0.85rem', fontWeight: 700 }}>
            🧾 שאלון בדיקת החזר מס — חינמי ומחייב לא
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 900, color: C.white, margin: 0, lineHeight: 1.2 }}>
          כמה כסף מגיע לך בחזרה?
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontSize: '0.9rem' }}>
          {TOTAL_STEPS} שאלות קצרות — פחות מ-3 דקות
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '600px',
        background: C.white, borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>

        {/* Progress bar + estimate */}
        <div style={{ padding: '20px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.textLight }}>
              {STEP_LABELS[step - 1]} · {step}/{TOTAL_STEPS}
            </span>
            {estimate ? (
              <span style={{
                fontSize: '0.78rem', fontWeight: 800, color: C.green,
                background: C.greenBg, border: `1px solid rgba(34,197,94,0.2)`,
                borderRadius: '20px', padding: '3px 10px',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                transition: 'all 0.4s ease',
              }}>
                ↑ {fmtILS(estimate.min)}–{fmtILS(estimate.max)}
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.gold }}>{Math.round(progress)}%</span>
            )}
          </div>
          <div style={{ height: '6px', background: C.border, borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
              borderRadius: '3px', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          {estimate && (
            <div style={{
              marginTop: '8px', fontSize: '0.72rem', color: C.textLight,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span>💡</span> הערכה ראשונית בלבד — תוצאה מדויקת לאחר בדיקת מסמכים
            </div>
          )}
        </div>

        {/* Step Content */}
        <div key={step} style={{ padding: '28px 28px 8px', animation: 'stepIn 0.35s cubic-bezier(0.4,0,0.2,1) both' }}>
          {step === 1 && (
            <div>
              <StepTitle icon="📅" title="עבור אילו שנים תרצה לבדוק?" sub="ניתן לתבוע החזר מס עד 6 שנים אחורה. בחר את השנים הרלוונטיות." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {YEARS.map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => toggleYear(y)}
                    style={{
                      padding: '16px 8px', borderRadius: '12px',
                      border: `2px solid ${data.years.includes(y) ? C.gold : C.border}`,
                      background: data.years.includes(y) ? C.goldPale : C.white,
                      color: data.years.includes(y) ? C.navy : C.textMid,
                      fontWeight: data.years.includes(y) ? 800 : 500,
                      fontSize: '1rem', cursor: 'pointer',
                      fontFamily: 'Heebo, sans-serif',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {data.years.includes(y) && <span style={{ display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>✓</span>}
                    {y}
                  </button>
                ))}
              </div>
              {fieldErrors.years && (
                <div style={{ color: C.error, fontSize: '0.8rem', marginTop: '12px', fontWeight: 600 }}>⚠ {fieldErrors.years}</div>
              )}
              {data.years.length > 0 && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: C.goldPale, borderRadius: '8px', fontSize: '0.82rem', color: C.navy, fontWeight: 600 }}>
                  ✓ נבחרו {data.years.length} שנים: {data.years.sort((a,b)=>a-b).join(', ')}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <StepTitle icon="💼" title="מה היה סטטוס התעסוקה שלך?" sub="בחר את הסטטוס שמתאר אותך ברוב תקופת השנים שנבחרו." />
              {fieldErrors.employment_type && (
                <div style={{ color: C.error, fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>⚠ {fieldErrors.employment_type}</div>
              )}
              {[
                { v: 'employee', label: 'שכיר', sub: 'עבדתי אצל מעסיק', icon: '🏢' },
                { v: 'self_employed', label: 'עצמאי', sub: 'עסק עצמאי / פרילנסר', icon: '🧑‍💼' },
                { v: 'both', label: 'שכיר + עצמאי', sub: 'גם וגם במקביל', icon: '⚡' },
                { v: 'unemployed', label: 'לא עבדתי', sub: 'תקופת אבטלה / חל"ת', icon: '⏸️' },
              ].map(({ v, label, sub, icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update({ employment_type: v as SheelonData['employment_type'] })}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '12px', marginBottom: '10px',
                    border: `2px solid ${data.employment_type === v ? C.gold : C.border}`,
                    background: data.employment_type === v ? C.goldPale : C.white,
                    textAlign: 'right', cursor: 'pointer',
                    fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: data.employment_type === v ? 800 : 600, fontSize: '0.95rem', color: C.navy }}>{label}</div>
                    <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px' }}>{sub}</div>
                  </div>
                  {data.employment_type === v && (
                    <div style={{ marginRight: 'auto', color: C.gold, fontWeight: 900, fontSize: '1.1rem' }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <StepTitle icon="🔄" title="אירועי עבודה מיוחדים" sub="אמת כל מה שקרה בשנים שנבחרו. כל סעיף יכול להגדיל את ההחזר." />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                  האם עבדת אצל יותר ממעסיק אחד?
                </div>
                <YesNo
                  value={data.changed_jobs}
                  onChange={(v) => update({ changed_jobs: v, changed_jobs_count: v ? (data.changed_jobs_count || 2) : 0 })}
                  yesLabel="כן, כמה מעסיקים"
                  noLabel="לא, מעסיק אחד"
                />
                {data.changed_jobs && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600 }}>כמה מעסיקים?</label>
                    <select
                      value={data.changed_jobs_count}
                      onChange={(e) => update({ changed_jobs_count: parseInt(e.target.value) })}
                      style={{
                        width: '100%', marginTop: '6px', padding: '10px 14px',
                        border: `2px solid ${C.border}`, borderRadius: '10px',
                        fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
                        outline: 'none', background: C.white, direction: 'rtl',
                      }}
                    >
                      {[2,3,4,5].map(n => <option key={n} value={n}>{n} מעסיקים</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ height: '1px', background: C.border, margin: '16px 0' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                מה עוד היה בתקופה הזו? (ניתן לסמן מספר אפשרויות)
              </div>
              <CheckCard checked={data.had_maternity} onChange={() => update({ had_maternity: !data.had_maternity })} icon="👶" label="חופשת לידה / אבהות" sub="כולל תקופת דמי לידה מביטוח לאומי" />
              <CheckCard checked={data.had_milieu} onChange={() => update({ had_milieu: !data.had_milieu })} icon="🪖" label="שירות מילואים ממושך" sub="30 יום ומעלה" />
              <CheckCard checked={data.had_unemployment} onChange={() => update({ had_unemployment: !data.had_unemployment })} icon="⏸️" label="תקופת אבטלה / חל״ת" sub="קיבלת דמי אבטלה או היית בחל״ת" />
            </div>
          )}

          {step === 4 && (
            <div>
              <StepTitle icon="📈" title="אירועי הון ומכירות" sub="מכירות נכסים, מניות וקריפטו עשויות ליצור החזרי מס על ניכויים שלא נוצלו." />
              <CheckCard checked={data.sold_stocks} onChange={() => update({ sold_stocks: !data.sold_stocks })} icon="📊" label="מכירת מניות / קרנות / אג&quot;ח" sub="כולל מימוש אופציות עובדים" />
              <CheckCard checked={data.sold_crypto} onChange={() => update({ sold_crypto: !data.sold_crypto })} icon="₿" label="מכירת מטבעות דיגיטליים" sub="ביטקוין, אתריום ועוד" />
              <CheckCard checked={data.sold_property} onChange={() => update({ sold_property: !data.sold_property })} icon="🏠" label="מכירת דירה / נכס מקרקעין" sub="כולל מכירת חלק בנכס" />
              {!data.sold_stocks && !data.sold_crypto && !data.sold_property && (
                <div style={{ padding: '12px 14px', background: C.light, borderRadius: '10px', fontSize: '0.82rem', color: C.textLight, marginTop: '8px' }}>
                  💡 אם לא מכרת אף נכס — לחץ &quot;הבא&quot; להמשך
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <StepTitle icon="👨‍👩‍👧" title="ילדים ומצב משפחתי" />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                  האם יש לך ילדים (עד גיל 18)?
                </div>
                <YesNo
                  value={data.children}
                  onChange={(v) => update({ children: v, children_count: v ? Math.max(data.children_count, 1) : 0 })}
                />
                {data.children && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600 }}>כמה ילדים?</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {[1,2,3,4,'5+'].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => update({ children_count: typeof n === 'number' ? n : 5 })}
                          style={{
                            flex: 1, padding: '10px 4px', borderRadius: '10px',
                            border: `2px solid ${data.children_count === (typeof n === 'number' ? n : 5) ? C.gold : C.border}`,
                            background: data.children_count === (typeof n === 'number' ? n : 5) ? C.goldPale : C.white,
                            color: data.children_count === (typeof n === 'number' ? n : 5) ? C.navy : C.textMid,
                            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                            fontFamily: 'Heebo, sans-serif',
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ height: '1px', background: C.border, margin: '16px 0' }} />
              <CheckCard checked={data.single_parent} onChange={() => update({ single_parent: !data.single_parent })} icon="👤" label="הורה יחידני / חד הורי" sub="מזכה בנקודות זיכוי נוספות" />
              <CheckCard checked={data.spouse_not_working} onChange={() => update({ spouse_not_working: !data.spouse_not_working })} icon="👥" label="בן/בת זוג שאינו/ה עובד/ת" sub="נקודת זיכוי נוספת בתנאים מסוימים" />
            </div>
          )}

          {step === 6 && (
            <div>
              <StepTitle icon="💡" title="זיכויים וניכויים נוספים" sub="כל אחד מהסעיפים הבאים עשוי להגדיל משמעותית את ההחזר." />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                  האם תרמת לעמותות מוכרות (סעיף 46)?
                </div>
                <YesNo value={data.donations} onChange={(v) => update({ donations: v })} />
                {data.donations && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600 }}>סכום תרומות שנתי משוער (₪)</label>
                    <input
                      type="number"
                      value={data.donations_amount}
                      onChange={(e) => update({ donations_amount: e.target.value })}
                      placeholder="לדוגמה: 2000"
                      style={{
                        width: '100%', marginTop: '6px', padding: '10px 14px',
                        border: `2px solid ${C.border}`, borderRadius: '10px',
                        fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif', outline: 'none',
                        direction: 'rtl',
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ height: '1px', background: C.border, margin: '16px 0' }} />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                  האם למדת לתואר אקדמי ראשון?
                </div>
                <YesNo value={data.academic_degree} onChange={(v) => update({ academic_degree: v })} />
                {data.academic_degree && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600 }}>שנת הלימודים הראשונה</label>
                    <input
                      type="number"
                      value={data.degree_year}
                      onChange={(e) => update({ degree_year: e.target.value })}
                      placeholder="לדוגמה: 2021"
                      style={{
                        width: '100%', marginTop: '6px', padding: '10px 14px',
                        border: `2px solid ${C.border}`, borderRadius: '10px',
                        fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif', outline: 'none',
                        direction: 'rtl',
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ height: '1px', background: C.border, margin: '16px 0' }} />
              <CheckCard checked={data.has_mortgage} onChange={() => update({ has_mortgage: !data.has_mortgage })} icon="🏦" label="משכנתא / ריבית על הלוואת דיור" sub="יתכן ניכוי ריבית מהכנסה" />
              <CheckCard checked={data.has_life_insurance} onChange={() => update({ has_life_insurance: !data.has_life_insurance })} icon="🛡️" label="ביטוח חיים / אובדן כושר עבודה" sub="פרמיות מסוימות מזכות בניכוי" />
            </div>
          )}

          {step === 7 && (
            <div>
              <StepTitle icon="⭐" title="נקודות זיכוי מיוחדות" sub="סמן כל מה שרלוונטי. כל נקודה שווה כ-2,904 ₪ בשנה." />
              {SPECIAL_OPTIONS.map(({ id, label, icon }) => (
                <CheckCard
                  key={id}
                  checked={data.special_points_extra.includes(id)}
                  onChange={() => toggleExtra(id)}
                  icon={icon}
                  label={label}
                />
              ))}
              <div style={{ padding: '12px 14px', background: C.light, borderRadius: '10px', fontSize: '0.82rem', color: C.textLight, marginTop: '4px' }}>
                💡 אם אין לך אף אחד מהסעיפים — לחץ &quot;הבא&quot;
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <StepTitle icon="💰" title="מידע כלכלי" sub="עוזר לנו לתת הערכה מדויקת יותר." />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: '10px' }}>
                  מה היה טווח ההכנסה השנתית הממוצע שלך?
                </div>
                {[
                  { v: 'under_60k', label: 'עד ₪60,000 בשנה', sub: 'עד ₪5,000 לחודש' },
                  { v: '60k_120k', label: '₪60,000 – ₪120,000', sub: '₪5,000–₪10,000 לחודש' },
                  { v: '120k_200k', label: '₪120,000 – ₪200,000', sub: '₪10,000–₪16,700 לחודש' },
                  { v: 'over_200k', label: 'מעל ₪200,000', sub: 'מעל ₪16,700 לחודש' },
                ].map(({ v, label, sub }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update({ income_range: v as SheelonData['income_range'] })}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                      border: `2px solid ${data.income_range === v ? C.gold : C.border}`,
                      background: data.income_range === v ? C.goldPale : C.white,
                      textAlign: 'right', cursor: 'pointer',
                      fontFamily: 'Heebo, sans-serif',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: data.income_range === v ? 800 : 600, fontSize: '0.9rem', color: C.navy }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '1px' }}>{sub}</div>
                    </div>
                    {data.income_range === v && <span style={{ color: C.gold, fontWeight: 900 }}>✓</span>}
                  </button>
                ))}
              </div>
              <FieldInput
                label="עיר מגורים (אופציונלי)"
                value={data.city}
                onChange={(v) => update({ city: v })}
                placeholder="לדוגמה: תל אביב"
                small="תושבי פריפריה זכאים לנקודות זיכוי נוספות"
              />
            </div>
          )}

          {step === 9 && (
            <div>
              <StepTitle icon="📱" title="פרטי קשר לחזרה" sub="מלא פרטים ואלמוג תחזור אליך עם הערכת ההחזר בהקדם." />
              <FieldInput
                label="שם מלא *"
                value={data.full_name}
                onChange={(v) => update({ full_name: v })}
                placeholder="ישראל ישראלי"
                error={fieldErrors.full_name}
              />
              <FieldInput
                label="מספר טלפון *"
                value={data.phone}
                onChange={(v) => update({ phone: v })}
                type="tel"
                placeholder="05X-XXXXXXX"
                error={fieldErrors.phone}
              />
              <FieldInput
                label="אימייל (אופציונלי)"
                value={data.email}
                onChange={(v) => update({ email: v })}
                type="email"
                placeholder="name@example.com"
              />
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.textMid, marginBottom: '6px' }}>
                  הערות נוספות (אופציונלי)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="פרטים נוספים שחשוב לדעת, שאלות, או כל מידע שיעזור לנו לבדוק עבורך..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: `2px solid ${C.border}`, borderRadius: '10px',
                    fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
                    direction: 'rtl', outline: 'none', resize: 'vertical',
                    color: C.navy, background: C.white,
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = C.gold }}
                  onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = C.border }}
                />
              </div>
              <div style={{
                background: C.goldPale, border: `1px solid rgba(201,168,76,0.3)`,
                borderRadius: '12px', padding: '14px 16px', fontSize: '0.8rem', color: C.textMid, lineHeight: 1.6,
              }}>
                🔒 המידע מאובטח ונשמר בסודיות. ייעוץ ראשוני חינמי וללא התחייבות.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '20px 28px 28px' }}>
          {submitError && (
            <div style={{
              background: C.errorBg, border: `1px solid rgba(229,62,62,0.25)`,
              borderRadius: '10px', padding: '12px 16px',
              color: C.error, fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '14px', textAlign: 'center',
            }}>
              ⚠ {submitError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                style={{
                  padding: '14px 22px', borderRadius: '50px',
                  border: `2px solid ${C.border}`,
                  background: C.white, color: C.textMid,
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  fontFamily: 'Heebo, sans-serif',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.navy }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border }}
              >
                ← חזרה
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={loading}
              style={{
                flex: 1, padding: '15px 24px', borderRadius: '50px',
                background: loading ? 'rgba(201,168,76,0.5)' : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                color: C.navy, fontWeight: 800, fontSize: '1rem',
                border: 'none', cursor: loading ? 'default' : 'pointer',
                fontFamily: 'Heebo, sans-serif',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(201,168,76,0.3)',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>⏳ שולח...</>
              ) : step === TOTAL_STEPS ? (
                <>✓ שלח לבדיקה חינמית</>
              ) : (
                <>הבא ←</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer trust */}
      <div style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
        אלמוג בן דוד — רואת חשבון מוסמכת · ייעוץ ראשוני חינמי · גישה מאובטחת
      </div>

      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .sheelon-years-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
