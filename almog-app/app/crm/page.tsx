'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Lead, Task, STATUS_LABELS } from '@/lib/types'

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
  if (lead.status === 'new') {
    if (age < 24)  return 'new'
    if (age < 72)  return 'attention'
    return 'overdue'
  }
  const activeStatuses = ['contacted', 'waiting_docs', 'under_review']
  if (activeStatuses.includes(lead.status) && getDaysSinceUpdate(lead) > 7) return 'attention'
  return 'ok'
}

const URGENCY_LABEL: Record<Urgency, string> = {
  new: 'ממתין לקשר',
  attention: 'דורש תשומת לב',
  overdue: 'באיחור',
  ok: '',
}

const URGENCY_COLOR: Record<Urgency, string> = {
  new: '#2563eb',
  attention: '#d97706',
  overdue: '#dc2626',
  ok: '#9ca3af',
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
  waiting_docs: 'מעקב מסמכים חסרים',
  under_review: 'בדיקה פנימית',
  submitted: 'מעקב תוצאה מרשות המסים',
  completed: '—',
  lost: '—',
}

// ─── Age display ─────────────────────────────────────────────────────────────

function formatAge(lead: Lead): string {
  const h = getAgeHours(lead)
  if (h < 1)  return 'הרגע'
  if (h < 24) return `לפני ${Math.floor(h)} שע'`
  const d = Math.floor(h / 24)
  if (d === 1) return 'אתמול'
  return `לפני ${d} ימים`
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  padding: '16px',
}

const th: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'right',
  color: '#9ca3af',
  fontWeight: 600,
  fontSize: '0.72rem',
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

interface DashboardStats {
  total: number
  todayLeads: number
  inProgress: number
  completed: number
  conversionRate: number
  uncontacted: number
}

interface PipelineCount { status: string; count: number }

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, todayLeads: 0, inProgress: 0, completed: 0, conversionRate: 0, uncontacted: 0,
  })
  const [pipeline, setPipeline]     = useState<PipelineCount[]>([])
  const [hotLeads, setHotLeads]     = useState<Lead[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const [leadsResult, tasksResult] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('completed', false)
          .lte('due_date', new Date().toISOString().split('T')[0])
          .order('due_date', { ascending: true }),
      ])
      const leads: Lead[] = leadsResult.data || []
      const tasks: Task[] = tasksResult.data || []

      const closedCount = leads.filter(l => l.status === 'completed').length
      const lostCount   = leads.filter(l => l.status === 'lost').length

      setStats({
        total: leads.length,
        todayLeads: leads.filter(l => new Date(l.created_at) >= today).length,
        inProgress: leads.filter(l => ['contacted', 'waiting_docs', 'under_review', 'submitted'].includes(l.status)).length,
        completed: closedCount,
        conversionRate: (closedCount + lostCount) > 0
          ? Math.round((closedCount / (closedCount + lostCount)) * 100)
          : 0,
        uncontacted: leads.filter(l => l.status === 'new' && getAgeHours(l) > 24).length,
      })

      const pipelineCounts: Record<string, number> = {}
      leads.forEach(l => { pipelineCounts[l.status] = (pipelineCounts[l.status] || 0) + 1 })
      setPipeline(Object.entries(pipelineCounts).map(([status, count]) => ({ status, count })))

      // Hot leads: new leads > 24h old or stale active leads, sorted by age
      const hot = leads
        .filter(l => getUrgency(l) === 'attention' || getUrgency(l) === 'overdue')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 8)
      setHotLeads(hot)
      setRecentLeads(leads.slice(0, 8))
      setOverdueTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Dashboard error:', error)
    }
    setLoading(false)
  }

  const allStatuses = ['new', 'contacted', 'waiting_docs', 'under_review', 'submitted', 'completed', 'lost']

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>דשבורד</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.76rem', marginTop: '2px' }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'סה"כ לידים',    value: loading ? '–' : String(stats.total) },
          { label: 'היום',           value: loading ? '–' : String(stats.todayLeads) },
          { label: 'בטיפול',         value: loading ? '–' : String(stats.inProgress) },
          { label: 'סגורים',         value: loading ? '–' : String(stats.completed) },
          { label: 'שיעור המרה',    value: loading ? '–' : `${stats.conversionRate}%`, highlight: stats.conversionRate > 0 },
          { label: 'לא טופלו 24h+', value: loading ? '–' : String(stats.uncontacted), alert: stats.uncontacted > 0 },
        ].map((s) => (
          <div key={s.label} style={{
            ...card,
            display: 'flex', flexDirection: 'column', gap: '4px',
            borderTop: s.alert && !loading ? '2px solid #dc2626' : s.highlight && !loading ? '2px solid #16a34a' : '2px solid transparent',
          }}>
            <span style={{
              fontSize: '1.5rem', fontWeight: 700, lineHeight: 1,
              color: s.alert && !loading && stats.uncontacted > 0 ? '#dc2626' : '#111827',
            }}>
              {s.value}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Hot leads panel — empty state */}
      {!loading && hotLeads.length === 0 && stats.total > 0 && (
        <div style={{ ...card, marginBottom: '14px', borderRight: '3px solid #16a34a', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>כל הלידים מטופלים</div>
            <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: '2px' }}>אין לידים הדורשים טיפול מיידי כרגע</div>
          </div>
        </div>
      )}

      {/* Hot leads panel */}
      {!loading && hotLeads.length > 0 && (
        <div style={{ ...card, marginBottom: '14px', borderRight: '3px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              לידים דורשים טיפול מיידי — {hotLeads.length}
            </div>
            <Link href="/crm/leads" style={{ fontSize: '0.76rem', color: '#6b7280', textDecoration: 'none' }}>
              לכל הלידים
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>שם</th>
                  <th style={th}>טלפון</th>
                  <th style={th}>גיל ליד</th>
                  <th style={th}>דחיפות</th>
                  <th style={th}>פעולה נדרשת</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.map((lead) => {
                  const urgency = getUrgency(lead)
                  return (
                    <tr
                      key={lead.id}
                      style={{ cursor: 'pointer', background: URGENCY_BG[urgency] }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = URGENCY_BG[urgency] }}
                      onClick={() => window.location.href = `/crm/leads/${lead.id}`}
                    >
                      <td style={{ ...td, fontWeight: 600, color: '#111827' }}>{lead.full_name}</td>
                      <td style={{ ...td, direction: 'ltr', textAlign: 'right', color: '#6b7280' }}>
                        <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {lead.phone}
                        </a>
                      </td>
                      <td style={{ ...td, color: '#6b7280' }}>{formatAge(lead)}</td>
                      <td style={td}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                          background: URGENCY_BG[urgency], color: URGENCY_COLOR[urgency],
                          border: `1px solid ${URGENCY_COLOR[urgency]}40`,
                        }}>
                          {URGENCY_LABEL[urgency]}
                        </span>
                      </td>
                      <td style={{ ...td, color: '#374151' }}>{NEXT_ACTION[lead.status]}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link
                            href={`/crm/leads/${lead.id}`}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '3px 8px', border: '1px solid #d1d5db', fontSize: '0.72rem', textDecoration: 'none', color: '#374151', background: 'white' }}
                          >
                            פתח
                          </Link>
                          <a
                            href={`https://wa.me/972${lead.phone.replace(/^0/, '').replace(/-/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '3px 8px', border: '1px solid #d1d5db', fontSize: '0.72rem', textDecoration: 'none', color: '#374151', background: 'white' }}
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
        </div>
      )}

      {/* Pipeline + overdue tasks */}
      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>

        {/* Pipeline */}
        <div style={card}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
            פייפליין
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allStatuses.map((status) => {
              const count = pipeline.find(p => p.status === status)?.count || 0
              const maxCount = Math.max(...pipeline.map(p => p.count), 1)
              const pct = (count / maxCount) * 100
              return (
                <Link key={status} href={`/crm/leads?status=${status}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#374151' }}>
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#6b7280', fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', background: '#f3f4f6' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#1c2b47', transition: 'width 0.4s ease' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Overdue tasks */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              משימות באיחור
            </div>
            <Link href="/crm/tasks" style={{ fontSize: '0.76rem', color: '#6b7280', textDecoration: 'none' }}>הכל</Link>
          </div>
          {loading ? (
            <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>טוען...</div>
          ) : overdueTasks.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>אין משימות פתוחות</div>
              <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>כל המשימות מעודכנות</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {overdueTasks.map((task) => (
                <div key={task.id} style={{
                  padding: '8px 10px', border: '1px solid #fca5a5', background: '#fff7f7',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#374151' }}>{task.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#dc2626' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : 'ללא תאריך'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent leads */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            לידים אחרונים
          </div>
          <Link href="/crm/leads" style={{ fontSize: '0.76rem', color: '#6b7280', textDecoration: 'none' }}>לכל הלידים</Link>
        </div>
        {loading ? (
          <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>טוען...</div>
        ) : recentLeads.length === 0 ? (
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '0.88rem' }}>אין לידים במערכת</div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>לידים חדשים שמתקבלים מהאתר יופיעו כאן</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>שם</th>
                  <th style={th}>טלפון</th>
                  <th style={th}>גיל</th>
                  <th style={th}>סטטוס</th>
                  <th style={th}>פעולה הבאה</th>
                  <th style={th}>ציון</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const urgency = getUrgency(lead)
                  return (
                    <tr
                      key={lead.id}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      onClick={() => window.location.href = `/crm/leads/${lead.id}`}
                    >
                      <td style={{ ...td, fontWeight: 600, color: '#111827' }}>
                        {lead.full_name}
                        {urgency !== 'ok' && urgency !== 'new' && (
                          <span style={{
                            marginRight: '6px', fontSize: '0.65rem', fontWeight: 700,
                            color: URGENCY_COLOR[urgency],
                          }}>
                            {urgency === 'overdue' ? '!' : '·'}
                          </span>
                        )}
                      </td>
                      <td style={{ ...td, direction: 'ltr', textAlign: 'right', color: '#6b7280' }}>{lead.phone}</td>
                      <td style={{ ...td, color: '#9ca3af', fontSize: '0.76rem' }}>{formatAge(lead)}</td>
                      <td style={td}>{STATUS_LABELS[lead.status]}</td>
                      <td style={{ ...td, color: '#374151', fontSize: '0.78rem' }}>{NEXT_ACTION[lead.status]}</td>
                      <td style={{ ...td, color: '#6b7280' }}>{lead.qualification_score}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
