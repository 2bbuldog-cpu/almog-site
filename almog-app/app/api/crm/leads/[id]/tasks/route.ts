import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// POST /api/crm/leads/[id]/tasks  — body: { title, due_date, priority }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, due_date, priority } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        lead_id:  id,
        title:    title.trim(),
        due_date: due_date || null,
        priority: priority || 'medium',
        completed: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
