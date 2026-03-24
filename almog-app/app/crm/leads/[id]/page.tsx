'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Lead, LeadNote, Task, DocumentItem, QuestionnaireResponse,
  STATUS_LABELS, STATUS_COLORS, STATUS_BG,
  EMPLOYMENT_LABELS, INCOME_RANGE_LABELS, DEFAULT_DOCS,
} from '@/lib/types'

const SPECIAL_LABELS: Record<string, string> = {
  disability: 'נכות', new_immigrant: 'עולה חדש', divorced: 'גרוש/ה',
  single_parent: 'הורה יחיד', soldier: 'שחרור מצבאי', periphery: 'פריפריה',
  bereaved: 'שכול', spouse_not_working: 'בן/בת זוג לא עובד',
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [qResponse, setQResponse] = useState<QuestionnaireResponse | null>(null)
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [savingNote, setSavingNote] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'tasks' | 'docs'>('info')

  useEffect(() => {
    fetchLeadData()
  }, [id])

  const fetchLeadData = async () => {
    setLoading(true)
    const [leadRes, qRes, notesRes, tasksRes, docsRes] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('questionnaire_responses').select('*').eq('lead_id', id).maybeSingle(),
      supabase.from('lead_notes').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('lead_id', id).order('due_date', { ascending: true }),
      supabase.from('document_checklist').select('*').eq('lead_id', id).order('required', { ascending: false }),
    ])

    if (leadRes.error || !leadRes.data) {
      router.replace('/crm/leads')
      return
    }

    setLead(leadRes.data)
    setQResponse(qRes.data)
    setNotes(notesRes.data || [])
    setTasks(tasksRes.data || [])

    // If no docs, create default ones
    const existingDocs = docsRes.data || []
    if (existingDocs.length === 0) {
      const defaultDocs = DEFAULT_DOCS.map(name => ({
        lead_id: id,
        doc_name: name,
        required: true,
        received: false,
      }))
      const { data: createdDocs } = await supabase.from('document_checklist').insert(defaultDocs).select()
      setDocs(createdDocs || [])
    } else {
      setDocs(existingDocs)
    }

    setLoading(false)
  }

  const updateStatus = async (newStatus: Lead['status']) => {
    if (!lead) return
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    if (!error) setLead({ ...lead, status: newStatus })
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setSavingNote(true)
    const { data, error } = await supabase.from('lead_notes').insert({
      lead_id: id,
      content: newNote.trim(),
      created_by: 'almog',
    }).select().single()
    if (!error && data) {
      setNotes([data, ...notes])
      setNewNote('')
    }
    setSavingNote(false)
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    setSavingTask(true)
    const { data, error } = await supabase.from('tasks').insert({
      lead_id: id,
      title: newTaskTitle.trim(),
      due_date: newTaskDate || null,
      priority: newTaskPriority,
      completed: false,
    }).select().single()
    if (!error && data) {
      setTasks([...tasks, data])
      setNewTaskTitle('')
      setNewTaskDate('')
    }
    setSavingTask(false)
  }

  const toggleTask = async (task: Task) => {
    const { error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
    }
  }

  const toggleDoc = async (doc: DocumentItem) => {
    const { error } = await supabase.from('document_checklist').update({ received: !doc.received }).eq('id', doc.id)
    if (!error) {
      setDocs(docs.map(d => d.id === doc.id ? { ...d, received: !d.received } : d))
    }
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#718096', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <div>טוען...</div>
      </div>
    )
  }

  if (!lead) return null

  const statusColor = STATUS_COLORS[lead.status]
  const statusBg = STATUS_BG[lead.status]
  const scoreColor = lead.qualification_score >= 60 ? '#15803D' : lead.qualification_score >= 30 ? '#B7860A' : '#374151'
  const scoreBg = lead.qualification_score >= 60 ? 'rgba(34,197,94,0.1)' : lead.qualification_score >= 30 ? 'rgba(201,168,76,0.1)' : 'rgba(107,114,128,0.1)'
  const waNumber = `972${lead.phone.replace(/^0/, '').replace(/-/g, '')}`

  const priorityColors = { low: '#15803D', medium: '#B7860A', high: '#C53030' }
  const priorityBg = { low: 'rgba(34,197,94,0.1)', medium: 'rgba(201,168,76,0.1)', high: 'rgba(229,62,62,0.1)' }
  const priorityLabels = { low: 'נמוכה', medium: 'בינונית', high: 'גבוהה' }

  return (
    <div style={{ direction: 'rtl', maxWidth: '900px' }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#718096', fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '20px', padding: 0,
        }}
      >
        → חזרה לרשימה
      </button>

      {/* Lead Header */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 28px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#0E1E40', fontSize: '1.3rem',
              flexShrink: 0,
            }}>
              {lead.full_name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0E1E40', marginBottom: '4px' }}>
                {lead.full_name}
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a href={`tel:${lead.phone}`} style={{ color: '#4A5568', fontSize: '0.9rem', textDecoration: 'none', direction: 'ltr' }}>
                  📞 {lead.phone}
                </a>
                {lead.email && (
                  <a href={`mailto:${lead.email}`} style={{ color: '#4A5568', fontSize: '0.9rem', textDecoration: 'none' }}>
                    ✉️ {lead.email}
                  </a>
                )}
                <span style={{ color: '#718096', fontSize: '0.8rem' }}>
                  {new Date(lead.created_at).toLocaleDateString('he-IL')}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              padding: '6px 16px', borderRadius: '20px',
              background: scoreBg, color: scoreColor,
              fontWeight: 900, fontSize: '0.9rem',
            }}>
              ציון: {lead.qualification_score}
            </span>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: '#25D366', color: 'white',
                fontWeight: 700, fontSize: '0.88rem',
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              💬 וואטסאפ
            </a>
          </div>
        </div>

        {/* Status Selector */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F7F9FC' }}>
          <div style={{ marginBottom: '10px', fontSize: '0.82rem', fontWeight: 700, color: '#718096' }}>
            שנה סטטוס:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const isActive = lead.status === status
              const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS]
              const bg = STATUS_BG[status as keyof typeof STATUS_BG]
              return (
                <button
                  key={status}
                  onClick={() => updateStatus(status as Lead['status'])}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: `2px solid ${isActive ? color : '#E2E8F0'}`,
                    background: isActive ? bg : 'white',
                    color: isActive ? color : '#718096',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontFamily: 'Heebo, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'white', borderRadius: '12px', padding: '4px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
        marginBottom: '20px', flexWrap: 'wrap',
      }}>
        {[
          { id: 'info', label: '📋 פרטי שאלון' },
          { id: 'notes', label: `📝 הערות (${notes.length})` },
          { id: 'tasks', label: `✅ משימות (${tasks.filter(t => !t.completed).length})` },
          { id: 'docs', label: `📁 מסמכים (${docs.filter(d => d.received).length}/${docs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === tab.id ? '#0E1E40' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#718096',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '24px 28px',
        boxShadow: '0 2px 12px rgba(14,30,64,0.06)', border: '1px solid #E2E8F0',
      }}>

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div>
            <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '20px', fontSize: '1rem' }}>
              📋 תשובות שאלון
            </h3>
            {!qResponse ? (
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>לא נמצאו תשובות שאלון עבור ליד זה</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="info-grid">
                {[
                  { label: 'שנות מס', value: qResponse.years?.join(', ') || '–' },
                  { label: 'סטטוס תעסוקה', value: EMPLOYMENT_LABELS[qResponse.employment_type] || '–' },
                  { label: 'החלפת עבודה', value: qResponse.changed_jobs ? `כן (${qResponse.changed_jobs_count || ''} פעמים)` : 'לא' },
                  { label: 'ילדים', value: qResponse.children_count > 0 ? `כן (${qResponse.children_count})` : 'לא' },
                  { label: 'חופשת לידה', value: qResponse.maternity_leave ? 'כן' : 'לא' },
                  { label: 'תואר אקדמי', value: qResponse.academic_degree ? `כן${qResponse.degree_year ? ` (${qResponse.degree_year})` : ''}` : 'לא' },
                  { label: 'תרומות', value: qResponse.donations ? `כן${qResponse.donations_amount ? ` (₪${qResponse.donations_amount.toLocaleString()})` : ''}` : 'לא' },
                  { label: 'עיר מגורים', value: qResponse.city || '–' },
                  { label: 'טווח הכנסה', value: INCOME_RANGE_LABELS[qResponse.income_range] || '–' },
                  {
                    label: 'נקודות מיוחדות',
                    value: qResponse.special_points?.length > 0
                      ? qResponse.special_points.map(p => SPECIAL_LABELS[p] || p).join(', ')
                      : 'אין',
                  },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: '#F7F9FC',
                    border: '1px solid #E2E8F0',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div>
            <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '20px', fontSize: '1rem' }}>
              📝 הערות
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="הוסף הערה..."
                rows={3}
                style={{
                  flex: 1, padding: '12px 16px',
                  border: '2px solid #E2E8F0', borderRadius: '10px',
                  fontSize: '0.9rem', fontFamily: 'Heebo, sans-serif',
                  direction: 'rtl', outline: 'none', resize: 'vertical',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#C9A84C' }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#E2E8F0' }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim() || savingNote}
                style={{
                  padding: '12px 20px',
                  background: newNote.trim() ? 'linear-gradient(135deg, #C9A84C, #E8C96A)' : '#E2E8F0',
                  color: newNote.trim() ? '#0E1E40' : '#A0AEC0',
                  fontWeight: 700, fontSize: '0.88rem',
                  border: 'none', borderRadius: '10px', cursor: newNote.trim() ? 'pointer' : 'default',
                  fontFamily: 'Heebo, sans-serif', alignSelf: 'flex-end',
                  minWidth: '80px',
                }}
              >
                {savingNote ? '...' : 'הוסף'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notes.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
                  אין הערות עדיין
                </p>
              ) : notes.map((note) => (
                <div key={note.id} style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: '#F7F9FC',
                  border: 'right: 4px solid #C9A84C',
                  borderRight: '3px solid #C9A84C',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#0E1E40', fontSize: '0.82rem' }}>
                      {note.created_by}
                    </span>
                    <span style={{ color: '#718096', fontSize: '0.75rem' }}>
                      {new Date(note.created_at).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <p style={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div>
            <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '20px', fontSize: '1rem' }}>
              ✅ משימות
            </h3>
            <div style={{
              padding: '16px',
              background: '#F7F9FC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="תנאי משימה..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  style={{
                    flex: '2 1 200px', padding: '10px 14px',
                    border: '2px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
                    direction: 'rtl', outline: 'none', background: 'white',
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                />
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  style={{
                    flex: '1 1 140px', padding: '10px 14px',
                    border: '2px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
                    outline: 'none', background: 'white', cursor: 'pointer',
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#C9A84C' }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E2E8F0' }}
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  style={{
                    padding: '10px 14px', border: '2px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
                    outline: 'none', background: 'white', cursor: 'pointer',
                  }}
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
                <button
                  onClick={addTask}
                  disabled={!newTaskTitle.trim() || savingTask}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                    color: '#0E1E40', fontWeight: 700, fontSize: '0.88rem',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  {savingTask ? '...' : '+ הוסף'}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
                  אין משימות עדיין
                </p>
              ) : tasks.map((task) => {
                const pColor = priorityColors[task.priority]
                const pBg = priorityBg[task.priority]
                const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date()
                return (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: task.completed ? '#F7F9FC' : isOverdue ? 'rgba(229,62,62,0.04)' : 'white',
                    border: `1px solid ${task.completed ? '#E2E8F0' : isOverdue ? 'rgba(229,62,62,0.2)' : '#E2E8F0'}`,
                    transition: 'all 0.2s',
                  }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#C9A84C', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600, color: task.completed ? '#A0AEC0' : '#0E1E40',
                        fontSize: '0.9rem',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </div>
                      {task.due_date && (
                        <div style={{ fontSize: '0.75rem', color: isOverdue && !task.completed ? '#E53E3E' : '#718096', marginTop: '2px' }}>
                          {isOverdue && !task.completed ? '⚠️ ' : '📅 '}
                          {new Date(task.due_date).toLocaleDateString('he-IL')}
                        </div>
                      )}
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px',
                      background: pBg, color: pColor,
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {priorityLabels[task.priority]}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#CBD5E0', fontSize: '0.9rem', padding: '4px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#E53E3E' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#CBD5E0' }}
                    >
                      🗑
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <div>
            <h3 style={{ fontWeight: 800, color: '#0E1E40', marginBottom: '8px', fontSize: '1rem' }}>
              📁 צ'קליסט מסמכים
            </h3>
            <p style={{ color: '#718096', fontSize: '0.82rem', marginBottom: '20px' }}>
              {docs.filter(d => d.received).length} מתוך {docs.length} מסמכים התקבלו
            </p>
            <div style={{
              height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px',
            }}>
              <div style={{
                height: '100%',
                width: `${docs.length > 0 ? (docs.filter(d => d.received).length / docs.length) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
                borderRadius: '3px', transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: doc.received ? 'rgba(34,197,94,0.05)' : 'white',
                    border: `1px solid ${doc.received ? 'rgba(34,197,94,0.2)' : '#E2E8F0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    border: `2px solid ${doc.received ? '#22C55E' : '#CBD5E0'}`,
                    background: doc.received ? '#22C55E' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'white', fontSize: '0.75rem', fontWeight: 800,
                  }}>
                    {doc.received ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      color: doc.received ? '#15803D' : '#0E1E40',
                      textDecoration: doc.received ? 'none' : 'none',
                    }}>
                      {doc.doc_name}
                    </span>
                    {doc.required && !doc.received && (
                      <span style={{ marginRight: '8px', fontSize: '0.72rem', color: '#C2410C' }}>חובה</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: doc.received ? '#15803D' : '#A0AEC0' }}>
                    {doc.received ? 'התקבל' : 'חסר'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
