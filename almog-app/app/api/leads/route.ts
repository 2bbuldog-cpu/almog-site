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
  console.log('[POST /api/leads] ── route hit ──')
  console.log('[POST /api/leads] SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY)

  try {
    const body = await request.json()
    console.log('[POST /api/leads] body:', JSON.stringify(body))

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

    const rawScore = computeQualificationScore({
      changed_jobs, children, maternity_leave, academic_degree,
      donations, special_points, years, income_range,
    })
    const score = Math.round(rawScore / 10)
    const score_label = score >= 7 ? 'hot' : score >= 4 ? 'warm' : 'cold'

    console.log('[POST /api/leads] creating service client…')
    const supabase = createServiceClient()

    // ── Insert lead — column names match actual DB schema ────────────────────
    const leadRow = {
      name: full_name.trim(),          // DB col: name
      phone: phone.trim(),
      email: email?.trim() || null,
      city: city?.trim() || null,
      source: source || 'hazarat-mas',
      status: 'questionnaire_done',
      score,                           // DB col: score
      score_label,                     // DB col: score_label
    }
    console.log('[POST /api/leads] inserting lead row:', JSON.stringify(leadRow))

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadRow)
      .select()
      .single()

    if (leadError) {
      console.error('[POST /api/leads] lead insert FAILED:', JSON.stringify(leadError))
      return NextResponse.json(
        {
          success: false,
          error: `שגיאה בשמירת הנתונים: ${leadError.message}`,
          debug: { code: leadError.code, details: leadError.details, hint: leadError.hint },
        },
        { status: 500 }
      )
    }
    console.log('[POST /api/leads] lead created, id:', lead.id)

    // ── Insert questionnaire response — column names match actual DB schema ──
    const qRow = {
      lead_id: lead.id,
      years_to_check: years || [],          // DB col: years_to_check
      employment_type: employment_type || null,
      changed_employer: changed_jobs || false,         // DB col: changed_employer
      num_employers: changed_jobs ? (changed_jobs_count || null) : null, // DB col: num_employers
      num_children: children ? (children_count || 0) : 0,  // DB col: num_children
      maternity_leave: maternity_leave || false,
      academic_degree: academic_degree || false,
      donations: donations || false,
      donation_amount: donations && donations_amount ? String(donations_amount) : null, // DB col: donation_amount
      income_range: income_range || '',
      periphery_resident: special_points?.includes('periphery') ?? null,
      raw_data: body,
    }
    console.log('[POST /api/leads] inserting questionnaire row…')

    const { error: qError } = await supabase
      .from('questionnaire_responses')
      .insert(qRow)

    if (qError) {
      console.error('[POST /api/leads] questionnaire insert FAILED (non-fatal):', JSON.stringify(qError))
    } else {
      console.log('[POST /api/leads] questionnaire row saved')
    }

    // ── Save notes ───────────────────────────────────────────────────────────
    if (notes && typeof notes === 'string' && notes.trim()) {
      const { error: noteError } = await supabase.from('lead_notes').insert({
        lead_id: lead.id,
        content: notes.trim(),
        author: 'questionnaire',    // DB col: author
      })
      if (noteError) {
        console.error('[POST /api/leads] note insert FAILED (non-fatal):', JSON.stringify(noteError))
      }
    }

    console.log('[POST /api/leads] ── success ──')
    return NextResponse.json({ success: true, lead_id: lead.id, score })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/leads] UNEXPECTED ERROR:', msg)
    return NextResponse.json(
      { success: false, error: `שגיאה פנימית בשרת: ${msg}` },
      { status: 500 }
    )
  }
}
