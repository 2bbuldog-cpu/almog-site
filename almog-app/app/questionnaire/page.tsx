'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  years: [],
  employment_type: '',
  changed_jobs: null,
  changed_jobs_count: 0,
  children: null,
  children_count: 0,
  children_ages: '',
  maternity_leave: null,
  academic_degree: null,
  degree_year: '',
  donations: null,
  donations_amount: '',
  city: '',
  special_points: [],
  income_range: '',
  full_name: '',
  phone: '',
  email: '',
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

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export default function QuestionnairePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const totalSteps = 12

  const goNext = () => {
    setDirection('forward')
    setStep((s) => Math.min(s + 1, totalSteps) as Step)
  }

  const goBack = () => {
    setDirection('back')
    setStep((s) => Math.max(s - 1, 1) as Step)
  }

  const toggleYear = (year: number) => {
    setData((d) => ({
      ...d,
      years: d.years.includes(year)
        ? d.years.filter((y) => y !== year)
        : [...d.years, year],
    }))
  }

  const toggleSpecialPoint = (id: string) => {
    setData((d) => ({
      ...d,
      special_points: d.special_points.includes(id)
        ? d.special_points.filter((p) => p !== id)
        : [...d.special_points, id],
    }))
  }

  const handleSubmit = async () => {
    if (!data.full_name.trim() || !data.phone.trim()) {
      setError('שם מלא ומספר טלפון הם שדות חובה')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        router.push('/thank-you')
      } else {
        setError(result.error || 'שגיאה בשמירת הנתונים. אנא נסה שוב.')
      }
    } catch {
      setError('שגיאת תקשורת. אנא נסה שוב.')
    }
    setLoading(false)
  }

  const score = computeScore(data)

  const btnStyle = {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
    color: '#0E1E40',
    fontWeight: 800,
    fontSize: '1rem',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Heebo, sans-serif',
    boxShadow: '0 6px 20px rgba(201,168,76,0.3)',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties

  const outlineBtnStyle = {
    padding: '13px 28px',
    background: 'transparent',
    color: '#0E1E40',
    fontWeight: 700,
    fontSize: '0.95rem',
    borderRadius: '50px',
    border: '2px solid #E2E8F0',
    cursor: 'pointer',
    fontFamily: 'Heebo, sans-serif',
    transition: 'all 0.3s ease',
  } as React.CSSProperties

  const radioCardStyle = (selected: boolean) => ({
    padding: '18px 24px',
    border: `2px solid ${selected ? '#C9A84C' : '#E2E8F0'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    background: selected ? 'rgba(201,168,76,0.08)' : 'white',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: 'Heebo, sans-serif',
    userSelect: 'none' as const,
  })

  const checkCardStyle = (selected: boolean) => ({
    padding: '16px 20px',
    border: `2px solid ${selected ? '#C9A84C' : '#E2E8F0'}`,
    borderRadius: '12px',
    cursor: 'pointer',
    background: selected ? 'rgba(201,168,76,0.08)' : 'white',
    transition: 'all 0.25s ease',
    textAlign: 'center' as const,
    fontFamily: 'Heebo, sans-serif',
    fontWeight: selected ? 700 : 500,
    color: selected ? '#B7860A' : '#4A5568',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9FC',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
      paddingTop: '80px',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0E1E40, #1B3358)',
        padding: '40px 24px 60px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
          בדיקת זכאות להחזר מס
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
          שאלון קצר – פחות מ-5 דקות, חינם לחלוטין
        </p>
      </div>

      {/* Progress & Card */}
      <div style={{ maxWidth: '640px', margin: '-32px auto 0', padding: '0 24px 60px' }}>
        {/* Progress Bar */}
        <div style={{
          background: 'white',
          borderRadius: '20px 20px 0 0',
          padding: '24px 28px 0',
          boxShadow: '0 4px 24px rgba(14,30,64,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#718096', fontWeight: 600 }}>
              שלב {step} מתוך {totalSteps}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#C9A84C', fontWeight: 700 }}>
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'white',
          borderRadius: '0 0 20px 20px',
          padding: '32px 28px 36px',
          boxShadow: '0 8px 40px rgba(14,30,64,0.1)',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ flex: 1 }}>

            {/* STEP 1: Tax Years */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  על אילו שנים לבדוק?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  ניתן לתבוע על עד 6 שנים אחורה. בחר את כל השנים הרלוונטיות:
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {AVAILABLE_YEARS.map((year) => (
                    <div
                      key={year}
                      onClick={() => toggleYear(year)}
                      style={{
                        ...checkCardStyle(data.years.includes(year)),
                        padding: '14px 28px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        flex: '1 0 80px',
                      }}
                    >
                      {year}
                      {data.years.includes(year) && <span style={{ marginRight: '6px' }}>✓</span>}
                    </div>
                  ))}
                </div>
                {data.years.length === 0 && (
                  <p style={{ color: '#E53E3E', fontSize: '0.82rem', marginTop: '12px' }}>
                    בחר לפחות שנה אחת כדי להמשיך
                  </p>
                )}
              </div>
            )}

            {/* STEP 2: Employment Type */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  מה מעמד ההעסקה שלך?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  בשנים שבחרת
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'employee', label: 'שכיר בלבד', icon: '💼' },
                    { value: 'self_employed', label: 'עצמאי בלבד', icon: '🚀' },
                    { value: 'both', label: 'גם שכיר וגם עצמאי', icon: '💡' },
                    { value: 'unemployed', label: 'לא עבדתי', icon: '🏠' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setData((d) => ({ ...d, employment_type: opt.value as QuestionnaireData['employment_type'] }))}
                      style={radioCardStyle(data.employment_type === opt.value)}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                      <span style={{ fontWeight: 700, color: '#0E1E40' }}>{opt.label}</span>
                      {data.employment_type === opt.value && (
                        <span style={{ marginRight: 'auto', color: '#C9A84C', fontWeight: 800 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Changed Jobs */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  האם החלפת מקום עבודה?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  בשנים שבחרת (כולל מעבר מחופשת לידה)
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { value: true, label: 'כן', icon: '✅' },
                    { value: false, label: 'לא', icon: '❌' },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => setData((d) => ({ ...d, changed_jobs: opt.value }))}
                      style={{ ...checkCardStyle(data.changed_jobs === opt.value), flex: 1, padding: '20px' }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</div>
                      {opt.label}
                    </div>
                  ))}
                </div>
                {data.changed_jobs && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '10px' }}>
                      כמה פעמים?
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, '4+'].map((num) => (
                        <div
                          key={String(num)}
                          onClick={() => setData((d) => ({ ...d, changed_jobs_count: typeof num === 'number' ? num : 4 }))}
                          style={{
                            ...checkCardStyle(
                              typeof num === 'number'
                                ? data.changed_jobs_count === num
                                : data.changed_jobs_count >= 4
                            ),
                            flex: 1,
                            padding: '14px 8px',
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Children */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  האם יש לך ילדים?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  ילדים עד גיל 18 מזכים בנקודות זיכוי
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { value: true, label: 'כן', icon: '👨‍👩‍👧' },
                    { value: false, label: 'לא', icon: '❌' },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => setData((d) => ({ ...d, children: opt.value }))}
                      style={{ ...checkCardStyle(data.children === opt.value), flex: 1, padding: '20px' }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</div>
                      {opt.label}
                    </div>
                  ))}
                </div>
                {data.children && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '10px' }}>
                        כמה ילדים?
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[1, 2, 3, 4, '5+'].map((num) => (
                          <div
                            key={String(num)}
                            onClick={() => setData((d) => ({ ...d, children_count: typeof num === 'number' ? num : 5 }))}
                            style={{
                              ...checkCardStyle(typeof num === 'number' ? data.children_count === num : data.children_count >= 5),
                              flex: 1, padding: '14px 8px',
                            }}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                        טווח גילאים (לא חובה)
                      </label>
                      <input
                        type="text"
                        placeholder="לדוגמה: 3, 7, 12"
                        value={data.children_ages}
                        onChange={(e) => setData((d) => ({ ...d, children_ages: e.target.value }))}
                        style={{
                          width: '100%', padding: '12px 16px',
                          border: '2px solid #E2E8F0', borderRadius: '10px',
                          fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                          direction: 'rtl', outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Maternity Leave */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  האם יצאת לחופשת לידה?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  כולל אימוץ. חזרה מחופשת לידה יוצרת לעיתים זכאות להחזר משמעותי
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { value: true, label: 'כן', icon: '👶' },
                    { value: false, label: 'לא', icon: '❌' },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => setData((d) => ({ ...d, maternity_leave: opt.value }))}
                      style={{ ...checkCardStyle(data.maternity_leave === opt.value), flex: 1, padding: '28px' }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{opt.icon}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{opt.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Academic Degree */}
            {step === 6 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  האם סיימת תואר אקדמי?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  זיכוי מס על שכר לימוד ניתן לתבוע עד 3 שנים מסיום הלימודים
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { value: true, label: 'כן', icon: '🎓' },
                    { value: false, label: 'לא', icon: '❌' },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => setData((d) => ({ ...d, academic_degree: opt.value }))}
                      style={{ ...checkCardStyle(data.academic_degree === opt.value), flex: 1, padding: '24px' }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</div>
                      {opt.label}
                    </div>
                  ))}
                </div>
                {data.academic_degree && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                      שנת סיום התואר (בקירוב)
                    </label>
                    <input
                      type="number"
                      min={2015}
                      max={2024}
                      placeholder="לדוגמה: 2022"
                      value={data.degree_year}
                      onChange={(e) => setData((d) => ({ ...d, degree_year: e.target.value }))}
                      style={{
                        width: '100%', padding: '12px 16px',
                        border: '2px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                        direction: 'rtl', outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: Donations */}
            {step === 7 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  האם תרמת לעמותות מוכרות?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  תרומה מעל ₪190 לעמותה עם אישור מס הכנסה מזכה בהחזר של 35%
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { value: true, label: 'כן', icon: '💝' },
                    { value: false, label: 'לא', icon: '❌' },
                  ].map((opt) => (
                    <div
                      key={String(opt.value)}
                      onClick={() => setData((d) => ({ ...d, donations: opt.value }))}
                      style={{ ...checkCardStyle(data.donations === opt.value), flex: 1, padding: '24px' }}
                    >
                      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</div>
                      {opt.label}
                    </div>
                  ))}
                </div>
                {data.donations && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                      סכום משוער של התרומות (₪)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="לדוגמה: 2000"
                      value={data.donations_amount}
                      onChange={(e) => setData((d) => ({ ...d, donations_amount: e.target.value }))}
                      style={{
                        width: '100%', padding: '12px 16px',
                        border: '2px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                        direction: 'rtl', outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: City */}
            {step === 8 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  מהי עיר המגורים שלך?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  תושבי יישובי עדיפות לאומית (פריפריה) זכאים להטבות מס נוספות
                </p>
                <input
                  type="text"
                  placeholder="שם העיר"
                  value={data.city}
                  onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
                  style={{
                    width: '100%', padding: '16px 20px',
                    border: '2px solid #E2E8F0', borderRadius: '12px',
                    fontSize: '1rem', fontFamily: 'Heebo, sans-serif',
                    direction: 'rtl', outline: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                />
              </div>
            )}

            {/* STEP 9: Special Points */}
            {step === 9 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  נקודות זיכוי מיוחדות
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '24px' }}>
                  סמן את כל מה שרלוונטי אליך (לא חובה)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {SPECIAL_POINTS_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => toggleSpecialPoint(opt.id)}
                      style={{
                        ...checkCardStyle(data.special_points.includes(opt.id)),
                        padding: '14px 16px',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px',
                        borderRadius: '5px',
                        border: `2px solid ${data.special_points.includes(opt.id) ? '#C9A84C' : '#CBD5E0'}`,
                        background: data.special_points.includes(opt.id) ? '#C9A84C' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        color: 'white', fontSize: '0.75rem',
                      }}>
                        {data.special_points.includes(opt.id) ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: '0.88rem' }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 10: Income Range */}
            {step === 10 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  מה ההכנסה השנתית שלך?
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  הכנסה ברוטו בקירוב
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'under_60k', label: 'עד ₪60,000 בשנה', sublabel: 'עד ₪5,000 לחודש' },
                    { value: '60k_120k', label: '₪60,000–₪120,000 בשנה', sublabel: '₪5,000–₪10,000 לחודש' },
                    { value: '120k_200k', label: '₪120,000–₪200,000 בשנה', sublabel: '₪10,000–₪16,700 לחודש' },
                    { value: 'over_200k', label: 'מעל ₪200,000 בשנה', sublabel: 'מעל ₪16,700 לחודש' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setData((d) => ({ ...d, income_range: opt.value as QuestionnaireData['income_range'] }))}
                      style={radioCardStyle(data.income_range === opt.value)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.95rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#718096' }}>{opt.sublabel}</div>
                      </div>
                      {data.income_range === opt.value && (
                        <span style={{ color: '#C9A84C', fontWeight: 800 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 11: Contact Details */}
            {step === 11 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  פרטי קשר
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '28px' }}>
                  כדי שאלמוג תוכל ליצור קשר עם תוצאות הבדיקה
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                      שם מלא *
                    </label>
                    <input
                      type="text"
                      placeholder="ישראל ישראלי"
                      value={data.full_name}
                      onChange={(e) => setData((d) => ({ ...d, full_name: e.target.value }))}
                      style={{
                        width: '100%', padding: '14px 18px',
                        border: '2px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                        direction: 'rtl', outline: 'none',
                      }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                      טלפון *
                    </label>
                    <input
                      type="tel"
                      placeholder="050-0000000"
                      value={data.phone}
                      onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                      style={{
                        width: '100%', padding: '14px 18px',
                        border: '2px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                        direction: 'ltr', textAlign: 'left', outline: 'none',
                      }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0E1E40', marginBottom: '8px' }}>
                      אימייל (לא חובה)
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={data.email}
                      onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                      style={{
                        width: '100%', padding: '14px 18px',
                        border: '2px solid #E2E8F0', borderRadius: '10px',
                        fontSize: '0.95rem', fontFamily: 'Heebo, sans-serif',
                        direction: 'ltr', textAlign: 'left', outline: 'none',
                      }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 12: Summary */}
            {step === 12 && (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '8px' }}>
                  סיכום ואישור
                </h2>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '24px' }}>
                  בדוק את הפרטים ושלח לבדיקה
                </p>

                {/* Score Badge */}
                <div style={{
                  background: score >= 60
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.15))'
                    : score >= 30
                    ? 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,201,106,0.15))'
                    : 'linear-gradient(135deg, rgba(107,114,128,0.1), rgba(107,114,128,0.15))',
                  border: `1px solid ${score >= 60 ? 'rgba(34,197,94,0.3)' : score >= 30 ? 'rgba(201,168,76,0.3)' : 'rgba(107,114,128,0.3)'}`,
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0E1E40', marginBottom: '4px' }}>
                    {score}
                    <span style={{ fontSize: '1rem', color: '#718096' }}>/100</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0E1E40', marginBottom: '4px' }}>
                    {score >= 60 ? 'סיכוי גבוה להחזר מס!' : score >= 30 ? 'כנראה מגיע לך החזר' : 'כדאי לבדוק'}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.82rem' }}>ציון זכאות ראשוני</div>
                </div>

                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {[
                    { label: 'שנות מס', value: data.years.join(', ') || 'לא נבחר' },
                    { label: 'סטטוס תעסוקה', value: { employee: 'שכיר', self_employed: 'עצמאי', both: 'שכיר + עצמאי', unemployed: 'לא עובד', '': '' }[data.employment_type] || '' },
                    { label: 'שם', value: data.full_name },
                    { label: 'טלפון', value: data.phone },
                  ].filter(i => i.value).map((item) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid #F7F9FC',
                      fontSize: '0.9rem',
                    }}>
                      <span style={{ color: '#718096' }}>{item.label}:</span>
                      <span style={{ fontWeight: 600, color: '#0E1E40' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)',
                    borderRadius: '10px', padding: '12px 16px',
                    color: '#C53030', fontSize: '0.88rem', marginBottom: '16px',
                  }}>
                    {error}
                  </div>
                )}

                <p style={{ color: '#718096', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  בלחיצה על "שלח לבדיקה" אני מאשר/ת שהפרטים שמסרתי נכונים ומאשר/ת קבלת יצירת קשר מאלמוג בן דוד.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: step === 1 ? 'flex-end' : 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid #F7F9FC',
          }}>
            {step > 1 && (
              <button onClick={goBack} style={outlineBtnStyle}>
                → חזרה
              </button>
            )}
            {step < 12 ? (
              <button
                onClick={goNext}
                disabled={
                  (step === 1 && data.years.length === 0) ||
                  (step === 2 && !data.employment_type) ||
                  (step === 10 && !data.income_range) ||
                  (step === 11 && (!data.full_name.trim() || !data.phone.trim()))
                }
                style={{
                  ...btnStyle,
                  opacity: (
                    (step === 1 && data.years.length === 0) ||
                    (step === 2 && !data.employment_type) ||
                    (step === 10 && !data.income_range) ||
                    (step === 11 && (!data.full_name.trim() || !data.phone.trim()))
                  ) ? 0.5 : 1,
                  cursor: (
                    (step === 1 && data.years.length === 0) ||
                    (step === 2 && !data.employment_type)
                  ) ? 'not-allowed' : 'pointer',
                }}
              >
                המשך ←
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...btnStyle, minWidth: '160px' }}
              >
                {loading ? 'שולח...' : '💰 שלח לבדיקה חינם'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
