'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Lead, LeadStatus, STATUS_LABELS } from '@/lib/types'

const PAGE_SIZE = 25

// ─── Urgency ─────────────────────────────────────────────────────────────────

type Urgency = 'new' | 'attention' | 'overdue' | 'ok'

function getAgeHours(lead: Lead): number {
  return (Date.now() - new Date(lead.created_at).getTime()) / 3_600_000
}

function getDaysSinceUpdate(lead: Lead): number {
  return (Date.now() - new Date(lead.updated_at).getTime()) / 86_400_000
}

function getUrgency(lead: Lead): Urgency {
  const age = getAgeHours(lead)
  if (lead.status === 'new' || lead.status === 'questionnaire_done') {
    if (age < 24)  return 'new'
    if (age < 72)  return 'attention'
    return 'overdue'
  }
  const activeStatuses = ['contacted', 'waiting_docs', 'under_review']
  if (activeStatuses.includes(lead.status) && getDaysSinceUpdate(lead) > 7) return 'attention'
  return 'ok'
}

const URGENCY_LABEL: Record<Urgency, string> = {
  new: 'ממתין',
  attention: 'דורש תשומת לב',
  overdue: 'באיחור',
  ok: '',
}

const URGENCY_COLOR: Record<Urgency, string> = {
  new: '#2563eb',
  attention: '#d97706',
  overdue: '#dc2626',
  ok: '',
}

const URGENCY_BG: Record<Urgency, string> = {
  new: '#eff6ff',
  attention: '#fffbeb',
  overdue: '#fef2f2',
  ok: 'transparent',
}

// ─── Next action ─────────────────────────────────────────────────────────────

const NEXT_ACTION: Record<string, string> = {
  new: 'יצירת קשר ראשוני',
  contacted: 'קביעת פגישה / בקשת מסמכים',
  waiting_docs: 'מעקב מסמכים',
  under_review: 'בדיקה פנימית',
  submitted: 'מעקב תוצאה',
  completed: '—',
  lost: '—',
}

// ─── Age ─────────────────────────────────────────────────────────────────────

function formatAge(lead: Lead): string {
  const h = getAgeHours(lead)
  if (h < 1)  return 'הרגע'
  if (h < 24) return `${Math.floor(h)} שע'`
  const d = Math.floor(h / 24)
  if (d === 1) return 'אתמול'
  return `${d} ימים`
}

// ─── Static data ─────────────────────────────────────────────────────────────

const allStatuses: Array<LeadStatus | ''> = ['', 'questionnaire_done', 'new', 'contacted', 'waiting_docs', 'under_review', 'submitted', 'completed', 'lost']
const statusLabels: Record<string, string> = {
  '': 'כל הסטטוסים', ...STATUS_LABELS,
}

const pipelineStages = [
  { key: 'questionnaire_done', label: 'שאלון הושלם' },
  { key: 'new',          label: 'ליד חדש' },
  { key: 'contacted',    label: 'בוצע קשר' },
  { key: 'waiting_docs', label: 'מסמכים' },
  { key: 'under_review', label: 'בטיפול' },
  { key: 'submitted',    label: 'הוגש' },
  { key: 'completed',    label: 'סגור' },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const th: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'right',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: '0.72rem',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid #e5e7eb',
  background: '#f9fafb',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.82rem',
  color: '#374151',
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads]             = useState<Lead[]>([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(0)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [sortBy, setSortBy]           = useState<'created_at' | 'score'>('created_at')
  const [sortDir, setSortDir]         = useState<'desc' | 'asc'>('desc')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        status:  statusFilter,
        sortBy,
        sortDir,
        page:    String(page),
      })
      const res = await fetch(`/api/crm/leads?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setLeads(json.leads || [])
      setTotal(json.total || 0)
    } catch (error) {
      console.error('Leads fetch error:', error)
    }
    setLoading(false)
  }, [search, statusFilter, sortBy, sortDir, page])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(0) }, [search, statusFilter, sortBy, sortDir])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>לידים</h1>
          {!loading && (
            <p style={{ color: '#9ca3af', fontSize: '0.76rem', marginTop: '2px' }}>{total} לידים בסה&quot;כ</p>
          )}
        </div>
        <button style={{
          padding: '7px 16px', background: '#1c2b47', color: 'white', border: 'none',
          fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Heebo, sans-serif', cursor: 'pointer',
        }}>
          + ליד חדש
        </button>
      </div>

      {/* Pipeline bar */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', marginBottom: '10px', display: 'flex', overflowX: 'auto' }}>
        {[{ key: '', label: 'הכל' }, ...pipelineStages].map((stage, i, arr) => {
          const count = stage.key ? leads.filter(l => l.status === stage.key).length : total
          const isActive = statusFilter === stage.key
          return (
            <button
              key={stage.key}
              onClick={() => setStatusFilter(isActive ? '' : stage.key as LeadStatus)}
              style={{
                flex: '1 0 auto', padding: '8px 12px',
                background: isActive ? '#1c2b47' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                border: 'none',
                borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none',
                fontSize: '0.74rem', fontFamily: 'Heebo, sans-serif',
                cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center',
              }}
            >
              {stage.label}
              {!loading && (
                <span style={{
                  display: 'inline-block', marginRight: '5px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                  color: isActive ? 'white' : '#374151',
                  fontSize: '0.66rem', fontWeight: 700,
                  padding: '0 5px', minWidth: '18px',
                }}>
                  {stage.key ? leads.filter(l => l.status === stage.key).length : total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb', padding: '10px 12px',
        marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="חיפוש לפי שם או טלפון..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 180px', padding: '6px 10px', border: '1px solid #d1d5db',
            fontSize: '0.82rem', fontFamily: 'Heebo, sans-serif', direction: 'rtl',
            outline: 'none', color: '#374151',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          style={{
            padding: '6px 10px', border: '1px solid #d1d5db', fontSize: '0.82rem',
            fontFamily: 'Heebo, sans-serif', direction: 'rtl', outline: 'none',
            color: '#374151', cursor: 'pointer', minWidth: '140px',
          }}
        >
          {allStatuses.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <select
          value={`${sortBy}_${sortDir}`}
          onChange={(e) => {
            const val = e.target.value
            if (val === 'created_at_desc')           { setSortBy('created_at'); setSortDir('desc') }
            else if (val === 'created_at_asc')        { setSortBy('created_at'); setSortDir('asc') }
            else if (val === 'score_desc') { setSortBy('score'); setSortDir('desc') }
            else                          { setSortBy('score'); setSortDir('asc') }
          }}
          style={{
            padding: '6px 10px', border: '1px solid #d1d5db', fontSize: '0.82rem',
            fontFamily: 'Heebo, sans-serif', direction: 'rtl', outline: 'none',
            color: '#374151', cursor: 'pointer',
          }}
        >
          <option value="created_at_desc">חדש ביותר</option>
          <option value="created_at_asc">ישן ביותר</option>
          <option value="score_desc">ציון גבוה</option>
          <option value="score_asc">ציון נמוך</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#9ca3af', fontSize: '0.84rem' }}>טוען...</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: '8px' }}>אין לידים</div>
            <div style={{ color: '#9ca3af', fontSize: '0.84rem' }}>נסה לשנות את הפילטרים</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>שם</th>
                    <th style={th}>טלפון</th>
                    <th style={th}>גיל ליד</th>
                    <th style={th}>דחיפות</th>
                    <th style={th}>סטטוס</th>
                    <th style={th}>פעולה הבאה</th>
                    <th style={th}>ציון</th>
                    <th style={th}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const urgency = getUrgency(lead)
                    return (
                      <tr
                        key={lead.id}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <td style={{ ...td, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                          <Link href={`/crm/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {lead.name}
                          </Link>
                        </td>
                        <td style={{ ...td, direction: 'ltr', textAlign: 'right' }}>
                          <a href={`tel:${lead.phone}`} style={{ color: '#374151', textDecoration: 'none' }}>{lead.phone}</a>
                        </td>
                        <td style={{ ...td, color: '#9ca3af', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                          {formatAge(lead)}
                        </td>
                        <td style={td}>
                          {urgency !== 'ok' && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px',
                              background: URGENCY_BG[urgency], color: URGENCY_COLOR[urgency],
                              border: `1px solid ${URGENCY_COLOR[urgency]}40`,
                              whiteSpace: 'nowrap',
                            }}>
                              {URGENCY_LABEL[urgency]}
                            </span>
                          )}
                        </td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[lead.status]}
                        </td>
                        <td style={{ ...td, color: '#6b7280', fontSize: '0.78rem' }}>
                          {NEXT_ACTION[lead.status]}
                        </td>
                        <td style={{ ...td, color: '#6b7280' }}>
                          {lead.score}
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <Link
                              href={`/crm/leads/${lead.id}`}
                              style={{ padding: '4px 10px', border: '1px solid #d1d5db', color: '#374151', fontSize: '0.74rem', textDecoration: 'none', background: 'white', whiteSpace: 'nowrap' }}
                            >
                              פתח
                            </Link>
                            <a
                              href={`https://wa.me/972${lead.phone.replace(/^0/, '').replace(/-/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: '4px 10px', border: '1px solid #d1d5db', color: '#374151', fontSize: '0.74rem', textDecoration: 'none', background: 'white' }}
                            >
                              WA
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{
                padding: '10px 14px', borderTop: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#9ca3af', fontSize: '0.76rem' }}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} מתוך {total}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding: '5px 12px', border: '1px solid #d1d5db', background: 'white',
                      color: page === 0 ? '#d1d5db' : '#374151',
                      fontFamily: 'Heebo, sans-serif', fontSize: '0.78rem',
                      cursor: page === 0 ? 'default' : 'pointer',
                    }}
                  >הקודם</button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: '5px 12px', border: '1px solid #d1d5db', background: 'white',
                      color: page >= totalPages - 1 ? '#d1d5db' : '#374151',
                      fontFamily: 'Heebo, sans-serif', fontSize: '0.78rem',
                      cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    }}
                  >הבא</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
