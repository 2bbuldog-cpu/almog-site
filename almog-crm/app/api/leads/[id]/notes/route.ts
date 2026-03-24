import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function authCheck(req: NextRequest) {
  return req.headers.get('x-crm-password') === process.env.CRM_PASSWORD
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, author = 'אלמוג' } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'תוכן ריק' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('lead_notes')
    .insert({ lead_id: params.id, content, author })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
