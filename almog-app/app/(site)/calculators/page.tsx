'use client'

import { useState, useEffect } from 'react'

// ─── FINANCIAL CONSTANTS ───
const CREDIT_POINT_ANNUAL = 2904
const CREDIT_POINT_MONTHLY = 242
const TAX_BRACKETS: [number, number][] = [
  [81480, 0.10], [116760, 0.14], [187440, 0.20],
  [260520, 0.31], [557200, 0.35], [Infinity, 0.47],
]
const BL_LOW = 7522
const BL_CEIL = 47465
const CIRC = 2 * Math.PI * 72

function calcIncomeTaxFromBrackets(income: number): number {
  let tax = 0, prev = 0
  for (const [limit, rate] of TAX_BRACKETS) {
    if (income <= prev) break
    tax += (Math.min(income, limit) - prev) * rate
    prev = limit
  }
  return tax
}
function setDonut(elId: string, pct: number) {
  const el = document.getElementById(elId) as SVGCircleElement | null
  if (!el) return
  el.style.strokeDasharray = `${Math.min(pct, 100) / 100 * CIRC} ${CIRC}`
}
function setDonutOffset(elId: string, startPct: number, pct: number) {
  const el = document.getElementById(elId) as SVGCircleElement | null
  if (!el) return
  el.style.strokeDasharray = `${Math.min(pct, 100) / 100 * CIRC} ${CIRC}`
  el.style.strokeDashoffset = `-${startPct / 100 * CIRC}`
}
function setElText(id: string, val: string) {
  const el = document.getElementById(id); if (el) el.textContent = val
}
function animateNum(elId: string, targetVal: number, suffix = ' ₪') {
  const el = document.getElementById(elId); if (!el) return
  const start = parseFloat((el.textContent || '0').replace(/[^0-9.-]/g, '')) || 0
  const startTime = performance.now()
  el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 400)
  function step(now: number) {
    const p = Math.min((now - startTime) / 700, 1)
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
    el.textContent = Math.round(start + (targetVal - start) * ease).toLocaleString('he-IL') + suffix
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
function showInsight(elId: string, msg: string) {
  const el = document.getElementById(elId); if (!el) return
  el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.textContent = msg
  setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'all .5s ease' }, 50)
}
function setCtaHot(ctaId: string, isHot: boolean) {
  const el = document.getElementById(ctaId); if (el) el.classList.toggle('hot', isHot)
}

function doCalcIncomeTax() {
  const incomeEl = document.getElementById('it-income') as HTMLInputElement | null
  const familyEl = document.getElementById('it-family') as HTMLSelectElement | null
  const childrenEl = document.getElementById('it-children') as HTMLSelectElement | null
  if (!incomeEl) return
  const income = parseFloat(incomeEl.value) || 0
  const creditPts = parseFloat(familyEl?.value || '2.25')
  const children = parseInt(childrenEl?.value || '0')
  const creditValue = (creditPts + children * 0.5) * CREDIT_POINT_ANNUAL
  const tax = calcIncomeTaxFromBrackets(income)
  const finalTax = Math.max(0, tax - creditValue)
  const monthlyIncome = income / 12
  const blMonthly = monthlyIncome > 0 ? Math.min(monthlyIncome, BL_LOW) * 0.035 + Math.max(0, Math.min(monthlyIncome, BL_CEIL) - BL_LOW) * 0.12 : 0
  const bl = blMonthly * 12
  const health = Math.min(income, BL_LOW * 12) * 0.031 + Math.max(0, income - BL_LOW * 12) * 0.05
  const totalDeductions = finalTax + bl + health
  const net = income - totalDeductions
  const effectiveRate = income > 0 ? (totalDeductions / income * 100) : 0
  const taxPct = income > 0 ? (finalTax / income * 100) : 0
  const blPct = income > 0 ? ((bl + health) / income * 100) : 0
  setDonut('it-donut-tax', taxPct); setDonutOffset('it-donut-bl', taxPct, blPct)
  setElText('it-donut-pct', effectiveRate.toFixed(1) + '%')
  animateNum('it-net', Math.max(0, net)); animateNum('it-gross-show', income)
  animateNum('it-tax-before', tax); animateNum('it-credits', creditValue)
  animateNum('it-tax-final', finalTax); animateNum('it-bituach', bl + health)
  setElText('it-rate', income > 0 ? effectiveRate.toFixed(1) + '%' : '0%')
  if (effectiveRate > 30) showInsight('it-insight', `⚡ ${effectiveRate.toFixed(0)}% מס אפקטיבי — ייעוץ מס עשוי לחסוך אלפי שקלים בשנה.`)
  else if (effectiveRate > 20) showInsight('it-insight', `💡 ${effectiveRate.toFixed(0)}% מס אפקטיבי. בדיקת נקודות זיכוי יכולה להוריד את השיעור.`)
  else showInsight('it-insight', `✓ שיעור מס אפקטיבי של ${effectiveRate.toFixed(0)}%. בדיקה מקצועית תוודא שאתה ממצה את כל הזיכויים.`)
  setCtaHot('it-cta', effectiveRate > 25)
}

function doCalcTaxRefund() {
  const incomeEl = document.getElementById('tr-income') as HTMLInputElement | null
  const monthsEl = document.getElementById('tr-months') as HTMLSelectElement | null
  const familyEl = document.getElementById('tr-family') as HTMLSelectElement | null
  if (!incomeEl) return
  const income = parseFloat(incomeEl.value) || 0
  const months = parseInt(monthsEl?.value || '12')
  const creditPts = parseFloat(familyEl?.value || '2.25')
  const creditValue = creditPts * CREDIT_POINT_ANNUAL
  const taxPaid = Math.max(0, calcIncomeTaxFromBrackets(income) - creditValue)
  const proRataIncome = months < 12 ? income * (months / 12) : income
  const taxShould = Math.max(0, calcIncomeTaxFromBrackets(proRataIncome) - creditValue)
  const refund = Math.max(0, taxPaid - taxShould)
  const refundPct = taxPaid > 0 ? Math.min((refund / taxPaid) * 100, 100) : 0
  setDonut('tr-donut', refundPct)
  setElText('tr-donut-pct', Math.round(refund).toLocaleString('he-IL') + ' ₪')
  animateNum('tr-refund', refund); animateNum('tr-paid', taxPaid)
  animateNum('tr-should', taxShould); animateNum('tr-diff', refund)
  if (refund > 5000) showInsight('tr-insight-main', `🔥 החזר משמעותי! שווה לבדוק גם שנים קודמות — עד 6 שנים אחורה.`)
  else if (refund > 2000) showInsight('tr-insight-main', '💡 יש סיכוי טוב להחזר מס. בדיקה מלאה עשויה לחשוף זיכויים נוספים.')
  else if (months < 12) showInsight('tr-insight-main', '📅 עבדת פחות משנה מלאה — זה אחד הטריגרים העיקריים לקבלת החזר מס!')
  else showInsight('tr-insight-main', '✓ גם אם ההערכה נמוכה, בדיקה מלאה עשויה לחשוף זיכויים שהמחשבון לא מכיל.')
  setCtaHot('tr-cta', refund > 2000 || months < 12)
}

function doCalcChildBenefits() {
  const childrenEl = document.getElementById('cb-children') as HTMLSelectElement | null
  const youngEl = document.getElementById('cb-young') as HTMLSelectElement | null
  if (!childrenEl) return
  const children = parseInt(childrenEl.value) || 1
  const young = parseInt(youngEl?.value || '0')
  const monthlyAllowance = children * 183
  const taxCreditMonthly = (young * 1.5 + Math.max(0, children - young) * 0.5) * CREDIT_POINT_MONTHLY
  const totalMonthly = monthlyAllowance + taxCreditMonthly
  animateNum('cb-allowance', monthlyAllowance); animateNum('cb-tax-credit', taxCreditMonthly)
  animateNum('cb-total-monthly', totalMonthly); animateNum('cb-annual', totalMonthly * 12)
  if (children >= 4) showInsight('cb-insight', `🌟 ${children} ילדים — ייתכנו זכאויות נוספות כמו מענקים ופטורים.`)
  else if (young > 0) showInsight('cb-insight', `💡 ילד מתחת לגיל 5 מזכה בנקודות זיכוי נוספות.`)
  else showInsight('cb-insight', `📋 בדיקה מקצועית עשויה לחשוף זכאויות נוספות.`)
  setCtaHot('cb-cta', totalMonthly > 1000)
}

function doCalcCompound() {
  const initialEl = document.getElementById('ci-initial') as HTMLInputElement | null
  if (!initialEl) return
  const initial = parseFloat(initialEl.value) || 0
  const monthly = parseFloat((document.getElementById('ci-monthly') as HTMLInputElement)?.value || '0')
  const rate = parseFloat((document.getElementById('ci-rate') as HTMLSelectElement)?.value || '5') / 100
  const years = parseInt((document.getElementById('ci-years') as HTMLSelectElement)?.value || '20')
  const totalInvested = initial + monthly * 12 * years
  const total = initial * Math.pow(1 + rate, years) + (years > 0 ? monthly * 12 * ((Math.pow(1 + rate, years) - 1) / rate) : 0)
  const interest = Math.max(0, total - totalInvested)
  const multiplier = totalInvested > 0 ? total / totalInvested : 0
  const steps = Math.min(years, 8)
  const barData = Array.from({ length: steps }, (_, i) => {
    const y = Math.round(years * (i + 1) / steps)
    const inv = initial + monthly * 12 * y
    const tot = initial * Math.pow(1 + rate, y) + (y > 0 ? monthly * 12 * ((Math.pow(1 + rate, y) - 1) / rate) : 0)
    return { label: y + ' שנה', invested: inv, interest: Math.max(0, tot - inv) }
  })
  const container = document.getElementById('ci-bar-chart')
  if (container) {
    const maxVal = Math.max(...barData.map(d => d.invested + d.interest), 1)
    container.innerHTML = barData.map(d => {
      const iH = Math.max(4, (d.invested / maxVal) * 100), intH = Math.max(0, (d.interest / maxVal) * 100)
      return `<div class="calc-bar-col"><div class="calc-bar-val show">${Math.round((d.invested + d.interest) / 1000)}K</div><div class="calc-bar" style="height:${intH}%;background:rgba(201,168,76,.35);"></div><div class="calc-bar" style="height:${iH}%;background:var(--gold);"></div><div class="calc-bar-label">${d.label}</div></div>`
    }).join('')
  }
  animateNum('ci-total', total); animateNum('ci-invested', totalInvested); animateNum('ci-interest', interest)
  setElText('ci-multiplier', multiplier > 0 ? multiplier.toFixed(1) + '×' : '0×')
  if (interest > 500000) showInsight('ci-insight', `⚡ ${Math.round(interest / 1000)}K ₪ ריבית שנצברת — הכסף עובד קשה בשבילך.`)
  else if (multiplier > 2) showInsight('ci-insight', `📈 הכסף שלך יוכפל פי ${multiplier.toFixed(1)} — ריבית דריבית בפעולה.`)
  else showInsight('ci-insight', `💡 תשואה גבוהה יותר משנה דרמטית את התוצאה. כדאי לבחון אפיקי השקעה.`)
  setCtaHot('ci-cta', interest > totalInvested * 0.4)
}

function doCalcEducationFund() {
  const salaryEl = document.getElementById('ef-salary') as HTMLInputElement | null
  if (!salaryEl) return
  const salary = parseFloat(salaryEl.value) || 0
  const employerRate = parseFloat((document.getElementById('ef-employer') as HTMLSelectElement)?.value || '7.5') / 100
  const employeeRate = parseFloat((document.getElementById('ef-employee') as HTMLSelectElement)?.value || '2.5') / 100
  const years = parseInt((document.getElementById('ef-years') as HTMLSelectElement)?.value || '15')
  const totalMonthly = salary * (employerRate + employeeRate)
  const total = years > 0 ? totalMonthly * 12 * ((Math.pow(1.05, years) - 1) / 0.05) : 0
  const taxBenefit = Math.min(salary * employerRate * 12, 15712) * 0.30
  const netCost = Math.max(0, salary * employeeRate - taxBenefit / 12)
  animateNum('ef-employer-monthly', salary * employerRate); animateNum('ef-employee-monthly', salary * employeeRate)
  animateNum('ef-tax-benefit', taxBenefit); animateNum('ef-net-cost', netCost); animateNum('ef-total', total)
  if (taxBenefit > 3000) showInsight('ef-insight', `💰 הטבת מס של ${Math.round(taxBenefit).toLocaleString('he-IL')} ₪ בשנה — זה כסף אמיתי שנחסך.`)
  else showInsight('ef-insight', `💡 קרן השתלמות היא אחד מאפיקי החיסכון הכדאיים ביותר לשכירים.`)
  setCtaHot('ef-cta', total > 200000)
}

function doCalcNetSalary() {
  const grossEl = document.getElementById('ns-gross') as HTMLInputElement | null
  if (!grossEl) return
  const gross = parseFloat(grossEl.value) || 0
  const creditPts = parseFloat((document.getElementById('ns-family') as HTMLSelectElement)?.value || '2.25')
  const pensionRate = parseFloat((document.getElementById('ns-pension') as HTMLSelectElement)?.value || '0.065')
  const monthlyTax = Math.max(0, (calcIncomeTaxFromBrackets(gross * 12) - creditPts * CREDIT_POINT_ANNUAL) / 12)
  const bl = Math.min(gross, BL_LOW) * 0.035 + Math.max(0, Math.min(gross, BL_CEIL) - BL_LOW) * 0.12
  const health = Math.min(gross, BL_LOW) * 0.031 + Math.max(0, gross - BL_LOW) * 0.05
  const pension = gross * pensionRate
  const totalDed = monthlyTax + bl + health + pension
  const dedRate = gross > 0 ? (totalDed / gross * 100) : 0
  setDonut('ns-donut-ded', dedRate); setElText('ns-donut-pct', dedRate.toFixed(1) + '%')
  animateNum('ns-gross-show', gross); animateNum('ns-tax', monthlyTax); animateNum('ns-bl', bl)
  animateNum('ns-health', health); animateNum('ns-pension-show', pension)
  setElText('ns-rate', gross > 0 ? dedRate.toFixed(1) + '%' : '0%'); animateNum('ns-net', Math.max(0, gross - totalDed))
  if (dedRate > 30) showInsight('ns-insight', `⚡ ניכוי כולל ${dedRate.toFixed(0)}% מהשכר — האם ניצלת את כל נקודות הזיכוי שמגיעות לך?`)
  else showInsight('ns-insight', `💡 ניכוי כולל ${dedRate.toFixed(0)}%. בדיקת זכאות לנקודות זיכוי נוספות יכולה להוסיף לשכר הנטו.`)
  setCtaHot('ns-cta', dedRate > 28)
}

export default function CalculatorsPage() {
  const [activeCalcCat, setActiveCalcCat] = useState(0)
  const [activeSubTabs, setActiveSubTabs] = useState([0, 0, 0])

  const switchSubTab = (catIdx: number, subIdx: number) => {
    setActiveSubTabs(prev => { const n = [...prev]; n[catIdx] = subIdx; return n })
  }

  useEffect(() => {
    setTimeout(() => {
      doCalcIncomeTax(); doCalcTaxRefund(); doCalcChildBenefits()
      doCalcCompound(); doCalcEducationFund(); doCalcNetSalary()
    }, 100)
  }, [])

  useEffect(() => {
    setTimeout(() => [doCalcIncomeTax, doCalcCompound, doCalcNetSalary][activeCalcCat]?.(), 50)
  }, [activeCalcCat])

  useEffect(() => {
    const fns = [[doCalcIncomeTax, doCalcTaxRefund, doCalcChildBenefits], [doCalcCompound, doCalcEducationFund], [doCalcNetSalary]]
    setTimeout(() => fns[activeCalcCat]?.[activeSubTabs[activeCalcCat]]?.(), 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTabs])

  return (
    <>
      {/* PAGE HEADER */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', padding: '100px 0 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(201,168,76,.07)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.55)', fontSize: '.88rem', fontWeight: 600, textDecoration: 'none', marginBottom: 28, transition: 'color .25s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold-light)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.55)'}
          >← חזרה לדף הבית</a>
          <div className="gold-line" />
          <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 900, color: 'var(--white)', marginBottom: 16, letterSpacing: '-.5px' }}>מחשבונים פיננסיים</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.68)', maxWidth: 560, lineHeight: 1.7 }}>כלים חינמיים לחישוב מס הכנסה, החזרי מס, שכר נטו, ריבית דריבית וקרן השתלמות — ללא הרשמה</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            {['🧾 מיסים והחזרים', '📈 השקעות וחיסכון', '💼 שכר והכנסה'].map((label, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 50, padding: '8px 20px', fontSize: '.84rem', fontWeight: 700, color: 'rgba(255,255,255,.75)' }}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATORS */}
      <section className="section" id="calculators">
        <div className="container">
          <div className="calc-cat-tabs">
            {['🧾 מיסים והחזרים', '📈 השקעות וחיסכון', '💼 שכר והכנסה'].map((label, i) => (
              <button key={i} className={`calc-cat-tab${activeCalcCat === i ? ' active' : ''}`} onClick={() => setActiveCalcCat(i)}>{label}</button>
            ))}
          </div>

          {/* Category 0 — מיסים */}
          <div className={`calc-cat-panel${activeCalcCat === 0 ? ' active' : ''}`}>
            <div className="calc-sub-tabs">
              {['מס הכנסה', 'החזר מס', 'הטבות ילדים'].map((label, i) => (
                <button key={i} className={`calc-sub-tab${activeSubTabs[0] === i ? ' active' : ''}`} onClick={() => switchSubTab(0, i)}>{label}</button>
              ))}
            </div>
            <div className={`calc-panel${activeSubTabs[0] === 0 ? ' active' : ''}`}>
              <p className="calc-description">חשב כמה מס הכנסה תשלם השנה לפי מדרגות המס הרשמיות העדכניות</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>מחשבון מס הכנסה</h3>
                  <div className="form-group"><label>הכנסה שנתית ברוטו (₪)</label><input type="number" id="it-income" defaultValue="180000" min="0" onChange={doCalcIncomeTax} /></div>
                  <div className="form-group"><label>מצב משפחתי</label><select id="it-family" onChange={doCalcIncomeTax}><option value="2.25">רווק/ה</option><option value="2.75">נשוי/ה</option><option value="3.25">הורה לילד עד גיל 5</option><option value="4.0">הורה חד-הורי</option></select></div>
                  <div className="form-group"><label>מספר ילדים</label><select id="it-children" onChange={doCalcIncomeTax}><option value="0">ללא ילדים</option><option value="1">ילד אחד</option><option value="2">2 ילדים</option><option value="3">3 ילדים</option><option value="4">4+ ילדים</option></select></div>
                  <div className="calc-disclaimer">⚡ הסכומים הם הערכה בלבד ואינם מחליפים ייעוץ מקצועי.</div>
                </div>
                <div className="calc-result" id="it-result">
                  <h3>תוצאת חישוב</h3>
                  <div className="calc-donut-wrap"><div className="calc-donut"><svg viewBox="0 0 180 180"><circle className="donut-bg" /><circle className="donut-fill" id="it-donut-tax" /><circle className="donut-fill2" id="it-donut-bl" /></svg><div className="calc-donut-center"><div className="calc-donut-pct" id="it-donut-pct">0%</div><div className="calc-donut-label">מס אפקטיבי</div></div></div></div>
                  <div className="calc-legend"><div className="calc-legend-item"><span className="calc-legend-dot" style={{ background: 'var(--gold)' }} /> מס הכנסה</div><div className="calc-legend-item"><span className="calc-legend-dot" style={{ background: 'var(--gold-light)' }} /> ביטוח לאומי + בריאות</div></div>
                  <div className="result-main"><div className="result-main-num" id="it-net">0 ₪</div><div className="result-main-label">שכר שנתי נטו משוער</div></div>
                  <div className="result-row"><span className="result-label">הכנסה ברוטו שנתית</span><span className="result-value" id="it-gross-show">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">מס הכנסה לפני זיכויים</span><span className="result-value" id="it-tax-before">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">זיכוי נקודות מס</span><span className="result-value" id="it-credits">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">מס הכנסה סופי</span><span className="result-value" id="it-tax-final">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">ביטוח לאומי + בריאות</span><span className="result-value" id="it-bituach">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">שיעור מס אפקטיבי</span><span className="result-value" id="it-rate">0%</span></div>
                  <p className="calc-note">* מבוסס על הנתונים הרשמיים העדכניים ביותר</p>
                  <div className="calc-insight" id="it-insight" /><div className="calc-cta" id="it-cta"><p>ייתכן שמגיע לך החזר מס — בדיקה מלאה תיקח 2 דקות</p><a href="#contact-cta" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
                </div>
              </div>
            </div>
            <div className={`calc-panel${activeSubTabs[0] === 1 ? ' active' : ''}`}>
              <p className="calc-description">גלה אם מגיע לך החזר מס ובאיזה סכום — ניתן לתבוע עד 6 שנים אחורה</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>מחשבון החזר מס</h3>
                  <div className="form-group"><label>שנת המס לבדיקה</label><select id="tr-year"><option>2025</option><option>2024</option><option>2023</option><option>2022</option><option>2021</option></select></div>
                  <div className="form-group"><label>הכנסה ברוטו באותה שנה (₪)</label><input type="number" id="tr-income" defaultValue="120000" onChange={doCalcTaxRefund} /></div>
                  <div className="form-group"><label>חודשי עבודה באותה שנה</label><select id="tr-months" onChange={doCalcTaxRefund}><option value="12">12 חודשים</option><option value="11">11 חודשים</option><option value="10">10 חודשים</option><option value="9">9 חודשים</option><option value="8">8 חודשים</option><option value="6">6 חודשים</option></select></div>
                  <div className="form-group"><label>מצב משפחתי</label><select id="tr-family" onChange={doCalcTaxRefund}><option value="2.25">רווק/ה</option><option value="2.75">נשוי/ה</option><option value="3.25">הורה לילד קטן</option><option value="4.0">הורה חד-הורי</option></select></div>
                  <div className="calc-disclaimer">💡 ניתן לתבוע החזר עד 6 שנים אחורה!</div>
                </div>
                <div className="calc-result" id="tr-result">
                  <h3>הערכת ההחזר</h3>
                  <div className="calc-donut-wrap"><div className="calc-donut"><svg viewBox="0 0 180 180"><circle className="donut-bg" /><circle className="donut-fill" id="tr-donut" /></svg><div className="calc-donut-center"><div className="calc-donut-pct" id="tr-donut-pct" style={{ fontSize: '1.4rem' }}>0 ₪</div><div className="calc-donut-label">החזר משוער</div></div></div></div>
                  <div className="result-main" style={{ paddingTop: 8 }}><div className="result-main-num" id="tr-refund">0 ₪</div><div className="result-main-label">החזר מס משוער</div></div>
                  <div className="result-row"><span className="result-label">מס ששולם (הערכה)</span><span className="result-value" id="tr-paid">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">מס שהיה צריך לשלם</span><span className="result-value" id="tr-should">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">הפרש לטובתך</span><span className="result-value" id="tr-diff">0 ₪</span></div>
                  <p className="calc-note">* הערכה בלבד – התוצאה האמיתית עשויה להיות גבוהה יותר!</p>
                  <div className="calc-insight" id="tr-insight-main" /><div className="calc-cta" id="tr-cta"><p>ייתכן שמגיע לך החזר מס</p><a href="#contact-cta" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
                </div>
              </div>
            </div>
            <div className={`calc-panel${activeSubTabs[0] === 2 ? ' active' : ''}`}>
              <p className="calc-description">חשב את קצבאות הילדים וזיכויי המס שמגיעים לך מביטוח לאומי ומרשות המסים</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>הטבות ילדים</h3>
                  <div className="form-group"><label>מספר ילדים</label><select id="cb-children" onChange={doCalcChildBenefits}><option value="1">ילד אחד</option><option value="2">2 ילדים</option><option value="3">3 ילדים</option><option value="4">4 ילדים</option><option value="5">5 ילדים</option><option value="6">6+ ילדים</option></select></div>
                  <div className="form-group"><label>כמה מהם מתחת לגיל 5?</label><select id="cb-young" onChange={doCalcChildBenefits}><option value="0">אין</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
                  <div className="form-group"><label>הכנסה חודשית ברוטו (₪)</label><input type="number" id="cb-income" defaultValue="15000" onChange={doCalcChildBenefits} /></div>
                  <div className="calc-disclaimer">📋 הקצבאות מבוססות על נתוני ביטוח לאומי 2025.</div>
                </div>
                <div className="calc-result">
                  <h3>הטבות חודשיות</h3>
                  <div className="result-main"><div className="result-main-num" id="cb-total-monthly">0 ₪</div><div className="result-main-label">סה&quot;כ הטבות לחודש</div></div>
                  <div className="result-row"><span className="result-label">קצבת ילדים (ביטוח לאומי)</span><span className="result-value" id="cb-allowance">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">זיכוי מס חודשי</span><span className="result-value" id="cb-tax-credit">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">סה&quot;כ הטבות שנתיות</span><span className="result-value" id="cb-annual">0 ₪</span></div>
                  <p className="calc-note">* מבוסס על נתוני 2025.</p>
                  <div className="calc-insight" id="cb-insight" /><div className="calc-cta" id="cb-cta"><p>רוצה לוודא שאתה מממש את כל הזכאויות שלך?</p><a href="#contact-cta" className="btn btn-primary">בדיקת זכאות ללא עלות ←</a></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category 1 — השקעות */}
          <div className={`calc-cat-panel${activeCalcCat === 1 ? ' active' : ''}`}>
            <div className="calc-sub-tabs">
              {['ריבית דריבית', 'קרן השתלמות'].map((label, i) => (
                <button key={i} className={`calc-sub-tab${activeSubTabs[1] === i ? ' active' : ''}`} onClick={() => switchSubTab(1, i)}>{label}</button>
              ))}
            </div>
            <div className={`calc-panel${activeSubTabs[1] === 0 ? ' active' : ''}`}>
              <p className="calc-description">ראה איך כסף צומח עם הזמן — כוח הריבית דריבית בפעולה</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>מחשבון ריבית דריבית</h3>
                  <div className="form-group"><label>סכום פתיחה (₪)</label><input type="number" id="ci-initial" defaultValue="50000" onChange={doCalcCompound} /></div>
                  <div className="form-group"><label>הפקדה חודשית (₪)</label><input type="number" id="ci-monthly" defaultValue="1000" onChange={doCalcCompound} /></div>
                  <div className="form-group"><label>תשואה שנתית ממוצעת</label><select id="ci-rate" onChange={doCalcCompound}><option value="3">3% — סולידי</option><option value="5">5% — ממוצע שוק</option><option value="7">7% — אופטימי</option><option value="10">10% — אגרסיבי</option></select></div>
                  <div className="form-group"><label>מספר שנים</label><select id="ci-years" onChange={doCalcCompound}><option value="5">5 שנים</option><option value="10">10 שנים</option><option value="15">15 שנים</option><option value="20">20 שנים</option><option value="30">30 שנים</option></select></div>
                  <div className="calc-disclaimer">📊 מחשבון להמחשה בלבד.</div>
                </div>
                <div className="calc-result">
                  <h3>תחזית חיסכון</h3>
                  <div className="calc-bar-chart" id="ci-bar-chart" />
                  <div className="calc-legend"><div className="calc-legend-item"><span className="calc-legend-dot" style={{ background: 'var(--gold)' }} /> הפקדות</div><div className="calc-legend-item"><span className="calc-legend-dot" style={{ background: 'rgba(201,168,76,.4)' }} /> ריבית</div></div>
                  <div className="result-main"><div className="result-main-num" id="ci-total">0 ₪</div><div className="result-main-label">שווי הקרן בסוף התקופה</div></div>
                  <div className="result-row"><span className="result-label">סכום שהופקד</span><span className="result-value" id="ci-invested">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">ריבית שנצברה</span><span className="result-value" id="ci-interest">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">מכפיל הכסף</span><span className="result-value" id="ci-multiplier">0×</span></div>
                  <div className="calc-insight" id="ci-insight" /><div className="calc-cta" id="ci-cta"><p>רוצה לבנות תכנית חיסכון שמתאימה לך?</p><a href="#contact-cta" className="btn btn-primary">ייעוץ פיננסי ללא עלות ←</a></div>
                </div>
              </div>
            </div>
            <div className={`calc-panel${activeSubTabs[1] === 1 ? ' active' : ''}`}>
              <p className="calc-description">קרן השתלמות — חיסכון עם הטבת מס שלא כדאי לפספס, נזיל לאחר 6 שנים</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>מחשבון קרן השתלמות</h3>
                  <div className="form-group"><label>שכר חודשי ברוטו (₪)</label><input type="number" id="ef-salary" defaultValue="15000" onChange={doCalcEducationFund} /></div>
                  <div className="form-group"><label>הפקדת מעסיק (%)</label><select id="ef-employer" onChange={doCalcEducationFund}><option value="7.5">7.5%</option><option value="6">6%</option><option value="5">5%</option></select></div>
                  <div className="form-group"><label>הפקדת עובד (%)</label><select id="ef-employee" onChange={doCalcEducationFund}><option value="2.5">2.5%</option><option value="3">3%</option></select></div>
                  <div className="form-group"><label>שנים עד משיכה</label><select id="ef-years" onChange={doCalcEducationFund}><option value="6">6 שנים</option><option value="10">10 שנים</option><option value="15">15 שנים</option><option value="20">20 שנים</option></select></div>
                  <div className="calc-disclaimer">💡 הקרן הופכת נזילה לאחר 6 שנים.</div>
                </div>
                <div className="calc-result">
                  <h3>תחזית קרן השתלמות</h3>
                  <div className="result-main"><div className="result-main-num" id="ef-total">0 ₪</div><div className="result-main-label">ערך הקרן המשוער</div></div>
                  <div className="result-row"><span className="result-label">הפקדת מעסיק לחודש</span><span className="result-value" id="ef-employer-monthly">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">הפקדת עובד לחודש</span><span className="result-value" id="ef-employee-monthly">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">הטבת מס שנתית</span><span className="result-value" id="ef-tax-benefit">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">עלות נטו לעובד לחודש</span><span className="result-value" id="ef-net-cost">0 ₪</span></div>
                  <div className="calc-insight" id="ef-insight" /><div className="calc-cta" id="ef-cta"><p>רוצה לוודא שהקרן שלך מותאמת לצרכיך?</p><a href="#contact-cta" className="btn btn-primary">בדיקת קרן השתלמות ←</a></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category 2 — שכר */}
          <div className={`calc-cat-panel${activeCalcCat === 2 ? ' active' : ''}`}>
            <div className="calc-sub-tabs"><button className="calc-sub-tab active">ברוטו לנטו</button></div>
            <div className="calc-panel active">
              <p className="calc-description">חשב מה יישאר לך בפועל מהשכר ברוטו שלך — ניכויים מפורטים לפי הנתונים הרשמיים</p>
              <div className="calc-layout">
                <div className="calc-form">
                  <h3>מחשבון שכר נטו לשכיר</h3>
                  <div className="form-group"><label>שכר ברוטו חודשי (₪)</label><input type="number" id="ns-gross" defaultValue="12000" onChange={doCalcNetSalary} /></div>
                  <div className="form-group"><label>מצב משפחתי</label><select id="ns-family" onChange={doCalcNetSalary}><option value="2.25">רווק/ה</option><option value="2.75">נשוי/ה</option><option value="3.25">הורה לילד קטן</option></select></div>
                  <div className="form-group"><label>קרן פנסיה (% מהשכר)</label><select id="ns-pension" onChange={doCalcNetSalary}><option value="0.06">6%</option><option value="0.065">6.5%</option><option value="0.07">7%</option></select></div>
                  <div className="calc-disclaimer">📊 המחשבון מתאים לשכירים.</div>
                </div>
                <div className="calc-result">
                  <h3>פירוט שכר חודשי</h3>
                  <div className="calc-donut-wrap"><div className="calc-donut"><svg viewBox="0 0 180 180"><circle className="donut-bg" /><circle className="donut-fill" id="ns-donut-ded" /></svg><div className="calc-donut-center"><div className="calc-donut-pct" id="ns-donut-pct">0%</div><div className="calc-donut-label">ניכוי כולל</div></div></div></div>
                  <div className="result-main"><div className="result-main-num" id="ns-net">0 ₪</div><div className="result-main-label">שכר נטו לתשלום</div></div>
                  <div className="result-row"><span className="result-label">שכר ברוטו</span><span className="result-value" id="ns-gross-show">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">מס הכנסה חודשי</span><span className="result-value" id="ns-tax">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">ביטוח לאומי</span><span className="result-value" id="ns-bl">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">דמי בריאות</span><span className="result-value" id="ns-health">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">קרן פנסיה (עובד)</span><span className="result-value" id="ns-pension-show">0 ₪</span></div>
                  <div className="result-row"><span className="result-label">שיעור ניכוי כולל</span><span className="result-value" id="ns-rate">0%</span></div>
                  <div className="calc-insight" id="ns-insight" /><div className="calc-cta" id="ns-cta"><p>ייתכן שמגיע לך יותר — בדיקת נקודות זיכוי וזכאויות</p><a href="#contact-cta" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact-cta" style={{ background: 'var(--light)', padding: '80px 0' }}>
        <div className="container">
          <div className="services-cta-block">
            <h3>רוצה תוצאה מדויקת?</h3>
            <p>המחשבונים נותנים הערכה ראשונית — בדיקה מקצועית תחשוף את מה שמגיע לך באמת</p>
            <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="btn btn-primary">📞 דברו איתי בוואטסאפ</a>
          </div>
        </div>
      </section>
    </>
  )
}
