'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Lead, LeadStatus,
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS
} from '@/lib/types'

const ALL_STATUSES: LeadStatus[] = [
  'new', 'questionnaire_done', 'docs_pending', 'in_review',
  'ready_to_submit', 'submitted', 'waiting_result', 'refund_received', 'closed'
]

interface LeadRow extends Lead {
  notes_count?: number
  open_tasks?: number
  missing_docs?: number
}

function apiHeaders() {
  const pw = sessionStorage.getItem('crm_pw') || ''
  return { 'Content-Type': 'application/json', 'x-crm-password': pw }
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color = label === 'hot' ? '#EF4444' : label === 'warm' ? '#F59E0B' : '#6B7280'
  const text = label === 'hot' ? 'חם 🔥' : label === 'warm' ? 'בינוני' : 'קר'
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}44`,
      borderRadius: '50px', padding: '2px 10px', fontSize: '.75rem', fontWeight: 700,
    }}>
      {text} {score}/10
    </span>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const color = LEAD_STATUS_COLORS[status]
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}44`,
      borderRadius: '6px', padding: '4px 10px', fontSize: '.78rem', fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

export default function CrmDashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (search) params.set('q', search)

    const res = await fetch(`/api/leads?${params}`, { headers: apiHeaders() })
    if (res.ok) {
      const data = await res.json()
      setLeads(data.data || [])
    }
    setLoading(false)
  }, [filterStatus, search])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  // Pipeline counts
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {} as Record<string, number>)

  const totalLeads = leads.length
  const hotLeads = leads.filter(l => l.score_label === 'hot').length
  const refundReceived = leads.filter(l => l.status === 'refund_received').length
  const overdueTasks = leads.filter(l => (l.open_tasks ?? 0) > 0).length

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9FC',
      fontFamily: "'Heebo', sans-serif",
      direction: 'rtl',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: '#0E1E40',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ color: '#E8C96A', fontWeight: 900, fontSize: '1.05rem' }}>אלמוג | CRM</span>
          <span style={{
            background: 'rgba(201,168,76,.15)', color: '#C9A84C',
            borderRadius: '50px', padding: '2px 10px', fontSize: '.75rem', fontWeight: 700,
          }}>
            {totalLeads} לידים
          </span>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'לידים', href: '/crm' },
              { label: 'לקוחות', href: '/crm/clients' },
              { label: 'פגישות', href: '/crm/meetings' },
              { label: 'מסמכים', href: '/crm/documents' },
              { label: 'הגדרות', href: '/crm/settings' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                color: item.href === '/crm' ? '#fff' : 'rgba(255,255,255,.45)',
                fontSize: '.82rem',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                background: item.href === '/crm' ? 'rgba(255,255,255,.1)' : 'transparent',
                fontWeight: item.href === '/crm' ? 700 : 400,
              }}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{
            color: 'rgba(255,255,255,.4)', fontSize: '.82rem', textDecoration: 'none',
          }}>
            האתר ←
          </a>
          <button
            onClick={() => { sessionStorage.clear(); window.location.reload() }}
            style={{
              background: 'rgba(255,255,255,.08)', border: 'none',
              color: 'rgba(255,255,255,.5)', padding: '6px 14px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '.8rem',
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            יציאה
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '28px 24px' }}>

        {/* ── STATS ROW ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'סה"כ לידים', value: totalLeads, icon: '👥', color: '#3B82F6' },
            { label: 'לידים חמים', value: hotLeads, icon: '🔥', color: '#EF4444' },
            { label: 'החזרים שהתקבלו', value: refundReceived, icon: '✅', color: '#10B981' },
            { label: 'ממתינים לטיפול', value: overdueTasks, icon: '⚡', color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '20px 24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(14,30,64,.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#1A1A2E' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '.82rem', color: '#8492A6', marginTop: '4px' }}>
                    {stat.label}
                  </div>
                </div>
                <span style={{ fontSize: '1.6rem' }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── PIPELINE PILLS ── */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '7px 16px', borderRadius: '50px',
                border: `2px solid ${filterStatus === 'all' ? '#0E1E40' : '#E2E8F0'}`,
                background: filterStatus === 'all' ? '#0E1E40' : 'transparent',
                color: filterStatus === 'all' ? '#fff' : '#4A5568',
                fontFamily: "'Heebo', sans-serif", fontSize: '.85rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              הכל ({totalLeads})
            </button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '7px 14px', borderRadius: '50px',
                  border: `2px solid ${filterStatus === s ? LEAD_STATUS_COLORS[s] : '#E2E8F0'}`,
                  background: filterStatus === s ? `${LEAD_STATUS_COLORS[s]}22` : 'transparent',
                  color: filterStatus === s ? LEAD_STATUS_COLORS[s] : '#4A5568',
                  fontFamily: "'Heebo', sans-serif", fontSize: '.82rem', fontWeight: filterStatus === s ? 700 : 500,
                  cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
                }}
              >
                {LEAD_STATUS_LABELS[s]} {counts[s] > 0 && `(${counts[s]})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── SEARCH + ADD ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
              placeholder="חיפוש לפי שם או טלפון..."
              style={{
                width: '100%', padding: '11px 42px 11px 16px',
                borderRadius: '10px', border: '1px solid #E2E8F0',
                fontFamily: "'Heebo', sans-serif", fontSize: '.92rem',
                outline: 'none', background: '#fff',
                direction: 'rtl',
              }}
            />
            <span style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#8492A6', fontSize: '1rem',
            }}>🔍</span>
          </div>
          <button
            onClick={() => setSearch(searchInput)}
            style={{
              padding: '11px 20px', borderRadius: '10px',
              background: '#0E1E40', color: '#fff',
              border: 'none', fontFamily: "'Heebo', sans-serif",
              fontSize: '.88rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            חפש
          </button>
          <button
            onClick={fetchLeads}
            style={{
              padding: '11px 16px', borderRadius: '10px',
              background: '#F7F9FC', color: '#4A5568',
              border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif",
              fontSize: '.88rem', cursor: 'pointer',
            }}
          >
            ↻
          </button>
        </div>

        {/* ── LEADS TABLE ── */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(14,30,64,.05)',
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8492A6' }}>
              טוען לידים...
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8492A6' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
              <div>אין לידים {filterStatus !== 'all' ? 'בסטטוס זה' : 'עדיין'}</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7F9FC', borderBottom: '1px solid #E2E8F0' }}>
                  {['שם', 'טלפון', 'עיר', 'מקור', 'ציון', 'סטטוס', 'מסמכים', 'משימות', 'תאריך', 'מעקב'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'right',
                      fontSize: '.8rem', fontWeight: 700, color: '#4A5568',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/crm/${lead.id}`)}
                    style={{
                      borderBottom: i < leads.length - 1 ? '1px solid #F0F4F8' : 'none',
                      cursor: 'pointer',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F9FC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '.92rem' }}>
                        {lead.name}
                      </div>
                      {lead.email && (
                        <div style={{ fontSize: '.75rem', color: '#8492A6', marginTop: '2px' }}>
                          {lead.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '.88rem', color: '#4A5568', direction: 'ltr', display: 'inline-block' }}>
                        {lead.phone}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.85rem', color: '#4A5568' }}>
                      {lead.city || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.82rem', color: '#8492A6' }}>
                      {LEAD_SOURCE_LABELS[lead.source as keyof typeof LEAD_SOURCE_LABELS] || lead.source}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ScoreBadge score={lead.score} label={lead.score_label ?? undefined} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {(lead.missing_docs ?? 0) > 0 ? (
                        <span style={{
                          background: '#FEF3C7', color: '#D97706',
                          borderRadius: '50px', padding: '2px 10px',
                          fontSize: '.75rem', fontWeight: 700,
                        }}>
                          {lead.missing_docs} חסרים
                        </span>
                      ) : (
                        <span style={{ color: '#10B981', fontSize: '.82rem' }}>✓</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {(lead.open_tasks ?? 0) > 0 ? (
                        <span style={{
                          background: '#EDE9FE', color: '#7C3AED',
                          borderRadius: '50px', padding: '2px 10px',
                          fontSize: '.75rem', fontWeight: 700,
                        }}>
                          {lead.open_tasks}
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E0', fontSize: '.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.8rem', color: '#8492A6', whiteSpace: 'nowrap' }}>
                      {formatDate(lead.created_at)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                      {lead.next_followup_date ? (
                        <span style={{
                          color: new Date(lead.next_followup_date) < new Date() ? '#EF4444' : '#4A5568',
                          fontWeight: new Date(lead.next_followup_date) < new Date() ? 700 : 400,
                        }}>
                          {formatDate(lead.next_followup_date)}
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E0' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
