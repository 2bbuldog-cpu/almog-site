export type LeadStatus =
  | 'questionnaire_done'
  | 'new'
  | 'contacted'
  | 'waiting_docs'
  | 'under_review'
  | 'submitted'
  | 'completed'
  | 'lost'

export interface Lead {
  id: string
  name: string                           // DB col: name
  phone: string
  email?: string
  city?: string
  source: string
  status: LeadStatus
  score: number                          // DB col: score (0–10)
  score_label?: 'hot' | 'warm' | 'cold' // DB col: score_label
  created_at: string
  updated_at: string
}

export interface QuestionnaireResponse {
  id: string
  lead_id: string
  years_to_check: number[]
  employment_type: 'employee' | 'self_employed' | 'both' | 'unemployed'
  changed_employer: boolean
  num_employers?: number
  num_children: number
  maternity_leave: boolean
  academic_degree: boolean
  degree_year?: number
  donations: boolean
  donation_amount?: string
  city?: string
  special_points: string[]
  income_range: 'under_60k' | '60k_120k' | '120k_200k' | 'over_200k' | ''
  periphery_resident?: boolean
  created_at: string
}

export interface LeadNote {
  id: string
  lead_id: string
  content: string
  created_at: string
  created_by?: string
  author?: string
}

export interface Task {
  id: string
  lead_id?: string
  title: string
  due_date: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export interface DocumentItem {
  id: string
  lead_id: string
  doc_name: string
  required: boolean
  received: boolean
  notes?: string
}

export type IncomeRange = 'under_60k' | '60k_120k' | '120k_200k' | 'over_200k'
export type EmploymentType = 'employee' | 'self_employed' | 'both' | 'unemployed'
export type TaskPriority = 'low' | 'medium' | 'high'

export const STATUS_LABELS: Record<LeadStatus, string> = {
  questionnaire_done: 'שאלון הושלם',
  new: 'ליד חדש',
  contacted: 'בוצע קשר',
  waiting_docs: 'ממתין למסמכים',
  under_review: 'בבדיקה',
  submitted: 'הוגש',
  completed: 'הושלם',
  lost: 'נסגר',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  questionnaire_done: '#0369a1',
  new: '#B7860A',
  contacted: '#1D4ED8',
  waiting_docs: '#C2410C',
  under_review: '#6D28D9',
  submitted: '#0F766E',
  completed: '#15803D',
  lost: '#374151',
}

export const STATUS_BG: Record<LeadStatus, string> = {
  questionnaire_done: 'rgba(3,105,161,0.08)',
  new: 'rgba(201,168,76,0.1)',
  contacted: 'rgba(59,130,246,0.1)',
  waiting_docs: 'rgba(249,115,22,0.1)',
  under_review: 'rgba(139,92,246,0.1)',
  submitted: 'rgba(20,184,166,0.1)',
  completed: 'rgba(34,197,94,0.1)',
  lost: 'rgba(107,114,128,0.1)',
}

export const INCOME_RANGE_LABELS: Record<IncomeRange, string> = {
  under_60k: 'עד ₪60,000',
  '60k_120k': '₪60,000–₪120,000',
  '120k_200k': '₪120,000–₪200,000',
  over_200k: 'מעל ₪200,000',
}

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  employee: 'שכיר',
  self_employed: 'עצמאי',
  both: 'שכיר + עצמאי',
  unemployed: 'לא עובד',
}

export const DEFAULT_DOCS = [
  'תלוש שכר אחרון',
  'טופס 106 ממעסיק',
  'תעודת זהות',
  'ספח תעודת זהות',
  'מספר חשבון בנק (צילום צ\'ק / אישור בנק)',
  'אישור על תרומות (אם רלוונטי)',
  'אישור לימודים/תואר (אם רלוונטי)',
  'אישור על חופשת לידה (אם רלוונטי)',
]
