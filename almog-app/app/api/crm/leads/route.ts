import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET /api/crm/leads?search=&status=&sortBy=&sortDir=&page=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search   = searchParams.get('search') || ''
    const status   = searchParams.get('status') || ''
    const sortBy   = (searchParams.get('sortBy') || 'created_at') as 'created_at' | 'score'
    const sortDir  = (searchParams.get('sortDir') || 'desc') as 'desc' | 'asc'
    const page     = parseInt(searchParams.get('page') || '0', 10)
    const pageSize = 25

    const supabase = createServiceClient()

    let query = supabase.from('leads').select('*', { count: 'exact' })

    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ leads: data || [], total: count || 0 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
