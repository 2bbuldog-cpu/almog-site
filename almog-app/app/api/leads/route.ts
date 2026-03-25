import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// ─── Score ────────────────────────────────────────────────────────────────────
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
  if (data.special_points) score += data.special_points.length * 5
  if (data.years && data.years.length > 2) score += 10
  if (data.income_range === '60k_120k' || data.income_range === '120k_200k') score += 5
  return Math.min(score, 100)
}

// ─── GET: health check ────────────────────────────────────────────────────────
// Visit /api/leads in browser to verify env vars + DB + actual column names
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: url ? url.slice(0, 38) + '…' : '❌ MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? '✅ ' + anonKey.slice(0, 15) + '…' : '❌ MISSING',
    SUPABASE_SERVICE_KEY: serviceKey ? '✅ ' + serviceKey.slice(0, 12) + '…' : '❌ MISSING',
  }

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: 'Missing env vars — set them in Vercel dashboard', env: envStatus },
      { status: 500 }
    )
  }

  try {
    const supabase = createServiceClient()

    // Probe leads table — returns actual column names
    const { data: rows, error } = await supabase.from('leads').select('*').limit(1)

    if (error) {
      return NextResponse.json(
        { ok: false, env: envStatus, db_error: error.message, code: error.code, hint: error.hint },
        { status: 500 }
      )
    }

    const columns = rows && rows.length > 0
      ? Object.keys(rows[0])
      : '(table is empty — columns cannot be detected from data)'

    // Also probe questionnaire_responses
    const { data: qRows, error: qErr } = await supabase.from('questionnaire_responses').select('*').limit(1)
    const qColumns = qRows && qRows.length > 0 ? Object.keys(qRows[0]) : qErr?.message ?? '(empty)'

    return NextResponse.json({
      ok: true,
      env: envStatus,
      leads_columns: columns,
      questionnaire_response_columns: qColumns,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// ─── POST /api/leads ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    console.log('SERVICE KEY EXISTS:', !!process.env.SUPABASE_SERVICE_KEY)
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

    if (!full_name?.trim()) {
      return NextResponse.json({ success: false, error: 'שם מלא הוא שדה חובה' }, { status: 400 })
    }
    if (!phone?.trim()) {
      return NextResponse.json({ success: false, error: 'מספר טלפון הוא שדה חובה' }, { status: 400 })
    }

    const qualification_score = computeQualificationScore({
      changed_jobs, children, maternity_leave, academic_degree,
      donations, special_points, years, income_range,
    })

    const supabase = createServiceClient()

    // ── Insert lead ──────────────────────────────────────────────────────────
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        full_name: full_name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        source: source || 'hazarat-mas',
        status: 'new',
        qualification_score,
      })
      .select()
      .single()

    if (leadError) {
      console.error('[/api/leads] Lead insert error:', JSON.stringify(leadError))
      return NextResponse.json(
        {
          success: false,
          error: `שגיאה בשמירת הנתונים: ${leadError.message}`,
          debug: { code: leadError.code, details: leadError.details, hint: leadError.hint },
        },
        { status: 500 }
      )
    }

    console.log('[/api/leads] Lead created:', lead.id)

    // ── Insert questionnaire response ────────────────────────────────────────
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
      // Non-fatal — lead was saved, questionnaire is secondary
      console.error('[/api/leads] Questionnaire insert error:', JSON.stringify(qError))
    }

    // ── Save notes ───────────────────────────────────────────────────────────
    if (notes && typeof notes === 'string' && notes.trim()) {
      const { error: noteError } = await supabase.from('lead_notes').insert({
        lead_id: lead.id,
        content: notes.trim(),
        created_by: 'questionnaire',
      })
      if (noteError) {
        console.error('[/api/leads] Note insert error:', JSON.stringify(noteError))
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      qualification_score,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/leads] Unexpected error:', msg)
    return NextResponse.json(
      { success: false, error: `שגיאה פנימית בשרת: ${msg}` },
      { status: 500 }
    )
  }
}
