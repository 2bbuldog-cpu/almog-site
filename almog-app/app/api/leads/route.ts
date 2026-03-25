import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function computeQualificationScore(data: {
  changed_jobs?: boolean | null
  children?: boolean | null
  maternity_leave?: boolean | null
  academic_degree?: boolean | null
  donations?: boolean | null
  special_points?: string[]
  years?: number[]
  income_range?: string
}): number {
  let score = 0
  if (data.changed_jobs) score += 20
  if (data.children) score += 15
  if (data.maternity_leave) score += 20
  if (data.academic_degree) score += 15
  if (data.donations) score += 10
  if (data.special_points?.includes('periphery')) score += 10
  if (data.special_points) {
    score += data.special_points.length * 5
  }
  if (data.years && data.years.length > 2) score += 10
  if (data.income_range === '60k_120k' || data.income_range === '120k_200k') score += 5
  return Math.min(score, 100)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[/api/leads] Incoming payload:', JSON.stringify(body))

    const {
      full_name,
      phone,
      email,
      source,
      years,
      employment_type,
      changed_jobs,
      changed_jobs_count,
      children,
      children_count,
      children_ages,
      maternity_leave,
      academic_degree,
      degree_year,
      donations,
      donations_amount,
      city,
      special_points,
      income_range,
      notes,
    } = body

    // Validate required fields
    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'שם מלא הוא שדה חובה' },
        { status: 400 }
      )
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'מספר טלפון הוא שדה חובה' },
        { status: 400 }
      )
    }

    // Score on 0–100 scale, then convert to 0–10 for DB
    const rawScore = computeQualificationScore({
      changed_jobs,
      children,
      maternity_leave,
      academic_degree,
      donations,
      special_points,
      years,
      income_range,
    })
    const score = Math.round(rawScore / 10)
    const score_label = score >= 7 ? 'hot' : score >= 4 ? 'warm' : 'cold'

    // Use service client to bypass RLS
    const supabase = createServiceClient()

    // Insert lead — column names match actual Supabase schema
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: full_name.trim(),          // DB column is "name", not "full_name"
        phone: phone.trim(),
        email: email?.trim() || null,
        city: city?.trim() || null,
        source: source || 'hazarat-mas',
        status: 'questionnaire_done',
        score,
        score_label,
      })
      .select()
      .single()

    if (leadError) {
      console.error('[/api/leads] Lead insert error:', leadError)
      return NextResponse.json(
        { success: false, error: `שגיאה בשמירת הנתונים: ${leadError.message}` },
        { status: 500 }
      )
    }

    console.log('[/api/leads] Lead created:', lead.id)

    // Insert questionnaire response — column names match actual schema
    const { error: qError } = await supabase
      .from('questionnaire_responses')
      .insert({
        lead_id: lead.id,
        years_to_check: years || [],           // was: years
        employment_type: employment_type || null,
        changed_employer: changed_jobs || false,     // was: changed_jobs
        num_employers: changed_jobs ? (changed_jobs_count || null) : null, // was: changed_jobs_count
        num_children: children ? (children_count || 0) : 0,  // was: children_count
        maternity_leave: maternity_leave || false,
        academic_degree: academic_degree || false,
        donations: donations || false,
        donation_amount: donations && donations_amount ? String(donations_amount) : null, // was: donations_amount
        special_points: special_points || [],
        income_range: income_range || '',
        periphery_resident: special_points?.includes('periphery') ?? null,
        raw_data: body,
      })

    if (qError) {
      console.error('[/api/leads] Questionnaire insert error:', qError)
      // Non-fatal — lead was already created
    }

    // Save notes if provided
    if (notes && typeof notes === 'string' && notes.trim()) {
      const { error: noteError } = await supabase.from('lead_notes').insert({
        lead_id: lead.id,
        content: notes.trim(),
        author: 'questionnaire',    // DB column is "author", not "created_by"
      })
      if (noteError) {
        console.error('[/api/leads] Note insert error:', noteError)
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      score,
    })
  } catch (error) {
    console.error('[/api/leads] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: `שגיאה פנימית בשרת: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
