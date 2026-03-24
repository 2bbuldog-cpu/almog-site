import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { DEFAULT_DOCUMENTS } from '@/lib/types'

// POST /api/leads — create a new lead from questionnaire submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lead, questionnaire } = body

    if (!lead?.name || !lead?.phone) {
      return NextResponse.json({ error: 'שם וטלפון הם שדות חובה' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 0. Check for duplicate phone
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', lead.phone)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'ליד עם מספר טלפון זה כבר קיים במערכת', lead_id: existing.id }, { status: 409 })
    }

    // 1. Insert lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || null,
        id_number: lead.id_number || null,
        city: lead.city || null,
        status: 'questionnaire_done',
        source: lead.source || 'questionnaire',
        score: lead.score ?? 0,
        score_label: lead.score >= 7 ? 'hot' : lead.score >= 4 ? 'warm' : 'cold',
        estimated_refund_min: lead.estimated_refund_min || null,
        estimated_refund_max: lead.estimated_refund_max || null,
        bank_update_status: 'לא עודכן',
      })
      .select('id')
      .single()

    if (leadError || !leadData) {
      console.error('Lead insert error:', leadError)
      return NextResponse.json({ error: 'שגיאה ביצירת הליד' }, { status: 500 })
    }

    const leadId = leadData.id

    // 2. Insert questionnaire response
    if (questionnaire) {
      const { error: qError } = await supabase
        .from('questionnaire_responses')
        .insert({
          lead_id: leadId,
          employment_type: questionnaire.employmentType || 'employee',
          years_to_check: questionnaire.yearsToCheck || [],
          changed_employer: questionnaire.changedEmployer || false,
          num_employers: questionnaire.numEmployers || null,
          parallel_jobs: questionnaire.parallelJobs || false,
          maternity_leave: questionnaire.maternityLeave || false,
          military_reserve: questionnaire.militaryReserve || false,
          unemployment: questionnaire.unemployment || false,
          unpaid_leave: questionnaire.unpaidLeave || false,
          num_children: questionnaire.numChildren || 0,
          youngest_child_age: questionnaire.youngestChildAge || null,
          academic_degree: questionnaire.academicDegree || false,
          periphery_resident: questionnaire.peripheryResident ?? null,
          donations: questionnaire.donations || false,
          donation_amount: questionnaire.donationAmount || null,
          self_deposits: questionnaire.selfDeposits || false,
          income_range: questionnaire.incomeRange || '',
          previous_tax_return: questionnaire.previousTaxReturn || false,
          can_upload_docs: questionnaire.canUploadDocs || false,
          raw_data: questionnaire.raw_data || {},
        })

      if (qError) {
        console.error('Questionnaire insert error:', qError)
        // Non-fatal — lead was created, continue
      }
    }

    // 3. Create default document checklist
    const docInserts = DEFAULT_DOCUMENTS.map(name => ({
      lead_id: leadId,
      name,
      required: true,
      received: false,
    }))

    await supabase.from('documents').insert(docInserts)

    // 4. Create welcome note
    await supabase.from('lead_notes').insert({
      lead_id: leadId,
      content: `ליד חדש נוצר מהשאלון. ציון: ${lead.score}/10. טווח החזר משוער: ₪${lead.estimated_refund_min?.toLocaleString()}–₪${lead.estimated_refund_max?.toLocaleString()}.`,
      author: 'מערכת',
    })

    return NextResponse.json({ lead_id: leadId }, { status: 201 })
  } catch (err) {
    console.error('POST /api/leads error:', err)
    return NextResponse.json({ error: 'שגיאת שרת פנימית' }, { status: 500 })
  }
}

// GET /api/leads — list all leads (CRM)
export async function GET(req: NextRequest) {
  try {
    // Simple password check for CRM access
    const auth = req.headers.get('x-crm-password')
    if (auth !== process.env.CRM_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('q')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '50', 10))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const supabase = createServiceClient()
    let query = supabase
      .from('leads_summary')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, total: count ?? 0, page, pageSize })
  } catch (err) {
    console.error('GET /api/leads error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
