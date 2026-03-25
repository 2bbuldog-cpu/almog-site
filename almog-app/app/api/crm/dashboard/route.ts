import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET /api/crm/dashboard
export async function GET() {
  try {
    const supabase = createServiceClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [leadsResult, tasksResult] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .lte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true }),
    ])

    return NextResponse.json({
      leads: leadsResult.data || [],
      overdueTasks: tasksResult.data || [],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
