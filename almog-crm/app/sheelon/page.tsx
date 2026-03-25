'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateScore, QuestionnaireAnswers } from '@/lib/scoring'

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Step =
  | 'employment'
  | 'years'
  | 'employer'
  | 'leave'
  | 'children'
  | 'degree'
  | 'periphery'
  | 'donations'
  | 'deposits'
  | 'income'
  | 'contact'

interface FormData {
  employmentType: string
  yearsToCheck: number[]
  changedEmployer: boolean | null
  numEmployers: number
  parallelJobs: boolean | null
  maternityLeave: boolean
  militaryReserve: boolean
  unemployment: boolean
  unpaidLeave: boolean
  numChildren: number
  youngestChildAge: string
  academicDegree: boolean | null
  peripheryResident: boolean | null
  donations: boolean | null
  donationAmount: string
  selfDeposits: boolean | null
  previousTaxReturn: boolean | null
  canUploadDocs: boolean | null
  incomeRange: string
  name: string
  idNumber: string
  city: string
  phone: string
  email: string
  consent: boolean
}

const STEPS: Step[] = [
  'employment', 'years', 'employer', 'leave',
  'children', 'degree', 'periphery', 'donations',
  'deposits', 'income', 'contact'
]

const CURRENT_YEAR = new Date().getFullYear()
const AVAILABLE_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 1 - i)

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #060f22 0%, #0c1c3a 40%, #0E1E40 100%)',
    fontFamily: "'Heebo', sans-serif",
    direction: 'rtl' as const,
    padding: '0 0 80px',
  },
  header: {
    background: 'rgba(255,255,255,.04)',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    color: '#E8C96A',
    fontWeight: 800,
    fontSize: '1.1rem',
  },
  backLink: {
    color: 'rgba(255,255,255,.5)',
    fontSize: '.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  wrapper: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  progressWrap: {
    marginBottom: '36px',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  progressLabel: {
    color: 'rgba(255,255,255,.45)',
    fontSize: '.82rem',
  },
  progressPct: {
    color: '#E8C96A',
    fontSize: '.82rem',
    fontWeight: 700,
  },
  progressTrack: {
    height: '6px',
    background: 'rgba(255,255,255,.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  card: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '20px',
    padding: '36px 32px',
    animation: 'fadeUp .4s ease both',
  },
  stepLabel: {
    fontSize: '.78rem',
    fontWeight: 700,
    color: '#C9A84C',
    letterSpacing: '.5px',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  question: {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.3,
    marginBottom: '8px',
  },
  questionSub: {
    fontSize: '.9rem',
    color: 'rgba(255,255,255,.5)',
    lineHeight: 1.6,
    marginBottom: '28px',
  },
  optionsGrid: {
    display: 'grid',
    gap: '12px',
  },
  option: (selected: boolean): React.CSSProperties => ({
    padding: '16px 20px',
    borderRadius: '12px',
    border: `2px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,.1)'}`,
    background: selected ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)',
    color: selected ? '#fff' : 'rgba(255,255,255,.7)',
    fontFamily: "'Heebo', sans-serif",
    fontSize: '1rem',
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    transition: 'all .2s ease',
    textAlign: 'right' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),
  optionDot: (selected: boolean): React.CSSProperties => ({
    width: '20px', height: '20px',
    borderRadius: '50%',
    border: `2px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,.2)'}`,
    background: selected ? '#C9A84C' : 'transparent',
    flexShrink: 0,
    transition: 'all .2s ease',
  }),
  checkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  checkItem: (selected: boolean): React.CSSProperties => ({
    padding: '14px 10px',
    borderRadius: '10px',
    border: `2px solid ${selected ? '#C9A84C' : 'rgba(255,255,255,.1)'}`,
    background: selected ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)',
    color: selected ? '#E8C96A' : 'rgba(255,255,255,.6)',
    fontFamily: "'Heebo', sans-serif",
    fontSize: '.9rem',
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    transition: 'all .2s ease',
    textAlign: 'center' as const,
  }),
  yesnoRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  inputField: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,.15)',
    background: 'rgba(255,255,255,.06)',
    color: '#fff',
    fontFamily: "'Heebo', sans-serif",
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color .2s',
    direction: 'rtl' as const,
    marginBottom: '16px',
  },
  inputLabel: {
    display: 'block',
    color: 'rgba(255,255,255,.6)',
    fontSize: '.88rem',
    fontWeight: 600,
    marginBottom: '8px',
  },
  nextBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
    color: '#0E1E40',
    fontFamily: "'Heebo', sans-serif",
    fontSize: '1.05rem',
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
    transition: 'all .3s ease',
    marginTop: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  nextBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  skipBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '50px',
    background: 'transparent',
    color: 'rgba(255,255,255,.35)',
    fontFamily: "'Heebo', sans-serif",
    fontSize: '.88rem',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'color .2s',
  },
  consentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    cursor: 'pointer',
  },
  consentBox: (checked: boolean): React.CSSProperties => ({
    width: '22px', height: '22px',
    borderRadius: '6px',
    border: `2px solid ${checked ? '#C9A84C' : 'rgba(255,255,255,.2)'}`,
    background: checked ? '#C9A84C' : 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    transition: 'all .2s',
  }),
  consentText: {
    color: 'rgba(255,255,255,.5)',
    fontSize: '.82rem',
    lineHeight: 1.6,
  },
  trustRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
    flexWrap: 'wrap' as const,
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255,255,255,.4)',
    fontSize: '.78rem',
  },
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormData>({
    employmentType: '',
    yearsToCheck: [],
    changedEmployer: null,
    numEmployers: 1,
    parallelJobs: null,
    maternityLeave: false,
    militaryReserve: false,
    unemployment: false,
    unpaidLeave: false,
    numChildren: -1,
    youngestChildAge: '',
    academicDegree: null,
    peripheryResident: null,
    donations: null,
    donationAmount: '',
    selfDeposits: null,
    previousTaxReturn: null,
    canUploadDocs: null,
    incomeRange: '',
    name: '',
    idNumber: '',
    city: '',
    phone: '',
    email: '',
    consent: false,
  })

  const step = STEPS[currentStep]
  const progress = Math.round((currentStep / STEPS.length) * 100)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleYear(year: number) {
    setForm(prev => ({
      ...prev,
      yearsToCheck: prev.yearsToCheck.includes(year)
        ? prev.yearsToCheck.filter(y => y !== year)
        : [...prev.yearsToCheck, year],
    }))
  }

  function canAdvance(): boolean {
    switch (step) {
      case 'employment': return form.employmentType !== ''
      case 'years': return form.yearsToCheck.length > 0
      case 'employer': return form.changedEmployer !== null && form.parallelJobs !== null
      case 'leave': return true // checkboxes, always can proceed
      case 'children': return form.numChildren >= 0
      case 'degree': return form.academicDegree !== null
      case 'periphery': return form.peripheryResident !== null
      case 'donations': return form.donations !== null
      case 'deposits': return form.selfDeposits !== null && form.previousTaxReturn !== null
      case 'income': return form.incomeRange !== ''
      case 'contact':
        return form.name.trim().length >= 2 &&
          form.phone.replace(/\D/g, '').length >= 9 &&
          form.consent
      default: return false
    }
  }

  function next() {
    if (!canAdvance()) return
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(p => p + 1)
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const answers: QuestionnaireAnswers = {
      employmentType: form.employmentType,
      yearsToCheck: form.yearsToCheck,
      changedEmployer: form.changedEmployer === true,
      numEmployers: form.numEmployers,
      maternityLeave: form.maternityLeave,
      numChildren: form.numChildren,
      youngestChildAge: form.youngestChildAge,
      academicDegree: form.academicDegree === true,
      peripheryResident: form.peripheryResident,
      donations: form.donations === true,
      donationAmount: form.donationAmount,
      incomeRange: form.incomeRange,
    }

    const scoring = calculateScore(answers)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            id_number: form.idNumber.trim() || null,
            city: form.city.trim() || null,
            source: 'questionnaire',
            score: scoring.score,
            estimated_refund_min: scoring.estimatedMin,
            estimated_refund_max: scoring.estimatedMax,
          },
          questionnaire: {
            ...answers,
            parallelJobs: form.parallelJobs === true,
            militaryReserve: form.militaryReserve,
            unemployment: form.unemployment,
            unpaidLeave: form.unpaidLeave,
            selfDeposits: form.selfDeposits === true,
            previousTaxReturn: form.previousTaxReturn === true,
            canUploadDocs: form.canUploadDocs === true,
            raw_data: form,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה בשמירת הפרטים')
      }

      const data = await res.json()
      router.push(`/todot?min=${scoring.estimatedMin}&max=${scoring.estimatedMax}&score=${scoring.level}&id=${data.lead_id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה. אנא נסה שוב.')
      setSubmitting(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoText}>אלמוג בן דוד | רו"ח</div>
        <a href="/hazarat-mas" style={s.backLink}>→ חזרה</a>
      </div>

      <div style={s.wrapper}>
        {/* Progress */}
        <div style={s.progressWrap}>
          <div style={s.progressMeta}>
            <span style={s.progressLabel}>שלב {currentStep + 1} מתוך 11</span>
            <span style={s.progressPct}>{progress}%</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
              borderRadius: '4px',
              transition: 'width .4s ease',
            }} />
          </div>
        </div>

        {/* Step cards */}
        <div style={s.card} key={step}>

          {/* ── STEP 1: Employment ─────────────────────── */}
          {step === 'employment' && (
            <>
              <div style={s.stepLabel}>שלב 1 / 11</div>
              <h2 style={s.question}>איך אפשר לאפיין אותך מבחינת עבודה?</h2>
              <p style={s.questionSub}>הכי נפוץ שמגיע החזר הוא לשכירים — אבל לא רק.</p>
              <div style={s.optionsGrid}>
                {[
                  { value: 'employee', label: 'שכיר/ה', icon: '💼', desc: 'עובד/ת עם תלושי שכר' },
                  { value: 'self_employed', label: 'עצמאי/ת', icon: '🏢', desc: 'עוסק פטור / מורשה / חברה' },
                  { value: 'both', label: 'שכיר/ה + עצמאי/ת', icon: '⚡', desc: 'שני מקורות הכנסה' },
                  { value: 'unemployed', label: 'לא עובד/ת כרגע', icon: '🔍', desc: 'בהפסקה / חיפוש עבודה' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    style={s.option(form.employmentType === opt.value)}
                    onClick={() => update('employmentType', opt.value)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px' }}>{opt.label}</div>
                      <div style={{ fontSize: '.78rem', opacity: .65 }}>{opt.desc}</div>
                    </div>
                    <div style={s.optionDot(form.employmentType === opt.value)} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 2: Years ──────────────────────────── */}
          {step === 'years' && (
            <>
              <div style={s.stepLabel}>שלב 2 / 11</div>
              <h2 style={s.question}>אילו שנים נבדוק?</h2>
              <p style={s.questionSub}>
                ניתן לתבוע החזר מס עד 6 שנים אחורה. ככל שנבדוק יותר שנים — יותר פוטנציאל.
                בחרו את כל השנים הרלוונטיות.
              </p>
              <div style={s.checkGrid}>
                {AVAILABLE_YEARS.map(year => (
                  <button
                    key={year}
                    style={s.checkItem(form.yearsToCheck.includes(year))}
                    onClick={() => toggleYear(year)}
                  >
                    {form.yearsToCheck.includes(year) ? '✓ ' : ''}{year}
                  </button>
                ))}
              </div>
              <div style={{
                background: 'rgba(201,168,76,.08)',
                border: '1px solid rgba(201,168,76,.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginTop: '16px',
                fontSize: '.82rem',
                color: 'rgba(255,255,255,.55)',
                lineHeight: 1.6,
              }}>
                💡 לא בטוחים? בחרו את כל השנים — אלמוג תבדוק בדיוק אילו שנים כדאי להגיש.
              </div>
            </>
          )}

          {/* ── STEP 3: Employer change ────────────────── */}
          {step === 'employer' && (
            <>
              <div style={s.stepLabel}>שלב 3 / 11</div>
              <h2 style={s.question}>האם החלפת מקום עבודה בשנים שבחרת?</h2>
              <p style={s.questionSub}>
                כל מעבר בין מעסיקים עשוי לגרום לניכוי מס ביתר — זה אחד הטריגרים הנפוצים ביותר.
              </p>
              <div style={s.yesnoRow}>
                <button
                  style={s.option(form.changedEmployer === true)}
                  onClick={() => update('changedEmployer', true)}
                >
                  <span style={{ fontSize: '1.3rem' }}>✅</span>
                  <span>כן, החלפתי</span>
                  <div style={s.optionDot(form.changedEmployer === true)} />
                </button>
                <button
                  style={s.option(form.changedEmployer === false)}
                  onClick={() => update('changedEmployer', false)}
                >
                  <span style={{ fontSize: '1.3rem' }}>➖</span>
                  <span>לא, נשארתי</span>
                  <div style={s.optionDot(form.changedEmployer === false)} />
                </button>
              </div>
              {form.changedEmployer && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ ...s.questionSub, marginBottom: '14px' }}>כמה מעסיקים שונים היו לך?</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[2, 3, '4+'].map(n => (
                      <button
                        key={n}
                        style={{
                          ...s.checkItem(form.numEmployers === (n === '4+' ? 4 : Number(n))),
                          flex: 1,
                        }}
                        onClick={() => update('numEmployers', n === '4+' ? 4 : Number(n))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#E8C96A', fontWeight: 700, fontSize: '.9rem', marginBottom: '12px' }}>
                  האם עבדת בכמה מקומות עבודה במקביל?
                </p>
                <div style={s.yesnoRow}>
                  <button style={s.option(form.parallelJobs === true)} onClick={() => update('parallelJobs', true)}>
                    <span>כן</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.parallelJobs === true)} />
                  </button>
                  <button style={s.option(form.parallelJobs === false)} onClick={() => update('parallelJobs', false)}>
                    <span>לא</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.parallelJobs === false)} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4: Leave types (checkboxes) ──────── */}
          {step === 'leave' && (
            <>
              <div style={s.stepLabel}>שלב 4 / 11</div>
              <h2 style={s.question}>האם הייתה לך הפסקה בעבודה?</h2>
              <p style={s.questionSub}>
                סמן/י את כל האפשרויות הרלוונטיות. כל הפסקה בהכנסה עשויה ליצור החזר מס.
              </p>
              <div style={s.optionsGrid}>
                {[
                  { key: 'maternityLeave' as const, icon: '👶', label: 'חופשת לידה', desc: 'לידה, אימוץ, אומנה' },
                  { key: 'militaryReserve' as const, icon: '🪖', label: 'מילואים ממושכים', desc: 'מעל 14 יום בשנה' },
                  { key: 'unemployment' as const, icon: '📋', label: 'אבטלה / דמי אבטלה', desc: 'קיבלת דמי אבטלה מביטוח לאומי' },
                  { key: 'unpaidLeave' as const, icon: '⏸️', label: 'חופשה ללא תשלום (חל"ת)', desc: 'עבדת אך ללא שכר לתקופה' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    style={{
                      ...s.option(form[opt.key]),
                      cursor: 'pointer',
                    }}
                    onClick={() => update(opt.key, !form[opt.key])}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px' }}>{opt.label}</div>
                      <div style={{ fontSize: '.78rem', opacity: .65 }}>{opt.desc}</div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '4px',
                      border: `2px solid ${form[opt.key] ? '#C9A84C' : 'rgba(255,255,255,.2)'}`,
                      background: form[opt.key] ? '#C9A84C' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '.8rem', color: '#0E1E40', fontWeight: 800,
                    }}>
                      {form[opt.key] ? '✓' : ''}
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ ...s.questionSub, marginTop: '16px', marginBottom: 0, fontSize: '.8rem' }}>
                לא חל אף אחד מאלה? לחץ/י "המשך" כפי שהוא.
              </p>
            </>
          )}

          {/* ── STEP 5: Children ──────────────────────── */}
          {step === 'children' && (
            <>
              <div style={s.stepLabel}>שלב 5 / 11</div>
              <h2 style={s.question}>כמה ילדים יש לך?</h2>
              <p style={s.questionSub}>
                הורים זכאים לנקודות זיכוי נוספות שמקטינות את חבות המס.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    style={{
                      ...s.checkItem(form.numChildren === n),
                      minWidth: '72px',
                    }}
                    onClick={() => update('numChildren', n)}
                  >
                    {n === 5 ? '5+' : n === 0 ? 'אין' : n}
                  </button>
                ))}
              </div>
              {form.numChildren > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ ...s.questionSub, marginBottom: '14px' }}>מה גיל הילד/ה הצעיר/ה ביותר?</p>
                  <div style={s.optionsGrid}>
                    {['עד שנה', '1–5 שנים', '6–17 שנים', 'מעל 18'].map(age => (
                      <button
                        key={age}
                        style={s.option(form.youngestChildAge === age)}
                        onClick={() => update('youngestChildAge', age)}
                      >
                        <span>{age}</span>
                        <div style={{ marginRight: 'auto' }} />
                        <div style={s.optionDot(form.youngestChildAge === age)} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── STEP 6: Degree ────────────────────────── */}
          {step === 'degree' && (
            <>
              <div style={s.stepLabel}>שלב 6 / 11</div>
              <h2 style={s.question}>האם סיימת תואר אקדמי ב-6 השנים האחרונות?</h2>
              <p style={s.questionSub}>
                סיום תואר ראשון, שני, או לימודי הנדסאי — מזכה בנקודת זיכוי מס שמשמעותית ב-3 השנים לאחר הסיום. רוב האנשים לא יודעים על זה!
              </p>
              <div style={s.yesnoRow}>
                <button
                  style={s.option(form.academicDegree === true)}
                  onClick={() => update('academicDegree', true)}
                >
                  <span style={{ fontSize: '1.3rem' }}>🎓</span>
                  <span>כן, סיימתי</span>
                  <div style={s.optionDot(form.academicDegree === true)} />
                </button>
                <button
                  style={s.option(form.academicDegree === false)}
                  onClick={() => update('academicDegree', false)}
                >
                  <span style={{ fontSize: '1.3rem' }}>➖</span>
                  <span>לא</span>
                  <div style={s.optionDot(form.academicDegree === false)} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 7: Periphery ─────────────────────── */}
          {step === 'periphery' && (
            <>
              <div style={s.stepLabel}>שלב 7 / 11</div>
              <h2 style={s.question}>האם אתה גר ביישוב מזכה?</h2>
              <p style={s.questionSub}>
                תושבי ישובי ספר, עיירות פיתוח ואזורי עדיפות לאומית זכאים להנחה בנקודות זיכוי.
                <br />
                דוגמאות: באר שבע, אשדוד, קריית שמונה, נתיבות, דימונה, ירוחם, מצפה רמון ועוד.
              </p>
              <div style={s.optionsGrid}>
                {[
                  { value: true, label: 'כן, גר ביישוב מזכה', icon: '📍' },
                  { value: false, label: 'לא, אני גר במרכז', icon: '🏙️' },
                  { value: null, label: 'לא בטוח — אלמוג תבדוק', icon: '❓' },
                ].map(opt => (
                  <button
                    key={String(opt.value)}
                    style={s.option(form.peripheryResident === opt.value)}
                    onClick={() => update('peripheryResident', opt.value)}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                    <span>{opt.label}</span>
                    <div style={{ marginRight: 'auto' }} />
                    <div style={s.optionDot(form.peripheryResident === opt.value)} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 8: Donations ─────────────────────── */}
          {step === 'donations' && (
            <>
              <div style={s.stepLabel}>שלב 8 / 11</div>
              <h2 style={s.question}>האם תרמת לעמותות מוכרות לצרכי מס?</h2>
              <p style={s.questionSub}>
                תרומות מעל 190 ₪ לעמותות עם אישור סעיף 46 מזכות בזיכוי מס של 35% מסכום התרומה.
              </p>
              <div style={s.yesnoRow}>
                <button
                  style={s.option(form.donations === true)}
                  onClick={() => update('donations', true)}
                >
                  <span style={{ fontSize: '1.3rem' }}>🤝</span>
                  <span>כן, תרמתי</span>
                  <div style={s.optionDot(form.donations === true)} />
                </button>
                <button
                  style={s.option(form.donations === false)}
                  onClick={() => update('donations', false)}
                >
                  <span style={{ fontSize: '1.3rem' }}>➖</span>
                  <span>לא</span>
                  <div style={s.optionDot(form.donations === false)} />
                </button>
              </div>
              {form.donations && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ ...s.questionSub, marginBottom: '12px' }}>מה סך התרומות (בערך)?</p>
                  <div style={s.optionsGrid}>
                    {['עד 500 ₪', '500 – 2,000 ₪', '2,000 – 10,000 ₪', 'מעל 10,000 ₪'].map(amt => (
                      <button
                        key={amt}
                        style={s.option(form.donationAmount === amt)}
                        onClick={() => update('donationAmount', amt)}
                      >
                        <span>{amt}</span>
                        <div style={{ marginRight: 'auto' }} />
                        <div style={s.optionDot(form.donationAmount === amt)} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── STEP 9: Deposits + Previous return ────── */}
          {step === 'deposits' && (
            <>
              <div style={s.stepLabel}>שלב 9 / 11</div>
              <h2 style={s.question}>עוד כמה שאלות קצרות</h2>
              <p style={s.questionSub}>
                מידע זה עשוי להוסיף לזכאות שלך
              </p>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#E8C96A', fontWeight: 700, fontSize: '.9rem', marginBottom: '12px' }}>
                  האם ביצעת הפקדות עצמאיות לפנסיה / קרן השתלמות / ביטוח חיים?
                </p>
                <div style={s.yesnoRow}>
                  <button style={s.option(form.selfDeposits === true)} onClick={() => update('selfDeposits', true)}>
                    <span>כן</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.selfDeposits === true)} />
                  </button>
                  <button style={s.option(form.selfDeposits === false)} onClick={() => update('selfDeposits', false)}>
                    <span>לא</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.selfDeposits === false)} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#E8C96A', fontWeight: 700, fontSize: '.9rem', marginBottom: '12px' }}>
                  האם הגשת בקשה להחזר מס בעבר?
                </p>
                <div style={s.yesnoRow}>
                  <button style={s.option(form.previousTaxReturn === true)} onClick={() => update('previousTaxReturn', true)}>
                    <span>כן, כבר הגשתי</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.previousTaxReturn === true)} />
                  </button>
                  <button style={s.option(form.previousTaxReturn === false)} onClick={() => update('previousTaxReturn', false)}>
                    <span>לא</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.previousTaxReturn === false)} />
                  </button>
                </div>
              </div>

              <div>
                <p style={{ color: '#E8C96A', fontWeight: 700, fontSize: '.9rem', marginBottom: '12px' }}>
                  האם תוכל/י להעלות מסמכים (טופסי 106, ת"ז) בהמשך?
                </p>
                <div style={s.yesnoRow}>
                  <button style={s.option(form.canUploadDocs === true)} onClick={() => update('canUploadDocs', true)}>
                    <span>כן, אני מוכן/ה</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.canUploadDocs === true)} />
                  </button>
                  <button style={s.option(form.canUploadDocs === false)} onClick={() => update('canUploadDocs', false)}>
                    <span>אדאג לזה בהמשך</span><div style={{ marginRight: 'auto' }} /><div style={s.optionDot(form.canUploadDocs === false)} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 10: Income ───────────────────────── */}
          {step === 'income' && (
            <>
              <div style={s.stepLabel}>שלב 10 / 11</div>
              <h2 style={s.question}>מה ההכנסה השנתית שלך (ברוטו)?</h2>
              <p style={s.questionSub}>
                ממוצע שנתי לפני מס. מידע זה עוזר לאמוד את גודל ההחזר הפוטנציאלי.
              </p>
              <div style={s.optionsGrid}>
                {[
                  { value: 'עד 80,000 ₪', desc: 'עד ~6,700 ₪ בחודש' },
                  { value: '80,000 – 150,000 ₪', desc: '6,700 – 12,500 ₪ בחודש' },
                  { value: '150,000 – 300,000 ₪', desc: '12,500 – 25,000 ₪ בחודש' },
                  { value: 'מעל 300,000 ₪', desc: 'מעל 25,000 ₪ בחודש' },
                  { value: 'מעדיף/ה לא לציין', desc: '' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    style={s.option(form.incomeRange === opt.value)}
                    onClick={() => update('incomeRange', opt.value)}
                  >
                    <div style={{ flex: 1 }}>
                      <div>{opt.value}</div>
                      {opt.desc && <div style={{ fontSize: '.76rem', opacity: .55, marginTop: '2px' }}>{opt.desc}</div>}
                    </div>
                    <div style={s.optionDot(form.incomeRange === opt.value)} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 11: Contact ──────────────────────── */}
          {step === 'contact' && (
            <>
              <div style={s.stepLabel}>שלב 11 / 11</div>
              <h2 style={s.question}>כמעט סיימנו!</h2>
              <p style={s.questionSub}>
                השאירו פרטים ואלמוג תחזור אליכם תוך 24 שעות עם הערכת ההחזר המלאה — חינם, ללא התחייבות.
              </p>

              <div>
                <label style={s.inputLabel}>שם מלא *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="ישראל ישראלי"
                  style={s.inputField}
                  autoComplete="name"
                />

                <label style={s.inputLabel}>טלפון *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="054-7312262"
                  style={s.inputField}
                  autoComplete="tel"
                  dir="ltr"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div>
                    <label style={s.inputLabel}>תעודת זהות</label>
                    <input
                      type="text"
                      value={form.idNumber}
                      onChange={e => update('idNumber', e.target.value)}
                      placeholder="000000000"
                      style={{ ...s.inputField }}
                      dir="ltr"
                      maxLength={9}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label style={s.inputLabel}>עיר מגורים</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      placeholder="באר שבע"
                      style={{ ...s.inputField }}
                    />
                  </div>
                </div>

                <label style={s.inputLabel}>אימייל (אופציונלי)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="email@example.com"
                  style={{ ...s.inputField, marginBottom: '24px' }}
                  autoComplete="email"
                  dir="ltr"
                />

                <label
                  style={s.consentRow}
                  onClick={() => update('consent', !form.consent)}
                >
                  <div style={s.consentBox(form.consent)}>
                    {form.consent && <span style={{ color: '#0E1E40', fontSize: '.9rem', fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={s.consentText}>
                    אני מסכים/ה לקבל פנייה מאלמוג בן דוד לצורך הערכת זכאות להחזר מס, ומאשר/ת עיבוד המידע לצורך זה בהתאם{' '}
                    <a href="/privacy" style={{ color: '#C9A84C' }}>למדיניות הפרטיות</a>.
                  </span>
                </label>
              </div>

              <div style={s.trustRow}>
                <span style={s.trustItem}>🔒 מידע מוגן ומאובטח</span>
                <span style={s.trustItem}>⚡ תגובה תוך 24 שעות</span>
                <span style={s.trustItem}>✓ ייעוץ ראשוני חינם</span>
              </div>
            </>
          )}

          {/* ── Next / Submit button ───────────────────── */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,.15)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#FCA5A5',
              fontSize: '.88rem',
              marginTop: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            style={{
              ...s.nextBtn,
              ...((!canAdvance() || submitting) ? s.nextBtnDisabled : {}),
            }}
            onClick={next}
            disabled={!canAdvance() || submitting}
          >
            {submitting ? (
              '...'
            ) : currentStep === STEPS.length - 1 ? (
              <>שלח פרטים ←</>
            ) : (
              <>המשך ←</>
            )}
          </button>

          {currentStep > 0 && (
            <button
              style={s.skipBtn}
              onClick={() => setCurrentStep(p => p - 1)}
            >
              ← חזרה לשאלה הקודמת
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border-color: #C9A84C !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,.15);
        }
        input::placeholder { color: rgba(255,255,255,.25); }
      `}</style>
    </div>
  )
}
