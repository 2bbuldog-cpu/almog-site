import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function computeQualificationScore(data: {
  changed_jobs?: boolean
  children?: boolean
  maternity_leave?: boolean
  academic_degree?: boolean
  donations?: boolean
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

    const {
      full_name,
      phone,
      email,
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

    const qualification_score = computeQualificationScore({
      changed_jobs,
      children,
      maternity_leave,
      academic_degree,
      donations,
      special_points,
      years,
      income_range,
    })

    // Insert lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        full_name: full_name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        source: 'website_questionnaire',
        status: 'new',
        qualification_score,
      })
      .select()
      .single()

    if (leadError) {
      console.error('Lead insert error:', leadError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשמירת הנתונים' },
        { status: 500 }
      )
    }

    // Insert questionnaire response
    const { error: qError } = await supabase
      .from('questionnaire_responses')
      .insert({
        lead_id: lead.id,
        years: years || [],
        employment_type: employment_type || null,
        changed_jobs: changed_jobs || false,
        changed_jobs_count: changed_jobs ? (changed_jobs_count || 0) : null,
        children_count: children ? (children_count || 0) : 0,
        maternity_leave: maternity_leave || false,
        academic_degree: academic_degree || false,
        degree_year: academic_degree && degree_year ? parseInt(degree_year) : null,
        donations: donations || false,
        donations_amount: donations && donations_amount ? parseInt(donations_amount) : null,
        city: city?.trim() || null,
        special_points: special_points || [],
        income_range: income_range || null,
      })

    if (qError) {
      console.error('Questionnaire insert error:', qError)
      // Don't fail the whole request if questionnaire save fails
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      qualification_score,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה פנימית בשרת' },
      { status: 500 }
    )
  }
}
