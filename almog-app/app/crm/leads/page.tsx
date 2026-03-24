'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Lead, LeadStatus, STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '@/lib/types'

const PAGE_SIZE = 20

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [sortBy, setSortBy] = useState<'created_at' | 'qualification_score'>('created_at')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('leads').select('*', { count: 'exact' })

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      query = query
        .order(sortBy, { ascending: sortDir === 'asc' })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      const { data, count, error } = await query
      if (error) throw error
      setLeads(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error('Leads fetch error:', error)
    }
    setLoading(false)
  }, [search, statusFilter, sortBy, sortDir, page])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, sortBy, sortDir])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const allStatuses: Array<LeadStatus | ''> = ['', 'new', 'contacted', 'waiting_docs', 'under_review', 'submitted', 'completed', 'lost']
  const statusLabels: Record<string, string> = { '': 'כל הסטטוסים', ...STATUS_LABELS }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0E1E40' }}>👥 ניהול לידים</h1>
          <p style={{ color: '#718096', fontSize: '0.85rem', marginTop: '4px' }}>
            {total} לידים בסה"כ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '16px 20px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <span style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#A0AEC0', fontSize: '0.9rem', pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="חיפוש לפי שם או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', paddingRight: '38px', paddingLeft: '14px', padding: '11px 38px 11px 14px',
              border: '2px solid #E2E8F0', borderRadius: '10px',
              fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
              direction: 'rtl', outline: 'none', color: '#0E1E40',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          style={{
            padding: '11px 14px', border: '2px solid #E2E8F0', borderRadius: '10px',
            fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
            direction: 'rtl', outline: 'none', background: 'white', color: '#0E1E40',
            cursor: 'pointer', minWidth: '160px',
          }}
        >
          {allStatuses.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}_${sortDir}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split('_') as [typeof sortBy, typeof sortDir]
            setSortBy(field)
            setSortDir(dir === 'asc' ? 'asc' : 'desc')
          }}
          style={{
            padding: '11px 14px', border: '2px solid #E2E8F0', borderRadius: '10px',
            fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
            direction: 'rtl', outline: 'none', background: 'white', color: '#0E1E40',
            cursor: 'pointer',
          }}
        >
          <option value="created_at_desc">חדש ביותר</option>
          <option value="created_at_asc">ישן ביותר</option>
          <option value="qualification_score_desc">ציון גבוה</option>
          <option value="qualification_score_asc">ציון נמוך</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <div>טוען לידים...</div>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>לא נמצאו לידים</div>
            <div style={{ fontSize: '0.85rem' }}>נסה לשנות את הפילטרים</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FAFBFC', borderBottom: '2px solid #E2E8F0' }}>
                    {['שם', 'טלפון', 'אימייל', 'ציון', 'סטטוס', 'תאריך', 'פעולות'].map(h => (
                      <th key={h} style={{
                        padding: '14px 16px', textAlign: 'right',
                        color: '#718096', fontWeight: 700, fontSize: '0.78rem',
                        letterSpacing: '0.5px', whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const color = STATUS_COLORS[lead.status] || '#718096'
                    const bg = STATUS_BG[lead.status] || 'rgba(107,114,128,0.1)'
                    const scoreColor = lead.qualification_score >= 60 ? '#15803D'
                      : lead.qualification_score >= 30 ? '#B7860A' : '#374151'
                    const scoreBg = lead.qualification_score >= 60 ? 'rgba(34,197,94,0.1)'
                      : lead.qualification_score >= 30 ? 'rgba(201,168,76,0.1)' : 'rgba(107,114,128,0.1)'
                    return (
                      <tr
                        key={lead.id}
                        style={{ borderBottom: '1px solid #F7F9FC', transition: 'background 0.15s', cursor: 'pointer' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAFBFC' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0E1E40', whiteSpace: 'nowrap' }}>
                          <Link href={`/crm/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {lead.full_name}
                          </Link>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4A5568', direction: 'ltr', textAlign: 'right' }}>
                          <a href={`tel:${lead.phone}`} style={{ color: '#4A5568', textDecoration: 'none' }}>{lead.phone}</a>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#718096', fontSize: '0.82rem' }}>
                          {lead.email || '–'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px',
                            background: scoreBg, color: scoreColor,
                            fontWeight: 800, fontSize: '0.78rem',
                          }}>
                            {lead.qualification_score}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px',
                            background: bg, color, fontWeight: 700, fontSize: '0.75rem',
                            border: `1px solid ${color}30`,
                            whiteSpace: 'nowrap',
                          }}>
                            {STATUS_LABELS[lead.status]}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#718096', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {new Date(lead.created_at).toLocaleDateString('he-IL')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link
                              href={`/crm/leads/${lead.id}`}
                              style={{
                                padding: '6px 12px', borderRadius: '7px',
                                background: 'rgba(14,30,64,0.06)',
                                color: '#0E1E40', fontSize: '0.75rem', fontWeight: 700,
                                textDecoration: 'none',
                              }}
                            >
                              פתח
                            </Link>
                            <a
                              href={`https://wa.me/972${lead.phone.replace(/^0/, '').replace(/-/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '6px 10px', borderRadius: '7px',
                                background: 'rgba(37,211,102,0.1)',
                                color: '#15803D', fontSize: '0.75rem',
                                textDecoration: 'none',
                              }}
                            >
                              💬
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#718096', fontSize: '0.82rem' }}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} מתוך {total}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid #E2E8F0', background: 'white',
                      color: page === 0 ? '#CBD5E0' : '#0E1E40',
                      fontFamily: 'Heebo, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                      cursor: page === 0 ? 'default' : 'pointer',
                    }}
                  >
                    → הקודם
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid #E2E8F0', background: 'white',
                      color: page >= totalPages - 1 ? '#CBD5E0' : '#0E1E40',
                      fontFamily: 'Heebo, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                      cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                    }}
                  >
                    הבא ←
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
