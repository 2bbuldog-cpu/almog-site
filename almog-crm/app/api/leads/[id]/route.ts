import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function authCheck(req: NextRequest) {
  return req.headers.get('x-crm-password') === process.env.CRM_PASSWORD
}

// GET /api/leads/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { id } = params

  const [leadRes, qRes, notesRes, tasksRes, docsRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('questionnaire_responses').select('*').eq('lead_id', id).maybeSingle(),
    supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('lead_id', id).order('due_date', { ascending: true }),
    supabase.from('documents').select('*').eq('lead_id', id).order('name'),
  ])

  if (leadRes.error || !leadRes.data) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      ...leadRes.data,
      questionnaire: qRes.data || null,
      notes_list: notesRes.data || [],
      tasks_list: tasksRes.data || [],
      documents: docsRes.data || [],
    },
  })
}

const ALLOWED_LEAD_FIELDS = new Set([
  'status', 'score', 'score_label', 'source', 'name', 'phone', 'email',
  'id_number', 'city', 'notes', 'partner', 'next_followup_date',
  'bank_update_status', 'actual_refund_amount',
  'estimated_refund_min', 'estimated_refund_max',
])

// PATCH /api/leads/[id] — update lead fields
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Whitelist allowed fields
  const update: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED_LEAD_FIELDS.has(key)) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'אין שדות תקינים לעדכון' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('leads')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/leads/[id]/notes — add note (handled via sub-route naming trick)
// Actually handled in /api/leads/[id]/notes/route.ts — see below
