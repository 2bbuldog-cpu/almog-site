'use client'

import { useState, useEffect, useRef } from 'react'

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

// ─── MAIN COMPONENT ───
export default function HomePage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [testiCurrent, setTestiCurrent] = useState(0)
  const [activeCalcCat, setActiveCalcCat] = useState(0)
  const [activeSubTabs, setActiveSubTabs] = useState([0, 0, 0])
  const [articleFilter, setArticleFilter] = useState('all')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const [loaderHidden, setLoaderHidden] = useState(false)
  const testiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const TESTI_COUNT = 12

  const goTesti = (i: number) => setTestiCurrent(((i % TESTI_COUNT) + TESTI_COUNT) % TESTI_COUNT)
  const resetAutoAdvance = (i: number) => {
    if (testiIntervalRef.current) clearInterval(testiIntervalRef.current)
    goTesti(i)
    testiIntervalRef.current = setInterval(() => setTestiCurrent(c => (c + 1) % TESTI_COUNT), 5000)
  }

  useEffect(() => {
    const t = setTimeout(() => setLoaderHidden(true), 1000)
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
      setShowBackTop(scrollTop > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el))
    let countersStarted = false
    const heroCounterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true
        document.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target || '0')
          const suffix = el.dataset.suffix || ''
          let current = 0; const step = target / 60
          const timer = setInterval(() => {
            current = Math.min(current + step, target)
            el.textContent = suffix ? (current >= target ? target + suffix : Math.floor(current) + suffix) : '+' + Math.floor(current)
            if (current >= target) clearInterval(timer)
          }, 25)
        })
      }
    }, { threshold: 0.5 })
    const heroStats = document.querySelector('.hero-stats')
    if (heroStats) heroCounterObserver.observe(heroStats)
    const container = document.getElementById('processParticles')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (container && !prefersReducedMotion) {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div'); p.className = 'particle'
        p.style.left = Math.random() * 100 + '%'
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px'
        p.style.animationDuration = (8 + Math.random() * 12) + 's'
        p.style.animationDelay = Math.random() * 10 + 's'
        container.appendChild(p)
      }
    }
    if (!prefersReducedMotion) {
      const handleParallax = () => {
        const photo = document.querySelector<HTMLElement>('.hero-photo')
        if (photo) photo.style.transform = `translateY(${window.scrollY * 0.18}px)`
      }
      window.addEventListener('scroll', handleParallax, { passive: true })
    }
    if (!prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>('.calc-result').forEach(card => {
        card.addEventListener('mousemove', (e: MouseEvent) => {
          const r = card.getBoundingClientRect()
          card.style.transform = `perspective(600px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 4}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * 4}deg)`
        })
        card.addEventListener('mouseleave', () => { card.style.transform = '' })
      })
    }
    setTimeout(() => {
      doCalcIncomeTax(); doCalcTaxRefund(); doCalcChildBenefits()
      doCalcCompound(); doCalcEducationFund(); doCalcNetSalary()
    }, 100)
    testiIntervalRef.current = setInterval(() => setTestiCurrent(c => (c + 1) % TESTI_COUNT), 5000)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', handleScroll)
      revealObserver.disconnect(); heroCounterObserver.disconnect()
      if (testiIntervalRef.current) clearInterval(testiIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => [doCalcIncomeTax, doCalcCompound, doCalcNetSalary][activeCalcCat]?.(), 50)
  }, [activeCalcCat])

  const switchSubTab = (catIdx: number, subIdx: number) => {
    setActiveSubTabs(prev => { const n = [...prev]; n[catIdx] = subIdx; return n })
  }
  useEffect(() => {
    const fns = [[doCalcIncomeTax, doCalcTaxRefund, doCalcChildBenefits], [doCalcCompound, doCalcEducationFund], [doCalcNetSalary]]
    setTimeout(() => fns[activeCalcCat]?.[activeSubTabs[activeCalcCat]]?.(), 50)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTabs])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setFormSending(true)
    setTimeout(() => { setFormSending(false); setFormSubmitted(true) }, 800)
  }

  const audienceCards = [
    {
      title: 'עצמאים ושותפויות',
      tagline: 'פתחתם עסק? מגיע לכם להתחיל נכון ולשלם כמה שפחות מס — בלי לבזבז שעות על ניירת.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><rect x="2" y="7" width="20" height="14" rx="2.5" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>,
      services: [{ t: 'עוסק פטור / מורשה', d: 'פותחים עסק? נבחר יחד את הסטטוס הנכון ונוודא שמתחילים על הצד הנכון' }, { t: 'ייעוץ עסקי', d: 'שאלות על עסק? מהרחבה ועד כניסה לשותפות — תקבלו תשובה ישרה' }, { t: 'הצהרת הון', d: 'מדווחים על הון ורכוש בדיוק כנדרש — בלי להפיל עניינים בפיקוח' }, { t: 'חשבות שכר', d: 'מחשבים ומדווחים שכר בזמן, בלי טעויות שמביאות קנסות' }],
    },
    {
      title: 'חברות ועמותות',
      tagline: 'חשבונאות שרואה את התמונה הגדולה — לא רק את המספרים בטבלה.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 21V9M16 21V9" /></svg>,
      services: [{ t: 'הנהלת חשבונות', d: 'יודעים בכל רגע כמה נכנס, כמה יצא — ומה הרווח האמיתי' }, { t: 'דוחות מס וביקורת', d: 'גישה מסודרת לדוחות ולביקורת — מיסוי חוקי ומינימלי' }, { t: 'ייעוץ פיננסי', d: 'לא רק מחשבים — גם חושבים קדימה על הרווחיות שלכם' }, { t: 'חשבות שכר', d: 'שכר לכל העובדים, בזמן, מסודר — בלי כאבי ראש חודשיים' }],
    },
    {
      title: 'פורשים',
      tagline: 'יוצאים לפרישה? השלב הזה שווה הרבה מאוד כסף — בתנאי שמתכננים אותו נכון.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
      services: [{ t: 'קיבוע זכויות', d: 'כל השנים שעבדתם? מוציאים מהן את המקסימום שמגיע לכם' }, { t: 'תכנון פרישה', d: 'בונים תוכנית שמתחשבת בפנסיה, מיסים וכל ההכנסות ביחד' }, { t: 'החזרי מס', d: 'כן, גם פורשים יכולים לקבל החזרי מס — כדאי לבדוק' }, { t: 'משיכת פיצויים', d: 'איך ומתי משיכים פיצויים — ההחלטה הזו שווה הרבה כסף' }],
    },
    {
      title: 'שכירים',
      tagline: 'רוב השכירים לא יודעים שמגיע להם כסף בחזרה. כדאי לבדוק.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
      services: [{ t: 'תיאומי מס', d: 'מונעים ניכוי מס מיותר מהמשכורת שלכם — כבר בחודש הבא' }, { t: 'החזרי מס', d: 'בודקים אם מגיע לכם כסף בחזרה — ממוצע 8,000–25,000 ₪' }, { t: 'משיכת פיצויים', d: 'יצאתם ממקום עבודה? נוודא שמושכים פיצויים הכי חכם שאפשר' }, { t: 'דוח שנתי לשכירים', d: 'מגישים את הדוח בשבילכם — בלי שתצטרכו להבין בזה כלום' }, { t: 'הכנסות משכר דירה', d: 'מחשבים איזה מסלול מס על שכירות עדיף לכם' }, { t: 'רווחי הון', d: 'מכרתם מניות או דירה? מחשבים ומקטינים את חבות המס' }],
    },
  ]

  const faqItems = [
    { q: 'כמה עולה ייעוץ ראשוני?', a: 'שיחת ייכרות ראשונה — חינם לחלוטין, ללא שום התחייבות. אחרי שנבין מה אתם צריכים, אני אגיד לכם בדיוק כמה זה עולה לפני שמתחילים. אין הפתעות.' },
    { q: 'האם אני צריך להגיע פיזית למשרד?', a: 'לא. הכל דיגיטלי — שולחים מסמכים בוואטסאפ או מייל, חותמים דיגיטלית, ומסיימים. יש לקוחות שמעולם לא ראיתי אותם פנים אל פנים ואנחנו עובדים ביחד כבר שנים.' },
    { q: 'כמה זמן לוקח לקבל החזר מס?', a: 'אחרי הגשת הבקשה — בדרך כלל 3–6 חודשים. אני מגישה, עוקבת ומעדכנת אתכם כשיש חדשות. שימו לב: אפשר לתבוע עד 6 שנים אחורה, אז לא מאוחר מדי.' },
    { q: 'מה ההבדל בין עוסק פטור לעוסק מורשה?', a: 'קצר: פטור — עד כ-120K בשנה, לא גובים מע"מ, פחות ניהול. מורשה — אין תקרה, גובים מע"מ אבל גם מקזזים על הוצאות. התשובה האמיתית תלויה בסוג הלקוחות שלכם ובצפי ההכנסות — נבדוק ביחד.' },
    { q: 'האם גם שכירים יכולים לקבל החזר מס?', a: 'כן — ורבים לא יודעים. החלפת עבודה, חל"ד, סיום תואר, ילדים, נכות, תרומות — כל אחד מהאלה יכול לייצר החזר. הממוצע שאני רואה הוא בין 8,000 ל-25,000 ₪. שווה לבדוק.' },
    { q: 'מה כולל שירות הנהלת חשבונות חודשי?', a: 'ספרי חשבונות, דיווחי מע"מ, דיווחי ניכויים, דוח שנתי, ייעוץ שוטף וטיפול מול רשות המסים — הכל. ואני זמינה לשאלות גם בין לבין, לא רק בסוף השנה.' },
  ]

  const testimonials = [
    { avatar: 'ע', name: 'עמית מויאל', text: 'רואת חשבון מספר אחת, עונה לי כל פעם שאני צריך ותמיד בקשר בשוטף, מקצועית ויודעת להגדיל ראש בכל מה שקשור לכסף. מעוסק פטור ועד חברה בע"מ, תודה אלמוג.' },
    { avatar: 'ס', name: 'סופיה אטליס', text: 'חיפשתי רואת חשבון שתהיה דיגיטלית ומתקדמת, אבל לא פחות חשוב - שתדע להסביר לי הכל בסבלנות ובגובה העיניים. אלמוג היא בול הכתובת! היא מקצועית בטירוף, הופכת את כל הביורוקרטיה לפשוטה ונעימה, ותמיד זמינה לכל שאלה. ממליצה עליה מכל הלב.' },
    { avatar: 'נ', name: 'נדב ניר', text: 'אלמוג המהממת! הכי מקצועית שיש זמינה באמת כל הזמן, עוזרת בהכל עם חיוך והמון סבלנות! בתור לקוח שלה אני ישן בראש שקט שהכל מטוקטק ומסודר. באמת אחת ויחידה.' },
    { avatar: 'נ', name: 'נתנאל דביקר ואקנין', text: 'הגעתי לאלמוג דרך המלצה של חבר, אלמוג עזרה לי בכל מה שהייתי צריך, טיפלה בכל המסמכים ביסודיות ובאהבה רבה. תודה לאלמוג על הסבלנות. שירות מומלץ מאוד.' },
    { avatar: 'ח', name: 'חיים יעקבזון', text: 'אין על אלמוג האלופה. סופר מקצועית הכל מתוקתק בזמן כמו שעון כולל לתכנוני מס ואכפתיות כאילו היא שותפה בעסק. תודה אלמוג.' },
    { avatar: 'ע', name: 'עודד רוזן', text: 'אין כמו אלמוג. שירות מדהים ויחס שלא רואים כל יום מקצועית בטירוף סבלנית וזמינה לכל שאלה. ממליץ מכל הלב.' },
    { avatar: 'Y', name: 'Yosef "momo" Moyal', text: 'לא האמנתי שאפשר לסדר את כל עניני הפנסיה והמיסים כל כך בקלות – עד שפגשתי את אלמוג בן-דוד מקצועית אמיתית עם לב גדול.' },
    { avatar: 'S', name: 'Shira Maor', text: 'תמיד זמינה לכל שאלה ובהמון סבלנות! מקצועית מאוד! ממליצה.' },
    { avatar: 'ר', name: 'רוני לב ארי', text: 'אלמוג מקצועית, קשובה ואכפתית, מניקה מעל ומעבר. ממליץ מאוד לעבוד איתה.' },
    { avatar: 'N', name: 'Nadav Czeiger', text: 'שירות מעולה. נתנה יחס מאוד אישי וצמצמה לי את חבות המס.' },
    { avatar: 'ס', name: 'סמדר בן דוד', text: 'ממליצה בחום. טיפלה לי בתכנון פרישה והחזרי מס. מקצועית. אדיבה. תודה אלמוג.' },
    { avatar: 'T', name: 'Tal Re', text: 'מקצועית ברמה הגבוהה ביותר. שירות מצוין זמינות לכל שאלה ופתרון לכל בעיה ממליץ!' },
  ]
  const testiSlides: typeof testimonials[] = []
  for (let i = 0; i < testimonials.length; i += 2) testiSlides.push(testimonials.slice(i, i + 2))

  const articles = [
    { filter: 'tax', cat: 'מס הכנסה', catCls: 'cat-tax', title: '5 הוצאות מוכרות שעצמאים שוכחים לנכות', desc: 'ביגוד מקצועי, ספרות, אינטרנט ביתי, טלפון נייד ואפילו קפה עם לקוח — הוצאות שרוב העצמאים לא יודעים שהם יכולים לנכות.', time: "4 דק'", year: '2026', href: '/article?slug=business-expenses', delay: '' },
    { filter: 'business', cat: 'פתיחת עסק', catCls: 'cat-business', title: "פתיחת עסק בשנת 2026 — כל הצעדים מ-א' ועד ת'", desc: 'עוסק פטור, מורשה או חברה בע"מ? ההבדלים, התקרות, שיקולי מס ועלויות. צ\'קליסט מלא.', time: "6 דק'", year: '2026', href: '/article?slug=open-business-2026', delay: 'reveal-delay-1' },
    { filter: 'pension', cat: 'פרישה', catCls: 'cat-pension', title: 'תכנון פרישה: למה כל שנה שמחכים עולה עשרות אלפים', desc: 'כוח הריבית דריבית עובד נגדכם כשאתם מחכים. מהגיל 40 אפשר כבר לתכנן — ולחסוך מאות אלפי שקלים עד הפנסיה.', time: "5 דק'", year: '2026', href: '/article?slug=retirement-planning', delay: 'reveal-delay-2' },
    { filter: 'business', cat: 'עסקים', catCls: 'cat-business', title: 'חברה בע"מ מול עצמאי — השוואה מלאה ב-2026', desc: 'מס חברות 23%, ביטוח לאומי מופחת, הגנה משפטית — אבל גם עלויות ניהול גבוהות. טבלת השוואה מלאה.', time: "5 דק'", year: '2026', href: '/article?slug=company-vs-freelancer', delay: '' },
    { filter: 'realestate', cat: 'נדל"ן', catCls: 'cat-realestate', title: 'מיסוי שכירות — 3 מסלולים, מסלול אחד מנצח', desc: '10% מס קבוע, מסלול פטור עד תקרה, או מס שולי עם הוצאות? בעלי דירות להשקעה — ככה בוחרים את המסלול הנכון.', time: "6 דק'", year: '2025', href: '/article?slug=rental-tax', delay: 'reveal-delay-1' },
    { filter: 'salary', cat: 'שכירים', catCls: 'cat-salary', title: 'נקודות זיכוי במס — מדריך לשכירים ב-2026', desc: 'תואר אקדמי, ילדים, שירות מילואים, יישוב מזכה, נכות — כל נקודת זיכוי שווה 242 ₪ פחות מס בחודש.', time: "4 דק'", year: '2026', href: '/article?slug=tax-credits-salaried', delay: 'reveal-delay-2' },
    { filter: 'tax', cat: 'מס הכנסה', catCls: 'cat-tax', title: 'מדרגות מס הכנסה 2025–2026: טבלה מעודכנת', desc: 'מ-10% עד 47% — כמה מס באמת משלמים? הטבלה המעודכנת עם כל המדרגות ונקודות זיכוי.', time: "3 דק'", year: '2026', href: '/article?slug=income-tax-brackets', delay: '' },
    { filter: 'salary', cat: 'שכירים', catCls: 'cat-salary', title: 'קרן השתלמות — למה זה אפיק החיסכון הכי משתלם?', desc: 'פטור ממס רווחי הון, נזיל אחרי 6 שנים, המעסיק מפקיד 7.5%. אין שום מכשיר חיסכון אחר בישראל עם תנאים כאלה.', time: "4 דק'", year: '2026', href: '/article?slug=study-fund', delay: 'reveal-delay-1' },
    { filter: 'pension', cat: 'פרישה', catCls: 'cat-pension', title: 'משיכת פיצויים — מס, פטור, והטעויות שעולות ביוקר', desc: 'עזבתם מקום עבודה? מגיעים לכם פיצויים — אבל הדרך שבה תמשכו אותם משפיעה דרמטית על כמה תקבלו.', time: "5 דק'", year: '2025', href: '/article?slug=severance-pay', delay: 'reveal-delay-2' },
  ]
  const visibleArticles = articleFilter === 'all' ? articles : articles.filter(a => a.filter === articleFilter)
  const filterLabels: Record<string, string> = { all: 'הכל', tax: 'מיסים', business: 'עסקים', pension: 'פרישה', salary: 'שכירים', realestate: 'נדל"ן' }

  return (
    <>
      {/* LOADING SCREEN */}
      <div className="loader-screen" style={{ opacity: loaderHidden ? 0 : 1, visibility: loaderHidden ? 'hidden' : 'visible', pointerEvents: loaderHidden ? 'none' : 'auto', transition: 'opacity .6s ease, visibility .6s ease' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo3d.png" alt="" className="loader-logo" />
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" style={{ width: scrollProgress + '%' }} />

      {/* BACK TO TOP */}
      <button className={`back-to-top${showBackTop ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="חזרה למעלה">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
      </button>

      {/* WHATSAPP FAB */}
      <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="whatsapp-fab" title="WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      {/* MOBILE CTA BAR */}
      <div className="mobile-cta-bar">
        <a href="#contact" className="btn btn-primary">📞 ייעוץ חינמי</a>
        <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>WhatsApp ↗</a>
      </div>

      {/* ══ HERO ══ */}
      <section className="hero" id="home">
        <div className="hero-photo-panel">
          <div className="hero-glow" />
          <div className="hero-portrait-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/H2_04375.jpg" className="hero-photo" alt="אלמוג בן דוד – רואה חשבון" />
          </div>
        </div>
        <div className="hero-shapes"><div className="hero-shape" /><div className="hero-shape" /><div className="hero-shape" /></div>
        <div className="container">
          <div className="hero-content-col">
            <div className="hero-badge">רואה חשבון מוסמך | באר שבע</div>
            <h1>אלמוג בן דוד</h1>
            <p className="hero-sub">ייעוץ מס, הנהלת חשבונות ותכנון פיננסי — <span className="hero-highlight">שירות דיגיטלי מלא</span> לכל רחבי הארץ</p>
            <p className="hero-body">בוגרת כלכלה וחשבונאות מבן גוריון, עם תמחות ב-EY — אחת מחברות הביג 4. עבדתי גם כעוזרת חשב במכתשים אגן לפני שפתחתי את המשרד.</p>
            <p className="hero-body">עובדת עם עצמאיים, חברות, שכירים ופורשים מכל הארץ. הכל דיגיטלי — שולחים מסמך בוואטסאפ, אני מטפלת, ואתם לא צריכים לנסוע לאף מקום.</p>
            <div className="hero-btns">
              <a href="#contact" className="btn btn-primary">קבעו שיחת ייעוץ ללא התחייבות</a>
              <a href="#services" className="hero-btn-secondary">גלו את השירותים ←</a>
            </div>
            <div className="hero-stats">
              {[{ icon: '👥', target: '200', label: 'לקוחות מרוצים' }, { icon: '🏆', target: '5', label: 'שנות ניסיון' }, { icon: '💰', target: '1', label: 'מיליון ₪ הוחזרו' }, { icon: '⭐', target: '5', suffix: '.0', label: 'דירוג Google' }].map((s, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-icon">{s.icon}</span>
                  <div className="hero-stat-num" data-target={s.target} data-suffix={s.suffix || ''}>0</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-scroll"><span>גלול למטה</span><div className="hero-scroll-dot" /></div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <div className="trust-strip reveal">
        <div className="container">
          <div className="trust-strip-inner">
            {[{ icon: '🎓', text: 'B.A כלכלה וחשבונאות', sub: 'אוניברסיטת בן גוריון' }, { icon: '🏢', text: 'התמחות EY', sub: 'Big 4 — רואי חשבון' }, { icon: '📋', text: 'רישיון רו"ח', sub: 'מוסמכת מטעם המדינה' }, { icon: '💻', text: 'שירות דיגיטלי 100%', sub: 'ללא הגעה פיזית' }, { icon: '⭐', text: '5.0 בגוגל', sub: '200+ לקוחות מרוצים' }].map((item, i) => (
              <div key={i} className="trust-strip-item">
                <span className="trust-strip-icon">{item.icon}</span>
                <div><div className="trust-strip-text">{item.text}</div><div className="trust-strip-sub">{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section className="section" id="about" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#ffffff 55%,#fdf8ed 100%)' }}>
        <div className="deco-circle" style={{ width: 300, height: 300, position: 'absolute', top: -80, left: -80 }} />
        <div className="deco-circle" style={{ width: 200, height: 200, position: 'absolute', bottom: -60, right: -60, animationDirection: 'reverse' }} />
        <div className="container">
          <div className="about-grid">
            <div className="about-image-wrap reveal-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/H2_04375.jpg" className="about-image" alt="אלמוג בן דוד – רואה חשבון מוסמך" />
              <div className="about-badge"><span className="about-badge-num">+5</span><span className="about-badge-txt">שנות ניסיון</span></div>
            </div>
            <div className="about-content reveal-right">
              <div className="gold-line" />
              <h2 className="section-title">הסיפור שלי</h2>
              <p className="about-text">אני אלמוג, רואת חשבון מבאר שבע. התחלתי את הדרך בתמחות ב-EY ואז עברתי לעבוד בחברה גדולה, אבל תמיד רציתי לעבוד ישירות עם אנשים — בלי ביורוקרטיה פנימית. ב-2021 פתחתי את המשרד, דיגיטלי לחלוטין, ומאז עובדת עם לקוחות מכל הארץ. אגיב לוואטסאפ גם בערב — זה פשוט החלק של העבודה שאני אוהבת.</p>
              <div className="about-timeline">
                {[{ year: '2018', title: 'תואר ראשון בכלכלה וחשבונאות', desc: 'אוניברסיטת בן גוריון בנגב', d: 'reveal-delay-1' }, { year: '2019', title: 'התמחות ב-EY (Ernst & Young)', desc: 'ביג 4 — ביקורת ומיסים', d: 'reveal-delay-2' }, { year: '2020', title: 'עוזרת חשב — מכתשים אגן', desc: 'ניסיון בניהול פיננסי בתאגיד בינלאומי', d: 'reveal-delay-3' }, { year: '2021', title: 'הקמת המשרד — אלמוג בן דוד רו"ח', desc: 'משרד דיגיטלי, שירות אישי, לקוחות מכל הארץ', d: 'reveal-delay-4' }].map((item, i) => (
                  <div key={i} className={`about-tl-item reveal ${item.d}`}>
                    <div className="about-tl-dot" />
                    <div className="about-tl-year">{item.year}</div>
                    <div className="about-tl-title">{item.title}</div>
                    <div className="about-tl-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="about-credentials">
                {[{ icon: '🛡️', text: 'רישיון רו"ח ממדינת ישראל', sub: 'חברה בלשכת רו"ח', d: 'reveal-delay-2' }, { icon: '🌐', text: 'שירות ארצי', sub: '100% דיגיטלי', d: 'reveal-delay-3' }, { icon: '📱', text: 'זמינות מלאה', sub: 'וואטסאפ, מייל, טלפון', d: 'reveal-delay-4' }].map((c, i) => (
                  <div key={i} className={`about-credential reveal ${c.d}`}>
                    <span className="about-credential-icon">{c.icon}</span>
                    <div><div className="about-credential-text">{c.text}</div><div className="about-credential-sub">{c.sub}</div></div>
                  </div>
                ))}
              </div>
              <div className="about-btns">
                <a href="#contact" className="btn btn-primary">בואו נדבר ←</a>
                <a href="#services" style={{ padding: '16px 36px', borderRadius: 50, fontFamily: 'Heebo,sans-serif', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', background: 'transparent', border: '1.5px solid rgba(14,30,64,.2)', color: 'var(--navy-mid)', transition: 'var(--transition)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>לשירותים שלי ↓</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="section section-light" id="services">
        <div className="container">
          <div className="audience-section-header">
            <div>
              <div className="gold-line" />
              <h2 className="section-title">לאיזה קטגוריה אתם שייכים?</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>בחרו את הקטגוריה שלכם וראו מה רלוונטי אליכם</p>
            </div>
          </div>
          <div className="audience-grid reveal">
            {audienceCards.map((card, idx) => (
              <div key={idx} className={`audience-card${expandedCard === idx ? ' expanded' : ''}`} onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}>
                <div className="audience-card-header">
                  <div className="audience-icon">{card.icon}</div>
                  <div className="audience-card-title">{card.title}</div>
                  <div className="audience-card-tagline">{card.tagline}</div>
                  <div className="audience-toggle-row">
                    <span className="audience-toggle-label">לגילוי השירותים</span>
                    <span className="audience-toggle-icon"><svg viewBox="0 0 14 14" fill="none" strokeWidth="2" strokeLinecap="round" stroke="var(--gold)"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></span>
                  </div>
                </div>
                <div className="audience-services">
                  {card.services.map((s, j) => (
                    <div key={j} className="audience-service-item">
                      <span className="audience-service-dot" />
                      <span className="audience-service-text"><strong>{s.t}</strong>{s.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta-block reveal reveal-delay-1">
            <h3>לא בטוחים מה אתם צריכים?</h3>
            <p>שאלו אותי — ייעוץ ראשוני בחינם, בלי שום התחייבות</p>
            <a href="#contact" className="btn btn-primary">לשיחת ייעוץ חינמית ←</a>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section className="section process-section" id="process">
        <div className="particles" id="processParticles" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="gold-line center" />
            <h2 className="section-title reveal">איך זה עובד?</h2>
            <p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 64px', textAlign: 'center' }}>פשוט ומהיר — כך זה עובד בפועל</p>
          </div>
          <div className="process-grid">
            {[{ icon: '📞', title: 'שיחת היכרות', desc: '10–15 דקות בטלפון — מבינים מה צריך ועונים על שאלות ראשוניות, חינם', d: 'reveal-delay-1' }, { icon: '📋', title: 'שולחים מסמכים', desc: 'שולחים לי טפסים ומסמכים רלוונטיים בוואטסאפ — בלי להגיע לאף מקום', d: 'reveal-delay-2' }, { icon: '⚡', title: 'אני מטפלת', desc: 'מגישה, רודפת ומתקשרת עם הרשויות — אתם לא צריכים להיות מעורבים', d: 'reveal-delay-3' }, { icon: '🎯', title: 'מקבלים תוצאה', desc: 'מקבלים את הכסף, האישור, או הדוח — ויכולים לשכוח מזה', d: 'reveal-delay-4' }].map((step, i) => (
              <div key={i} className={`process-step reveal ${step.d}`}>
                <div className="process-num"><span className="process-icon">{step.icon}</span></div>
                <div className="process-title">{step.title}</div>
                <div className="process-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CALCULATORS ══ */}
      <section className="section" id="calculators">
        <div className="container">
          <div className="gold-line" />
          <h2 className="section-title">מחשבונים פיננסיים</h2>
          <p className="section-sub">מחשבים, מקבלים הערכה ראשונית — בלי להצטרך לשאול אף אחד</p>
          <div className="calc-cat-tabs">
            {['🧾 מיסים והחזרים', '📈 השקעות וחיסכון', '💼 שכר והכנסה'].map((label, i) => (
              <button key={i} className={`calc-cat-tab${activeCalcCat === i ? ' active' : ''}`} onClick={() => setActiveCalcCat(i)}>{label}</button>
            ))}
          </div>

          {/* Category 0 */}
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
                  <div className="calc-insight" id="it-insight" /><div className="calc-cta" id="it-cta"><p>ייתכן שמגיע לך החזר מס — בדיקה מלאה תיקח 2 דקות</p><a href="#contact" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
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
                  <div className="calc-insight" id="tr-insight-main" /><div className="calc-cta" id="tr-cta"><p>ייתכן שמגיע לך החזר מס</p><a href="#contact" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
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
                  <div className="calc-insight" id="cb-insight" /><div className="calc-cta" id="cb-cta"><p>רוצה לוודא שאתה מממש את כל הזכאויות שלך?</p><a href="#contact" className="btn btn-primary">בדיקת זכאות ללא עלות ←</a></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category 1 */}
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
                  <div className="calc-insight" id="ci-insight" /><div className="calc-cta" id="ci-cta"><p>רוצה לבנות תכנית חיסכון שמתאימה לך?</p><a href="#contact" className="btn btn-primary">ייעוץ פיננסי ללא עלות ←</a></div>
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
                  <div className="calc-insight" id="ef-insight" /><div className="calc-cta" id="ef-cta"><p>רוצה לוודא שהקרן שלך מותאמת לצרכיך?</p><a href="#contact" className="btn btn-primary">בדיקת קרן השתלמות ←</a></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category 2 */}
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
                  <div className="calc-insight" id="ns-insight" /><div className="calc-cta" id="ns-cta"><p>ייתכן שמגיע לך יותר — בדיקת נקודות זיכוי וזכאויות</p><a href="#contact" className="btn btn-primary">רוצה בדיקה מדויקת? השאר פרטים ←</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ARTICLES ══ */}
      <section className="section section-light" id="articles">
        <div className="container">
          <div className="gold-line center" style={{ margin: '0 auto 20px' }} />
          <h2 className="section-title reveal" style={{ textAlign: 'center' }}>מאמרים ועדכונים</h2>
          <p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 32px', textAlign: 'center' }}>מדריכים קצרים בנושאים שהכי שואלים עליהם</p>
          <div className="articles-filter reveal reveal-delay-2">
            {Object.entries(filterLabels).map(([f, label]) => (
              <button key={f} className={`articles-filter-btn${articleFilter === f ? ' active' : ''}`} onClick={() => setArticleFilter(f)}>{label}</button>
            ))}
          </div>
          {(articleFilter === 'all' || articleFilter === 'tax') && (
            <div className="articles-featured reveal" data-filter="tax">
              <div className="articles-featured-img article-img--fallback" />
              <div className="articles-featured-body">
                <span className="article-cat-badge cat-tax">החזרי מס</span>
                <div className="article-meta-row"><span>📅 מרץ 2026</span><span>⏱ 7 דקות קריאה</span><span>🔥 הכי נקרא</span></div>
                <h3>המדריך המלא להחזרי מס 2026: כל מה שצריך לדעת</h3>
                <p>ניתן לתבוע החזר עד 6 שנים אחורה. החלפת מקום עבודה, חל&quot;ד, לימודים אקדמיים, תרומות — כל אלה עשויים לזכות אותך בהחזר של אלפי שקלים. הממוצע עומד על 8,000–25,000 ₪.</p>
                <a href="/article?slug=tax-refund-guide" className="article-read-btn">קרא את המדריך המלא</a>
              </div>
            </div>
          )}
          <div className="articles-grid">
            {visibleArticles.map((article, i) => (
              <div key={i} className={`article-card reveal ${article.delay}`} data-filter={article.filter}>
                <div className="article-img article-img--fallback" />
                <div className="article-body">
                  <div className="article-meta"><span className={`article-cat-badge ${article.catCls}`}>{article.cat}</span><span className="article-reading-time">⏱ {article.time}</span></div>
                  <h3>{article.title}</h3>
                  <p>{article.desc}</p>
                  <div className="article-footer"><a href={article.href} className="article-read">קרא עוד ←</a><span className="article-date">{article.year}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="articles-cta-block reveal">
            <h3>יש שאלה?</h3>
            <p>לא מצאתם את מה שחיפשתם? שלחו לי — אענה ישירות</p>
            <a href="#contact" className="btn btn-primary">שלחו שאלה ←</a>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section" id="faq">
        <div className="container">
          <div style={{ textAlign: 'center' }}><div className="gold-line center" /><h2 className="section-title reveal">שאלות נפוצות</h2><p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 56px', textAlign: 'center' }}>השאלות שמגיעות הכי הרבה</p></div>
          <div className="faq-grid">
            {faqItems.map((item, i) => (
              <div key={i} className={`faq-item reveal${i > 0 ? ` reveal-delay-${Math.min(i, 5)}` : ''}${openFaq === i ? ' open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <h3>{item.q}</h3>
                  <span className="faq-toggle"><svg viewBox="0 0 14 14" fill="none" strokeWidth="2" strokeLinecap="round" stroke={openFaq === i ? 'var(--navy)' : 'var(--gold)'}><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></span>
                </div>
                <div className="faq-answer"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section section-light" id="testimonials">
        <div className="container">
          <div className="gold-line center" />
          <h2 className="section-title" style={{ textAlign: 'center' }}>מה הלקוחות אומרים</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 24px' }}>ביקורות אמיתיות מגוגל — בלי סינון</p>
          <div className="google-rating reveal">
            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#4285F4' }}>G</span>
            <span className="google-rating-score">5.0</span>
            <span className="google-rating-stars">★★★★★</span>
            <span className="google-rating-text">דירוג מושלם בגוגל</span>
          </div>
          <div className="testimonials-wrap">
            <div className="testimonials-track">
              <div className="testimonials-inner" style={{ transform: `translateX(${testiCurrent * 100}%)` }}>
                {testiSlides.map((slide, slideIdx) => (
                  <div key={slideIdx} className="testimonial-slide">
                    <div className="testimonials-cards">
                      {slide.map((t, j) => (
                        <div key={j} className="testimonial-card">
                          <span className="testimonial-stars-top">★★★★★</span>
                          <div className="testimonial-quote">&ldquo;</div>
                          <p className="testimonial-text">{t.text}</p>
                          <div className="testimonial-footer">
                            <div className="testimonial-avatar">{t.avatar}</div>
                            <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">ביקורת Google</div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="testimonials-nav">
              {testiSlides.map((_, i) => (
                <button key={i} className={`testi-dot${testiCurrent === i ? ' active' : ''}`} onClick={() => resetAutoAdvance(i)} />
              ))}
            </div>
            <div className="testimonials-arrows">
              <button className="testi-arrow" onClick={() => resetAutoAdvance(testiCurrent + 1)}>→</button>
              <button className="testi-arrow" onClick={() => resetAutoAdvance(testiCurrent - 1)}>←</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section className="section" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="reveal">
              <div className="gold-line" /><h2 className="section-title">בואו נדבר</h2>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 36 }}>שלחו לי הודעה, ספרו לי מה המצב — ואחזור אליכם בתוך שעות. הייעוץ הראשון חינם.</p>
              <div className="contact-item"><div className="contact-icon">📍</div><div><div className="contact-label">כתובת</div><div className="contact-value">באר שבע, ישראל</div></div></div>
              <div className="contact-item"><div className="contact-icon">📞</div><div><div className="contact-label">טלפון</div><div className="contact-value"><a href="tel:+972547312262" style={{ color: 'var(--navy)' }}>054-7312262</a></div></div></div>
              <div className="contact-item"><div className="contact-icon">📧</div><div><div className="contact-label">אימייל</div><div className="contact-value"><a href="mailto:almog@abd-cpa.co.il" style={{ color: 'var(--navy)' }}>almog@abd-cpa.co.il</a></div></div></div>
              <div className="contact-item"><div className="contact-icon">🕐</div><div><div className="contact-label">שעות פעילות</div><div className="contact-value">א&apos;–ה&apos;: 9:00–18:00</div></div></div>
              <div className="contact-social">
                <a href="https://www.facebook.com/profile.php?id=61588477094876" target="_blank" rel="noopener noreferrer" className="social-icon" title="פייסבוק">f</a>
                <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">W</a>
              </div>
            </div>
            <div className="contact-form reveal reveal-delay-1">
              <div className="trust-badges">
                <div className="trust-badge">✓ בדיקה ללא התחייבות</div>
                <div className="trust-badge">⏱ מענה תוך 24 שעות</div>
                <div className="trust-badge">🔒 פרטיות מלאה</div>
              </div>
              <h3>שלחי לי הודעה</h3>
              {!formSubmitted ? (
                <form id="contactForm" onSubmit={handleFormSubmit}>
                  <div className="form-row">
                    <div className="form-group"><label>שם מלא *</label><input type="text" placeholder="ישראל ישראלי" required /></div>
                    <div className="form-group"><label>טלפון *</label><input type="tel" placeholder="054-7312262" required /></div>
                  </div>
                  <div className="form-group"><label>אימייל</label><input type="email" placeholder="email@example.com" /></div>
                  <div className="form-group"><label>נושא הפנייה</label><select><option>החזר מס</option><option>פתיחת עסק</option><option>תכנון פרישה</option><option>הנהלת חשבונות</option><option>ייעוץ כללי</option><option>אחר</option></select></div>
                  <div className="form-group"><label>הודעה</label><textarea placeholder="ספרו לי מה המצב — אחזור בהקדם..." /></div>
                  <button type="submit" className="btn btn-primary form-submit-btn" disabled={formSending}>{formSending ? '⏳ שולח...' : '📨 שליחת הודעה'}</button>
                </form>
              ) : (
                <div className="form-success" style={{ display: 'block' }}>✅ תודה! קיבלתי את ההודעה ואחזור אליכם תוך שעות.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,.8)', padding: '64px 0 0' }}>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="אלמוג בן דוד" />
              </div>
              <p className="footer-desc">רואת חשבון מוסמכת בבאר שבע. עובדת עם עצמאיים, חברות ושכירים מכל הארץ — הכל דיגיטלי.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://www.facebook.com/profile.php?id=61588477094876" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'var(--gold-light)' }}>f</a>
                <a href="#contact" className="social-icon" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'var(--gold-light)' }}>W</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>שירותים</h4>
              <ul><li><a href="/service-tax-refund">החזרי מס</a></li><li><a href="/service-business">פתיחת עסק</a></li><li><a href="/service-retirement">תכנון פרישה</a></li><li><a href="#services">הנהלת חשבונות</a></li><li><a href="#services">דוחות שנתיים</a></li></ul>
            </div>
            <div className="footer-col">
              <h4>מידע</h4>
              <ul><li><a href="#about">אודות</a></li><li><a href="#calculators">מחשבונים</a></li><li><a href="#articles">מאמרים</a></li><li><a href="#testimonials">המלצות</a></li><li><a href="#contact">צור קשר</a></li></ul>
            </div>
            <div className="footer-col">
              <h4>יצירת קשר</h4>
              <ul><li><span>באר שבע, ישראל</span></li><li><a href="mailto:almog@abd-cpa.co.il">almog@abd-cpa.co.il</a></li><li><span>א&apos;–ה&apos; 9:00–18:00</span></li></ul>
              <a href="#contact" className="btn btn-primary" style={{ marginTop: 20, padding: '10px 24px', fontSize: '.9rem' }}>ייעוץ חינמי</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 <span className="footer-gold">אלמוג בן דוד</span> – כל הזכויות שמורות</p>
            <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.3)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href="/accessibility" style={{ color: 'rgba(255,255,255,.4)' }}>הצהרת נגישות</a>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)' }}>מדיניות פרטיות</a>
              <a href="/terms" style={{ color: 'rgba(255,255,255,.4)' }}>תנאי שימוש</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
