import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function authCheck(req: NextRequest) {
  return req.headers.get('x-crm-password') === process.env.CRM_PASSWORD
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, due_date } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'כותרת חובה' }, { status: 400 })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({ lead_id: params.id, title, due_date: due_date || null })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { task_id, done } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tasks').update({ done }).eq('id', task_id).eq('lead_id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const task_id = searchParams.get('task_id')
  if (!task_id) return NextResponse.json({ error: 'task_id חסר' }, { status: 400 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('tasks').delete().eq('id', task_id).eq('lead_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
