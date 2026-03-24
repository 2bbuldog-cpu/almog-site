// ─── LEAD STATUS (full pipeline from manual CRM) ─────────────────────────────
export type LeadStatus =
  | 'new'
  | 'questionnaire_done'
  | 'docs_pending'
  | 'in_review'
  | 'ready_to_submit'
  | 'submitted'
  | 'waiting_result'
  | 'refund_received'
  | 'closed'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'ליד חדש',
  questionnaire_done: 'שאלון הושלם',
  docs_pending: 'ממתין למסמכים',
  in_review: 'בבדיקה',
  ready_to_submit: 'מוכן להגשה',
  submitted: 'הוגש',
  waiting_result: 'ממתין לתוצאה',
  refund_received: 'התקבל החזר ✓',
  closed: 'נסגר ללא טיפול',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#3B82F6',
  questionnaire_done: '#8B5CF6',
  docs_pending: '#F59E0B',
  in_review: '#06B6D4',
  ready_to_submit: '#F97316',
  submitted: '#10B981',
  waiting_result: '#6366F1',
  refund_received: '#059669',
  closed: '#6B7280',
}

// ─── SOURCE ──────────────────────────────────────────────────────────────────
export type LeadSource =
  | 'questionnaire'
  | 'whatsapp'
  | 'referral'
  | 'manual'
  | 'instagram'
  | 'facebook'
  | 'google'
  | 'other'

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  questionnaire: 'שאלון אתר',
  whatsapp: 'וואטסאפ',
  referral: 'המלצה',
  manual: 'ידנית',
  instagram: 'אינסטגרם',
  facebook: 'פייסבוק',
  google: 'גוגל',
  other: 'אחר',
}

// ─── LEAD SCORE ──────────────────────────────────────────────────────────────
export type LeadScore = 'hot' | 'warm' | 'cold'

export const LEAD_SCORE_LABELS: Record<LeadScore, string> = {
  hot: 'חם 🔥',
  warm: 'בינוני',
  cold: 'קר',
}

// ─── EMPLOYMENT ──────────────────────────────────────────────────────────────
export type EmploymentType = 'employee' | 'self_employed' | 'both' | 'unemployed'

// ─── LEAD (modernized from manual CRM) ───────────────────────────────────────
export interface Lead {
  id: string
  created_at: string
  updated_at: string

  // Contact
  name: string
  phone: string
  email?: string | null
  id_number?: string | null           // ת"ז
  city?: string | null                // עיר

  // Pipeline
  status: LeadStatus
  source: LeadSource
  score_label?: LeadScore | null      // חם / בינוני / קר
  score: number                       // 0–10 numeric

  // Financial
  estimated_refund_min?: number | null
  estimated_refund_max?: number | null
  actual_refund_amount?: number | null  // סכום החזר בפועל

  // Operational
  bank_update_status?: string | null    // עדכון חשבון בנק
  partner?: string | null              // שת"פ (who referred / partner)
  last_contact_date?: string | null
  next_followup_date?: string | null   // תאריך מעקב הבא

  notes: string
  assigned_to?: string | null
}

// ─── QUESTIONNAIRE RESPONSE (expanded) ───────────────────────────────────────
export interface QuestionnaireResponse {
  id: string
  lead_id: string
  created_at: string

  // Employment
  employment_type: EmploymentType
  years_to_check: number[]
  changed_employer: boolean
  num_employers?: number | null
  parallel_jobs: boolean              // עבד במקביל בכמה מקומות

  // Leave
  maternity_leave: boolean
  military_reserve: boolean           // מילואים
  unemployment: boolean               // אבטלה
  unpaid_leave: boolean               // חופשה ללא תשלום

  // Personal
  num_children: number
  youngest_child_age?: string | null
  academic_degree: boolean
  periphery_resident?: boolean | null

  // Financial
  donations: boolean
  donation_amount?: string | null
  self_deposits: boolean              // הפקדות עצמאיות לפנסיה / קה"ש / ביטוח חיים
  income_range: string
  previous_tax_return: boolean        // הגשת החזר בעבר

  // Docs intent
  can_upload_docs: boolean

  raw_data: Record<string, unknown>
}

// ─── LEAD NOTE ───────────────────────────────────────────────────────────────
export interface LeadNote {
  id: string
  lead_id: string
  created_at: string
  content: string
  author: string
}

// ─── TASK ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string
  lead_id: string
  created_at: string
  due_date?: string | null
  title: string
  done: boolean
}

// ─── DOCUMENT CHECKLIST ──────────────────────────────────────────────────────
export const DEFAULT_DOCUMENTS = [
  'טופס 106 (מכל מעסיק, לכל שנה)',
  'צילום תעודת זהות + ספח',
  'אישור ניהול חשבון בנק / צ׳ק מבוטל',
  'אישורי תרומות (אם רלוונטי)',
  'אישורי ביטוח חיים / פנסיה (אם רלוונטי)',
  'אישור ישוב מזכה (אם רלוונטי)',
  'אישור סיום תואר (אם רלוונטי)',
  'מסמכי אבטלה / לידה (אם רלוונטי)',
]

export const BANK_UPDATE_STATUSES = [
  'לא עודכן',
  'ממתין לקבלה',
  'התקבל',
  'שגיאה — יש לעדכן מחדש',
]

export interface DocumentItem {
  id: string
  lead_id: string
  name: string
  required: boolean
  received: boolean
  received_at?: string | null
}

// ─── COMBINED LEAD DETAIL ─────────────────────────────────────────────────────
export interface LeadDetail extends Lead {
  questionnaire?: QuestionnaireResponse | null
  notes_list?: LeadNote[]
  tasks_list?: Task[]
  documents?: DocumentItem[]
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
}
