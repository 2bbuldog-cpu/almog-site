/**
 * Questionnaire Lead Scoring
 * Returns a score 0–10 and estimated refund range
 */

export interface QuestionnaireAnswers {
  employmentType: string
  yearsToCheck: number[]
  changedEmployer: boolean
  numEmployers?: number
  parallelJobs?: boolean
  maternityLeave: boolean
  militaryReserve?: boolean
  unemployment?: boolean
  unpaidLeave?: boolean
  numChildren: number
  youngestChildAge?: string
  academicDegree: boolean
  peripheryResident?: boolean | null
  donations: boolean
  donationAmount?: string
  selfDeposits?: boolean
  incomeRange: string
}

export interface ScoringResult {
  score: number           // 0–10
  level: 'low' | 'medium' | 'high'
  estimatedMin: number   // ₪
  estimatedMax: number   // ₪
  triggers: string[]     // Hebrew descriptions of qualifying factors
}

export function calculateScore(answers: QuestionnaireAnswers): ScoringResult {
  let score = 0
  const triggers: string[] = []

  // Employment type — employees are most likely to get refunds
  if (answers.employmentType === 'employee' || answers.employmentType === 'both') {
    score += 1
  }

  // Number of years to check — more years = more potential
  const numYears = answers.yearsToCheck.length
  if (numYears >= 4) { score += 2; triggers.push(`${numYears} שנות מס לבדיקה`) }
  else if (numYears >= 2) { score += 1 }

  // Changed employer — major trigger
  if (answers.changedEmployer) {
    score += 2
    const employers = answers.numEmployers || 1
    triggers.push(employers >= 2 ? `${employers} מעסיקים שונים` : 'החלפת מעסיק')
  }

  // Parallel jobs
  if (answers.parallelJobs) {
    score += 1
    triggers.push('עבודה מקבילה בכמה מקומות')
  }

  // Leave triggers
  if (answers.maternityLeave) {
    score += 2
    triggers.push('חופשת לידה')
  }
  if (answers.militaryReserve) {
    score += 1
    triggers.push('מילואים ממושכים')
  }
  if (answers.unemployment) {
    score += 1
    triggers.push('דמי אבטלה')
  }
  if (answers.unpaidLeave) {
    score += 1
    triggers.push('חופשה ללא תשלום')
  }

  // Children
  if (answers.numChildren >= 1) {
    score += Math.min(answers.numChildren, 2)
    triggers.push(`${answers.numChildren} ילדים (נקודות זיכוי)`)
  }

  // Academic degree
  if (answers.academicDegree) {
    score += 2
    triggers.push('תואר אקדמי — זיכוי מס לא נוצל')
  }

  // Periphery
  if (answers.peripheryResident === true) {
    score += 1
    triggers.push('תושב ישוב מזכה')
  }

  // Donations
  if (answers.donations) {
    score += 1
    if (answers.donationAmount && answers.donationAmount !== 'עד 500 ₪') {
      triggers.push('תרומות לעמותות מוכרות')
    }
  }

  // Income range — sweet spot is 80K–300K
  if (answers.incomeRange === '80,000 – 150,000 ₪') {
    score += 1
  } else if (answers.incomeRange === '150,000 – 300,000 ₪') {
    score += 2
    triggers.push('רמת הכנסה גבוהה — פוטנציאל החזר גבוה')
  } else if (answers.incomeRange === 'מעל 300,000 ₪') {
    score += 1
  }

  // Cap at 10
  score = Math.min(score, 10)

  // Determine level
  const level: ScoringResult['level'] =
    score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low'

  // Estimate refund range
  const basePerYear = {
    low: 1500,
    medium: 4000,
    high: 8000,
  }[level]

  const yearsMultiplier = Math.max(numYears, 1)
  const estimatedMin = Math.round(basePerYear * 0.6 * yearsMultiplier / 500) * 500
  const estimatedMax = Math.round(basePerYear * 1.4 * yearsMultiplier / 500) * 500

  return { score, level, estimatedMin, estimatedMax, triggers }
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('he-IL')} ₪`
}
