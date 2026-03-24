import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function authCheck(req: NextRequest) {
  return req.headers.get('x-crm-password') === process.env.CRM_PASSWORD
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { doc_id, received } = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('documents')
    .update({ received, received_at: received ? new Date().toISOString() : null })
    .eq('id', doc_id).eq('lead_id', params.id)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
