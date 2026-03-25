'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuestionnaireData {
  years: number[]
  employment_type: 'employee' | 'self_employed' | 'both' | 'unemployed' | ''
  changed_jobs: boolean | null
  changed_jobs_count: number
  children: boolean | null
  children_count: number
  children_ages: string
  maternity_leave: boolean | null
  academic_degree: boolean | null
  degree_year: string
  donations: boolean | null
  donations_amount: string
  city: string
  special_points: string[]
  income_range: 'under_60k' | '60k_120k' | '120k_200k' | 'over_200k' | ''
  full_name: string
  phone: string
  email: string
}

const INITIAL_DATA: QuestionnaireData = {
  years: [], employment_type: '',
  changed_jobs: null, changed_jobs_count: 0,
  children: null, children_count: 0, children_ages: '',
  maternity_leave: null, academic_degree: null, degree_year: '',
  donations: null, donations_amount: '',
  city: '', special_points: [], income_range: '',
  full_name: '', phone: '', email: '',
}

const AVAILABLE_YEARS = [2020, 2021, 2022, 2023, 2024]

const SPECIAL_POINTS_OPTIONS = [
  { id: 'disability', label: 'נכות (75%+)' },
  { id: 'new_immigrant', label: 'עולה חדש' },
  { id: 'divorced', label: 'גרוש/ה' },
  { id: 'single_parent', label: 'הורה יחיד' },
  { id: 'soldier', label: 'שחרור מצבאי' },
  { id: 'periphery', label: 'מגורים בפריפריה' },
  { id: 'bereaved', label: 'שכול' },
  { id: 'spouse_not_working', label: 'בן/בת זוג שאינו/ה עובד/ת' },
]

function computeScore(data: QuestionnaireData): number {
  let score = 0
  if (data.changed_jobs) score += 20
  if (data.children) score += 15
  if (data.maternity_leave) score += 20
  if (data.academic_degree) score += 15
  if (data.donations) score += 10
  if (data.special_points.includes('periphery')) score += 10
  score += data.special_points.length * 5
  if (data.years.length > 2) score += 10
  if (data.income_range === '60k_120k' || data.income_range === '120k_200k') score += 5
  return Math.min(score, 100)
}

function getPhase(step: number): { number: number; label: string } {
  if (step <= 4) return { number: 1, label: 'פרטים בסיסיים' }
  if (step <= 8) return { number: 2, label: 'הכנסות ונתונים' }
  return { number: 3, label: 'אישור ושליחה' }
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export default function HazaratMasFormPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 12
  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps) as Step)
  const goBack = () => setStep((s) => Math.max(s - 1, 1) as Step)

  const toggleYear = (year: number) =>
    setData((d) => ({ ...d, years: d.years.includes(year) ? d.years.filter((y) => y !== year) : [...d.years, year] }))

  const toggleSpecialPoint = (id: string) =>
    setData((d) => ({ ...d, special_points: d.special_points.includes(id) ? d.special_points.filter((p) => p !== id) : [...d.special_points, id] }))

  const handleSubmit = async () => {
    if (!data.full_name.trim() || !data.phone.trim()) {
      setError('שם מלא ומספר טלפון הם שדות חובה')
      return
    }
    setLoading(true)
    setError('')
    try {
      const url = '/api/leads'
      const payload = { ...data, source: 'hazarat-mas' }
      console.log('Submitting to:', url)
      console.log('Payload:', payload)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (result.success) {
        router.push('/thank-you')
      } else {
        setError(result.error || 'שגיאה בשמירת הנתונים. אנא נסה שוב.')
      }
    } catch (err) {
      console.error('Fetch error (hazarat-mas form):', err)
      setError('שגיאת תקשורת. אנא נסה שוב.')
    }
    setLoading(false)
  }

  const score = computeScore(data)
  const phase = getPhase(step)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px',
    border: '1.5px solid #CBD5E0', borderRadius: '8px',
    fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
    direction: 'rtl', outline: 'none', boxSizing: 'border-box',
  }
  const btnPrimary: React.CSSProperties = {
    padding: '14px 32px', background: '#C9A84C',
    color: '#0E1E40', fontWeight: 800, fontSize: '1rem',
    borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontFamily: 'Heebo, sans-serif',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  }
  const btnOutline: React.CSSProperties = {
    padding: '13px 28px', background: 'transparent',
    color: '#4A5568', fontWeight: 600, fontSize: '0.9rem',
    borderRadius: '8px', border: '1.5px solid #CBD5E0',
    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
  }
  const radioCard = (selected: boolean): React.CSSProperties => ({
    padding: '16px 20px',
    border: `1.5px solid ${selected ? '#C9A84C' : '#E2E8F0'}`,
    borderRadius: '8px', cursor: 'pointer',
    background: selected ? '#FFFBF0' : 'white',
    display: 'flex', alignItems: 'center', gap: '12px',
    fontFamily: 'Heebo, sans-serif', userSelect: 'none',
  })
  const checkCard = (selected: boolean): React.CSSProperties => ({
    padding: '16px 20px',
    border: `1.5px solid ${selected ? '#C9A84C' : '#E2E8F0'}`,
    borderRadius: '8px', cursor: 'pointer',
    background: selected ? '#FFFBF0' : 'white',
    textAlign: 'center', fontFamily: 'Heebo, sans-serif',
    fontWeight: selected ? 700 : 500,
    color: selected ? '#946E10' : '#4A5568',
    userSelect: 'none',
  })

  const isNextDisabled =
    (step === 1 && data.years.length === 0) ||
    (step === 2 && !data.employment_type) ||
    (step === 10 && !data.income_range) ||
    (step === 11 && (!data.full_name.trim() || !data.phone.trim()))

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: 'Heebo, sans-serif', direction: 'rtl' }}>

      {/* Header */}
      <div style={{ background: '#0E1E40', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/hazarat-mas" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0E1E40', fontSize: '0.82rem', borderRadius: '6px' }}>א</div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.86rem' }}>אלמוג בן דוד</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem' }}>שאלון בדיקת החזר מס</span>
      </div>

      <div style={{ background: '#0E1E40', padding: '18px 24px 34px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: 'white', marginBottom: '5px' }}>בדוק זכאות להחזר מס</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>חינם לחלוטין, ללא התחייבות</p>
      </div>

      {/* Progress */}
      <div style={{ maxWidth: '620px', margin: '-22px auto 0', padding: '0 20px 60px' }}>
        <div style={{ background: 'white', borderRadius: '12px 12px 0 0', padding: '18px 24px 0', boxShadow: '0 2px 12px rgba(14,30,64,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            {[{ n: 1, label: 'פרטים בסיסיים' }, { n: 2, label: 'הכנסות ונתונים' }, { n: 3, label: 'אישור ושליחה' }].map((ph) => (
              <div key={ph.n} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: ph.n === phase.number ? 1 : 0.4 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: ph.n < phase.number ? '#C9A84C' : ph.n === phase.number ? '#0E1E40' : '#E2E8F0', color: ph.n <= phase.number ? 'white' : '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                  {ph.n < phase.number ? '✓' : ph.n}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: ph.n === phase.number ? 700 : 500, color: ph.n === phase.number ? '#0E1E40' : '#718096' }}>{ph.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.76rem', color: '#718096' }}>שלב {step} מתוך {totalSteps}</span>
            <span style={{ fontSize: '0.76rem', color: '#C9A84C', fontWeight: 700 }}>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / totalSteps) * 100}%`, background: '#C9A84C', borderRadius: '2px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', padding: '28px 24px 32px', boxShadow: '0 2px 12px rgba(14,30,64,0.07)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>

            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>על אילו שנים לבדוק?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>ניתן לתבוע על עד 6 שנים אחורה:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {AVAILABLE_YEARS.map((year) => (
                    <div key={year} onClick={() => toggleYear(year)} style={{ ...checkCard(data.years.includes(year)), padding: '14px 24px', fontSize: '1rem', fontWeight: 700, flex: '1 0 70px' }}>
                      {year}{data.years.includes(year) && <span style={{ marginRight: '4px', color: '#C9A84C' }}>✓</span>}
                    </div>
                  ))}
                </div>
                {data.years.length === 0 && <p style={{ color: '#E53E3E', fontSize: '0.78rem', marginTop: '8px' }}>בחר לפחות שנה אחת</p>}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>מה מעמד ההעסקה שלך?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>בשנים שבחרת</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[{ value: 'employee', label: 'שכיר בלבד' }, { value: 'self_employed', label: 'עצמאי בלבד' }, { value: 'both', label: 'גם שכיר וגם עצמאי' }, { value: 'unemployed', label: 'לא עבדתי' }].map((opt) => (
                    <div key={opt.value} onClick={() => setData((d) => ({ ...d, employment_type: opt.value as QuestionnaireData['employment_type'] }))} style={radioCard(data.employment_type === opt.value)}>
                      <span style={{ fontWeight: 700, color: '#0E1E40' }}>{opt.label}</span>
                      {data.employment_type === opt.value && <span style={{ marginRight: 'auto', color: '#C9A84C', fontWeight: 800 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>האם החלפת מקום עבודה?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>כולל מעבר מחופשת לידה</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  {[{ value: true, label: 'כן' }, { value: false, label: 'לא' }].map((opt) => (
                    <div key={String(opt.value)} onClick={() => setData((d) => ({ ...d, changed_jobs: opt.value }))} style={{ ...checkCard(data.changed_jobs === opt.value), flex: 1, padding: '20px' }}>{opt.label}</div>
                  ))}
                </div>
                {data.changed_jobs && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>כמה פעמים?</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, '4+'].map((num) => (
                        <div key={String(num)} onClick={() => setData((d) => ({ ...d, changed_jobs_count: typeof num === 'number' ? num : 4 }))} style={{ ...checkCard(typeof num === 'number' ? data.changed_jobs_count === num : data.changed_jobs_count >= 4), flex: 1, padding: '14px 8px' }}>{num}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>האם יש לך ילדים?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>ילדים עד גיל 18 מזכים בנקודות זיכוי</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  {[{ value: true, label: 'כן' }, { value: false, label: 'לא' }].map((opt) => (
                    <div key={String(opt.value)} onClick={() => setData((d) => ({ ...d, children: opt.value }))} style={{ ...checkCard(data.children === opt.value), flex: 1, padding: '20px' }}>{opt.label}</div>
                  ))}
                </div>
                {data.children && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>כמה ילדים?</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[1, 2, 3, 4, '5+'].map((num) => (
                          <div key={String(num)} onClick={() => setData((d) => ({ ...d, children_count: typeof num === 'number' ? num : 5 }))} style={{ ...checkCard(typeof num === 'number' ? data.children_count === num : data.children_count >= 5), flex: 1, padding: '14px 8px' }}>{num}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>טווח גילאים (לא חובה)</label>
                      <input type="text" placeholder="לדוגמה: 3, 7, 12" value={data.children_ages} onChange={(e) => setData((d) => ({ ...d, children_ages: e.target.value }))} style={inputStyle} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>האם יצאת לחופשת לידה?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>כולל אימוץ – חוזרת מחל"ד יוצרת לרוב זכאות גבוהה</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[{ value: true, label: 'כן' }, { value: false, label: 'לא' }].map((opt) => (
                    <div key={String(opt.value)} onClick={() => setData((d) => ({ ...d, maternity_leave: opt.value }))} style={{ ...checkCard(data.maternity_leave === opt.value), flex: 1, padding: '24px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{opt.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>האם סיימת תואר אקדמי?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>זיכוי על שכר לימוד עד 3 שנים מסיום</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  {[{ value: true, label: 'כן' }, { value: false, label: 'לא' }].map((opt) => (
                    <div key={String(opt.value)} onClick={() => setData((d) => ({ ...d, academic_degree: opt.value }))} style={{ ...checkCard(data.academic_degree === opt.value), flex: 1, padding: '24px' }}>{opt.label}</div>
                  ))}
                </div>
                {data.academic_degree && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>שנת סיום התואר</label>
                    <input type="number" min={2015} max={2025} placeholder="לדוגמה: 2022" value={data.degree_year} onChange={(e) => setData((d) => ({ ...d, degree_year: e.target.value }))} style={inputStyle} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                  </div>
                )}
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>האם תרמת לעמותות מוכרות?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>תרומה מעל ₪190 לעמותה מוכרת = החזר 35%</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  {[{ value: true, label: 'כן' }, { value: false, label: 'לא' }].map((opt) => (
                    <div key={String(opt.value)} onClick={() => setData((d) => ({ ...d, donations: opt.value }))} style={{ ...checkCard(data.donations === opt.value), flex: 1, padding: '24px' }}>{opt.label}</div>
                  ))}
                </div>
                {data.donations && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>סכום משוער (₪)</label>
                    <input type="number" min={0} placeholder="לדוגמה: 2000" value={data.donations_amount} onChange={(e) => setData((d) => ({ ...d, donations_amount: e.target.value }))} style={inputStyle} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                  </div>
                )}
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>מהי עיר המגורים שלך?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>תושבי פריפריה זכאים להטבות מס נוספות</p>
                <input type="text" placeholder="שם העיר" value={data.city} onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))} style={{ ...inputStyle, padding: '16px 20px', fontSize: '1rem' }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
              </div>
            )}

            {step === 9 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>נקודות זיכוי מיוחדות</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '18px' }}>סמן את כל מה שרלוונטי (לא חובה)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {SPECIAL_POINTS_OPTIONS.map((opt) => (
                    <div key={opt.id} onClick={() => toggleSpecialPoint(opt.id)} style={{ ...checkCard(data.special_points.includes(opt.id)), padding: '14px 16px', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1.5px solid ${data.special_points.includes(opt.id) ? '#C9A84C' : '#CBD5E0'}`, background: data.special_points.includes(opt.id) ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: '0.7rem' }}>
                        {data.special_points.includes(opt.id) ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: '0.83rem' }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 10 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>מה ההכנסה השנתית שלך?</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>הכנסה ברוטו בקירוב</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'under_60k', label: 'עד ₪60,000 בשנה', sub: 'עד ₪5,000 לחודש' },
                    { value: '60k_120k', label: '₪60,000–₪120,000 בשנה', sub: '₪5,000–₪10,000 לחודש' },
                    { value: '120k_200k', label: '₪120,000–₪200,000 בשנה', sub: '₪10,000–₪16,700 לחודש' },
                    { value: 'over_200k', label: 'מעל ₪200,000 בשנה', sub: 'מעל ₪16,700 לחודש' },
                  ].map((opt) => (
                    <div key={opt.value} onClick={() => setData((d) => ({ ...d, income_range: opt.value as QuestionnaireData['income_range'] }))} style={radioCard(data.income_range === opt.value)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.9rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.74rem', color: '#718096', marginTop: '2px' }}>{opt.sub}</div>
                      </div>
                      {data.income_range === opt.value && <span style={{ color: '#C9A84C', fontWeight: 800 }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 11 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>פרטי קשר</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '22px' }}>כדי שאלמוג תחזור אליך עם תוצאות הבדיקה</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>שם מלא *</label>
                    <input type="text" placeholder="ישראל ישראלי" value={data.full_name} onChange={(e) => setData((d) => ({ ...d, full_name: e.target.value }))} style={inputStyle} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>טלפון *</label>
                    <input type="tel" placeholder="054-7312262" value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))} style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#0E1E40', marginBottom: '6px' }}>אימייל (לא חובה)</label>
                    <input type="email" placeholder="example@email.com" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }} onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#CBD5E0' }} />
                  </div>
                </div>
              </div>
            )}

            {step === 12 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0E1E40', marginBottom: '6px' }}>סיכום ואישור</h2>
                <p style={{ color: '#718096', fontSize: '0.86rem', marginBottom: '18px' }}>בדוק את הפרטים ושלח לבדיקה</p>
                <div style={{ background: '#F7F9FC', border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0E1E40', marginBottom: '2px' }}>
                    {score}<span style={{ fontSize: '0.88rem', color: '#718096' }}>/100</span>
                  </div>
                  <div style={{ fontWeight: 700, color: score >= 60 ? '#2F855A' : score >= 30 ? '#946E10' : '#4A5568' }}>
                    {score >= 60 ? 'סיכוי גבוה לזכאות' : score >= 30 ? 'ייתכן שמגיע לך החזר' : 'כדאי לבדוק'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  {[{ label: 'שנות מס', value: data.years.join(', ') }, { label: 'שם', value: data.full_name }, { label: 'טלפון', value: data.phone }].filter(i => i.value).map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F4F8', fontSize: '0.86rem' }}>
                      <span style={{ color: '#718096' }}>{item.label}:</span>
                      <span style={{ fontWeight: 600, color: '#0E1E40' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {error && (
                  <div style={{ background: 'rgba(229,62,62,0.07)', border: '1px solid rgba(229,62,62,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#C53030', fontSize: '0.84rem', marginBottom: '12px' }}>
                    {error}
                  </div>
                )}
                <p style={{ color: '#718096', fontSize: '0.74rem', lineHeight: 1.6 }}>
                  בלחיצה על "בדוק זכאות" אני מאשר/ת קבלת יצירת קשר מאלמוג בן דוד, רואת חשבון מוסמכת.
                </p>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F0F4F8' }}>
            {step > 1 && <button onClick={goBack} style={btnOutline}>→ חזרה</button>}
            {step < 12 ? (
              <button onClick={goNext} disabled={isNextDisabled} style={{ ...btnPrimary, opacity: isNextDisabled ? 0.45 : 1, cursor: isNextDisabled ? 'not-allowed' : 'pointer' }}>
                המשך ←
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, minWidth: '180px', justifyContent: 'center' }}>
                {loading ? 'שולח...' : 'בדוק זכאות עכשיו'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
