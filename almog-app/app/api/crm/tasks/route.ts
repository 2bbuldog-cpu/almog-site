import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET /api/crm/tasks?priority=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const priority = searchParams.get('priority') || ''

    const supabase = createServiceClient()

    let query = supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ tasks: data || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
