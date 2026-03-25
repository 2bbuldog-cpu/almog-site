import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// PATCH /api/crm/leads/[id]/docs/[docId]  — body: { received }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { docId } = await params
    const body = await request.json()
    const { received } = body

    if (typeof received !== 'boolean') {
      return NextResponse.json({ error: 'received (boolean) is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('document_checklist')
      .update({ received })
      .eq('id', docId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ doc: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
