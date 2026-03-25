import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { DEFAULT_DOCS } from '@/lib/types'

// GET /api/crm/leads/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const [leadRes, qRes, notesRes, tasksRes, docsRes] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('questionnaire_responses').select('*').eq('lead_id', id).maybeSingle(),
      supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('lead_id', id).order('due_date', { ascending: true }),
      supabase.from('document_checklist').select('*').eq('lead_id', id).order('required', { ascending: false }),
    ])

    if (leadRes.error || !leadRes.data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    let docs = docsRes.data || []
    if (docs.length === 0) {
      const defaultDocs = DEFAULT_DOCS.map(name => ({
        lead_id: id, doc_name: name, required: true, received: false,
      }))
      const { data: createdDocs } = await supabase
        .from('document_checklist')
        .insert(defaultDocs)
        .select()
      docs = createdDocs || []
    }

    return NextResponse.json({
      lead:          leadRes.data,
      questionnaire: qRes.data || null,
      notes:         notesRes.data || [],
      tasks:         tasksRes.data || [],
      docs,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/crm/leads/[id]  — body: { status }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lead: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
