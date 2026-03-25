'use client'

import { useEffect, useState, useCallback } from 'react'
import { Task } from '@/lib/types'

type Filter = 'all' | 'pending' | 'overdue' | 'completed'
type PriorityFilter = '' | 'low' | 'medium' | 'high'

const PRIORITY_LABELS = { low: 'נמוכה', medium: 'בינונית', high: 'גבוהה' }
const PRIORITY_COLORS = { low: '#15803D', medium: '#B7860A', high: '#C53030' }
const PRIORITY_BG = { low: 'rgba(34,197,94,0.1)', medium: 'rgba(201,168,76,0.1)', high: 'rgba(229,62,62,0.1)' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('')
  const [search, setSearch] = useState('')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (priorityFilter) params.set('priority', priorityFilter)
      const res = await fetch(`/api/crm/tasks?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setTasks(json.tasks || [])
    } catch (error) {
      console.error('Tasks fetch error:', error)
    }
    setLoading(false)
  }, [priorityFilter])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleTask = async (task: Task) => {
    const res = await fetch(`/api/crm/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (res.ok) setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/crm/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) setTasks(tasks.filter(t => t.id !== id))
  }

  const now = new Date()

  const filtered = tasks.filter(t => {
    const isOverdue = t.due_date && !t.completed && new Date(t.due_date) < now
    if (filter === 'pending') return !t.completed && !isOverdue
    if (filter === 'overdue') return isOverdue
    if (filter === 'completed') return t.completed
    return true
  }).filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed && !(t.due_date && new Date(t.due_date) < now)).length,
    overdue: tasks.filter(t => t.due_date && !t.completed && new Date(t.due_date) < now).length,
    completed: tasks.filter(t => t.completed).length,
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0E1E40', margin: 0 }}>✅ משימות</h1>
        <p style={{ color: '#718096', fontSize: '0.85rem', marginTop: '4px' }}>
          {counts.overdue > 0 ? (
            <span style={{ color: '#C53030', fontWeight: 700 }}>⚠️ {counts.overdue} משימות באיחור · </span>
          ) : null}
          {counts.pending} ממתינות · {counts.completed} הושלמו
        </p>
      </div>

      {/* Filters bar */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '14px 18px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {([
            { v: 'all', label: `הכל (${counts.all})` },
            { v: 'pending', label: `ממתינות (${counts.pending})` },
            { v: 'overdue', label: `באיחור (${counts.overdue})`, danger: true },
            { v: 'completed', label: `הושלמו (${counts.completed})` },
          ] as { v: Filter; label: string; danger?: boolean }[]).map(({ v, label, danger }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: '7px 14px', borderRadius: '20px',
                border: `1.5px solid ${filter === v ? (danger ? '#C53030' : '#0E1E40') : '#E2E8F0'}`,
                background: filter === v ? (danger ? 'rgba(229,62,62,0.08)' : '#0E1E40') : 'white',
                color: filter === v ? (danger ? '#C53030' : 'white') : '#718096',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                fontFamily: 'Heebo, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="חיפוש משימה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginRight: 'auto', padding: '8px 14px',
            border: '2px solid #E2E8F0', borderRadius: '10px',
            fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
            direction: 'rtl', outline: 'none', minWidth: '180px',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
        />

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          style={{
            padding: '8px 14px', border: '2px solid #E2E8F0', borderRadius: '10px',
            fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
            outline: 'none', background: 'white', cursor: 'pointer', direction: 'rtl',
          }}
        >
          <option value="">כל עדיפויות</option>
          <option value="high">עדיפות גבוהה</option>
          <option value="medium">עדיפות בינונית</option>
          <option value="low">עדיפות נמוכה</option>
        </select>
      </div>

      {/* Tasks list */}
      <div style={{
        background: 'white', borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <div>טוען משימות...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
              {filter === 'overdue' ? '🎉' : filter === 'completed' ? '📋' : '✅'}
            </div>
            <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1rem', color: '#0E1E40' }}>
              {filter === 'overdue' ? 'אין משימות באיחור!' : filter === 'completed' ? 'אין משימות שהושלמו' : 'אין משימות ממתינות'}
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              {filter === 'overdue' ? 'מצוין! כל המשימות בזמן.' : 'משימות מתווספות מתוך פרטי ליד.'}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((task, i) => {
              const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < now
              const pColor = PRIORITY_COLORS[task.priority]
              const pBg = PRIORITY_BG[task.priority]
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #F7F9FC' : 'none',
                    background: task.completed ? '#FAFBFC' : isOverdue ? 'rgba(229,62,62,0.03)' : 'white',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#C9A84C', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      color: task.completed ? '#A0AEC0' : '#0E1E40',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px', flexWrap: 'wrap' }}>
                      {task.due_date && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: isOverdue && !task.completed ? '#C53030' : '#718096',
                          fontWeight: isOverdue && !task.completed ? 700 : 400,
                        }}>
                          {isOverdue && !task.completed ? '⚠️ ' : '📅 '}
                          {new Date(task.due_date).toLocaleDateString('he-IL')}
                        </span>
                      )}
                      {task.lead_id && (
                        <a
                          href={`/crm/leads/${task.lead_id}`}
                          style={{ fontSize: '0.72rem', color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          → פתח ליד
                        </a>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px',
                    background: pBg, color: pColor,
                    fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#CBD5E0', fontSize: '0.9rem', padding: '4px 6px',
                      transition: 'color 0.2s', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#E53E3E' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#CBD5E0' }}
                    title="מחק משימה"
                  >
                    🗑
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p style={{ color: '#A0AEC0', fontSize: '0.78rem', textAlign: 'center', marginTop: '16px' }}>
        משימות מתווספות ומנוהלות מתוך עמוד ליד ספציפי
      </p>
    </div>
  )
}
