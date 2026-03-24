'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Lead, Task, STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '@/lib/types'

interface DashboardStats {
  total: number
  newThisWeek: number
  inProgress: number
  completed: number
}

interface PipelineCount {
  status: string
  count: number
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, newThisWeek: 0, inProgress: 0, completed: 0 })
  const [pipeline, setPipeline] = useState<PipelineCount[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const [leadsResult, tasksResult] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('completed', false).lte('due_date', new Date().toISOString().split('T')[0]).order('due_date', { ascending: true }),
      ])

      const leads: Lead[] = leadsResult.data || []
      const tasks: Task[] = tasksResult.data || []

      const total = leads.length
      const newThisWeek = leads.filter(l => new Date(l.created_at) > oneWeekAgo).length
      const inProgress = leads.filter(l => ['contacted', 'waiting_docs', 'under_review', 'submitted'].includes(l.status)).length
      const completed = leads.filter(l => l.status === 'completed').length

      setStats({ total, newThisWeek, inProgress, completed })

      const pipelineCounts: Record<string, number> = {}
      leads.forEach(l => {
        pipelineCounts[l.status] = (pipelineCounts[l.status] || 0) + 1
      })
      setPipeline(Object.entries(pipelineCounts).map(([status, count]) => ({ status, count })))

      setRecentLeads(leads.slice(0, 10))
      setOverdueTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Dashboard error:', error)
    }
    setLoading(false)
  }

  const statCards = [
    { label: 'סה"כ לידים', value: stats.total, icon: '👥', color: '#0E1E40', bg: 'rgba(14,30,64,0.08)' },
    { label: 'השבוע', value: stats.newThisWeek, icon: '✨', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
    { label: 'בתהליך', value: stats.inProgress, icon: '🔄', color: '#1D4ED8', bg: 'rgba(59,130,246,0.1)' },
    { label: 'הושלמו', value: stats.completed, icon: '✅', color: '#15803D', bg: 'rgba(34,197,94,0.1)' },
  ]

  const allStatuses = ['new', 'contacted', 'waiting_docs', 'under_review', 'submitted', 'completed', 'lost']

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0E1E40', marginBottom: '4px' }}>
          שלום, אלמוג 👋
        </h1>
        <p style={{ color: '#718096', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}
      className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(14,30,64,0.06)',
            border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: card.color, lineHeight: 1 }}>
                {loading ? '...' : card.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '4px' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}
      className="dash-grid">

        {/* Pipeline */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        }}>
          <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '20px', fontSize: '1rem' }}>
            📊 פייפליין
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allStatuses.map((status) => {
              const count = pipeline.find(p => p.status === status)?.count || 0
              const maxCount = Math.max(...pipeline.map(p => p.count), 1)
              const pct = (count / maxCount) * 100
              const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#718096'
              const bg = STATUS_BG[status as keyof typeof STATUS_BG] || 'rgba(107,114,128,0.1)'
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4A5568' }}>
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px',
                      background: bg, color,
                    }}>
                      {count}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#F7F9FC', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}40, ${color})`,
                      borderRadius: '3px', transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 800, color: '#0E1E40', fontSize: '1rem' }}>
              ⚠️ משימות באיחור
            </h3>
            <Link href="/crm/tasks" style={{
              fontSize: '0.78rem', color: '#C9A84C', fontWeight: 700,
              textDecoration: 'none',
            }}>
              הכל →
            </Link>
          </div>
          {loading ? (
            <div style={{ color: '#718096', fontSize: '0.9rem' }}>טוען...</div>
          ) : overdueTasks.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '24px',
              color: '#718096', fontSize: '0.88rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              אין משימות באיחור
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overdueTasks.map((task) => (
                <div key={task.id} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(229,62,62,0.05)',
                  border: '1px solid rgba(229,62,62,0.15)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#E53E3E', flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.85rem' }}>{task.title}</div>
                    <div style={{ color: '#E53E3E', fontSize: '0.75rem' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : 'ללא תאריך'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads Table */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 800, color: '#0E1E40', fontSize: '1rem' }}>👥 לידים אחרונים</h3>
          <Link href="/crm/leads" style={{
            padding: '8px 16px', borderRadius: '8px',
            background: 'rgba(201,168,76,0.1)',
            color: '#B7860A', fontWeight: 700, fontSize: '0.82rem',
            textDecoration: 'none',
          }}>
            לכל הלידים →
          </Link>
        </div>
        {loading ? (
          <div style={{ color: '#718096', textAlign: 'center', padding: '24px' }}>טוען...</div>
        ) : recentLeads.length === 0 ? (
          <div style={{ color: '#718096', textAlign: 'center', padding: '40px', fontSize: '0.9rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
            אין לידים עדיין
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F7F9FC' }}>
                  {['שם', 'טלפון', 'ציון', 'סטטוס', 'תאריך'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'right',
                      color: '#718096', fontWeight: 700, fontSize: '0.78rem',
                      letterSpacing: '0.5px',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const color = STATUS_COLORS[lead.status] || '#718096'
                  const bg = STATUS_BG[lead.status] || 'rgba(107,114,128,0.1)'
                  return (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: '1px solid #F7F9FC', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAFBFC' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      onClick={() => window.location.href = `/crm/leads/${lead.id}`}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0E1E40' }}>{lead.full_name}</td>
                      <td style={{ padding: '12px 14px', color: '#4A5568', direction: 'ltr', textAlign: 'right' }}>{lead.phone}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '20px',
                          background: lead.qualification_score >= 60
                            ? 'rgba(34,197,94,0.1)' : lead.qualification_score >= 30
                            ? 'rgba(201,168,76,0.1)' : 'rgba(107,114,128,0.1)',
                          color: lead.qualification_score >= 60 ? '#15803D'
                            : lead.qualification_score >= 30 ? '#B7860A' : '#374151',
                          fontWeight: 800, fontSize: '0.78rem',
                        }}>
                          {lead.qualification_score}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px',
                          background: bg, color, fontWeight: 700, fontSize: '0.75rem',
                          border: `1px solid ${color}30`,
                        }}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#718096', fontSize: '0.78rem' }}>
                        {new Date(lead.created_at).toLocaleDateString('he-IL')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
