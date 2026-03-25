'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Lead, LeadNote, Task, DocumentItem, QuestionnaireResponse,
  STATUS_LABELS, IncomeRange,
  EMPLOYMENT_LABELS, INCOME_RANGE_LABELS, DEFAULT_DOCS,
} from '@/lib/types'

const SPECIAL_LABELS: Record<string, string> = {
  disability: 'נכות', new_immigrant: 'עולה חדש', divorced: 'גרוש/ה',
  single_parent: 'הורה יחיד', soldier: 'שחרור מצבאי', periphery: 'פריפריה',
  bereaved: 'שכול', spouse_not_working: 'בן/בת זוג לא עובד',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '10px',
  paddingBottom: '6px',
  borderBottom: '1px solid #e5e7eb',
}

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  padding: '14px',
  marginBottom: '10px',
}

const fieldLabel: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#9ca3af',
  fontWeight: 600,
  marginBottom: '2px',
}

const fieldValue: React.CSSProperties = {
  fontSize: '0.84rem',
  color: '#111827',
  fontWeight: 500,
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
    const existingDocs = docsRes.data || []
    if (existingDocs.length === 0) {
      const defaultDocs = DEFAULT_DOCS.map(name => ({
        lead_id: id, doc_name: name, required: true, received: false,
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
      lead_id: id, content: newNote.trim(), created_by: 'almog',
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
      lead_id: id, title: newTaskTitle.trim(),
      due_date: newTaskDate || null, priority: newTaskPriority, completed: false,
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
    if (!error) setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  const toggleDoc = async (doc: DocumentItem) => {
    const { error } = await supabase.from('document_checklist').update({ received: !doc.received }).eq('id', doc.id)
    if (!error) setDocs(docs.map(d => d.id === doc.id ? { ...d, received: !d.received } : d))
  }

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '0.84rem' }}>
        טוען...
      </div>
    )
  }

  if (!lead) return null

  const waNumber = `972${lead.phone.replace(/^0/, '').replace(/-/g, '')}`
  const priorityLabels = { low: 'נמוכה', medium: 'בינונית', high: 'גבוהה' }

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Back + Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'Heebo, sans-serif', padding: 0,
          }}
        >
          ← חזרה לרשימה
        </button>
        <span style={{ color: '#d1d5db' }}>|</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{lead.name}</span>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginRight: 'auto' }}>
          ציון: {lead.score}
        </span>
      </div>

      {/* 3-column layout */}
      <div className="lead-columns" style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        gap: '12px',
        alignItems: 'start',
      }}>

        {/* ===== RIGHT COLUMN: Personal details + Status + Contact ===== */}
        <div>
          {/* Personal details */}
          <div style={card}>
            <div style={sectionTitle}>פרטים אישיים</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={fieldLabel}>שם מלא</div>
                <div style={fieldValue}>{lead.name}</div>
              </div>
              <div>
                <div style={fieldLabel}>טלפון</div>
                <div style={{ ...fieldValue, direction: 'ltr', textAlign: 'right' }}>
                  <a href={`tel:${lead.phone}`} style={{ color: '#374151', textDecoration: 'none' }}>{lead.phone}</a>
                </div>
              </div>
              {lead.email && (
                <div>
                  <div style={fieldLabel}>אימייל</div>
                  <div style={fieldValue}>
                    <a href={`mailto:${lead.email}`} style={{ color: '#374151', textDecoration: 'none', wordBreak: 'break-all' }}>
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}
              {(lead.city || qResponse?.city) && (
                <div>
                  <div style={fieldLabel}>עיר</div>
                  <div style={fieldValue}>{lead.city || qResponse?.city}</div>
                </div>
              )}
              <div>
                <div style={fieldLabel}>מקור</div>
                <div style={fieldValue}>{lead.source || '–'}</div>
              </div>
              <div>
                <div style={fieldLabel}>תאריך כניסה</div>
                <div style={fieldValue}>{new Date(lead.created_at).toLocaleDateString('he-IL')}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={card}>
            <div style={sectionTitle}>סטטוס</div>
            <select
              value={lead.status}
              onChange={(e) => updateStatus(e.target.value as Lead['status'])}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid #d1d5db',
                fontSize: '0.84rem',
                fontFamily: 'Heebo, sans-serif',
                direction: 'rtl',
                outline: 'none',
                color: '#374151',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </div>

          {/* Contact actions */}
          <div style={card}>
            <div style={sectionTitle}>פניה</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a
                href={`tel:${lead.phone}`}
                style={{
                  display: 'block', padding: '8px 12px',
                  border: '1px solid #d1d5db', color: '#374151',
                  fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center',
                  background: 'white',
                }}
              >
                התקשר
              </a>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '8px 12px',
                  border: '1px solid #d1d5db', color: '#374151',
                  fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center',
                  background: 'white',
                }}
              >
                וואטסאפ
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  style={{
                    display: 'block', padding: '8px 12px',
                    border: '1px solid #d1d5db', color: '#374151',
                    fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center',
                    background: 'white',
                  }}
                >
                  שלח אימייל
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ===== CENTER COLUMN: Questionnaire + Documents ===== */}
        <div>
          {/* Questionnaire */}
          <div style={card}>
            <div style={sectionTitle}>נתוני שאלון</div>
            {!qResponse ? (
              <p style={{ color: '#9ca3af', fontSize: '0.84rem' }}>לא נמצאו תשובות שאלון</p>
            ) : (
              <div className="q-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'שנות מס', value: qResponse.years_to_check?.join(', ') || '–' },
                  { label: 'סטטוס תעסוקה', value: EMPLOYMENT_LABELS[qResponse.employment_type] || '–' },
                  { label: 'החלפת עבודה', value: qResponse.changed_employer ? `כן (${qResponse.num_employers || ''} פעמים)` : 'לא' },
                  { label: 'ילדים', value: qResponse.num_children > 0 ? `כן (${qResponse.num_children})` : 'לא' },
                  { label: 'חופשת לידה', value: qResponse.maternity_leave ? 'כן' : 'לא' },
                  { label: 'תואר אקדמי', value: qResponse.academic_degree ? `כן${qResponse.degree_year ? ` (${qResponse.degree_year})` : ''}` : 'לא' },
                  { label: 'תרומות', value: qResponse.donations ? `כן${qResponse.donation_amount ? ` (₪${qResponse.donation_amount})` : ''}` : 'לא' },
                  { label: 'טווח הכנסה', value: INCOME_RANGE_LABELS[qResponse.income_range as IncomeRange] || '–' },
                  {
                    label: 'נקודות מיוחדות',
                    value: qResponse.special_points?.length > 0
                      ? qResponse.special_points.map(p => SPECIAL_LABELS[p] || p).join(', ')
                      : 'אין',
                  },
                ].map((item) => (
                  <div key={item.label} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <div style={fieldLabel}>{item.label}</div>
                    <div style={fieldValue}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents checklist */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={sectionTitle as React.CSSProperties}>מסמכים</div>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                {docs.filter(d => d.received).length} / {docs.length}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '3px', background: '#f3f4f6', marginBottom: '12px' }}>
              <div style={{
                height: '100%',
                width: `${docs.length > 0 ? (docs.filter(d => d.received).length / docs.length) * 100 : 0}%`,
                background: '#1c2b47',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px',
                    border: '1px solid #e5e7eb',
                    background: doc.received ? '#f0fdf4' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={doc.received}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', accentColor: '#1c2b47', flexShrink: 0 }}
                  />
                  <span style={{
                    flex: 1, fontSize: '0.82rem',
                    color: doc.received ? '#15803d' : '#374151',
                  }}>
                    {doc.doc_name}
                  </span>
                  {doc.required && !doc.received && (
                    <span style={{ fontSize: '0.68rem', color: '#c2410c' }}>חובה</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== LEFT COLUMN: Notes + Tasks ===== */}
        <div>
          {/* Notes */}
          <div style={card}>
            <div style={sectionTitle}>הערות ({notes.length})</div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="הוסף הערה..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.82rem', fontFamily: 'Heebo, sans-serif',
                  direction: 'rtl', outline: 'none', resize: 'vertical',
                  color: '#374151', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim() || savingNote}
                style={{
                  marginTop: '6px',
                  padding: '6px 14px',
                  background: newNote.trim() ? '#1c2b47' : '#e5e7eb',
                  color: newNote.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontFamily: 'Heebo, sans-serif',
                  cursor: newNote.trim() ? 'pointer' : 'default',
                }}
              >
                {savingNote ? 'שומר...' : 'הוסף הערה'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>
                  אין הערות עדיין
                </p>
              ) : notes.map((note) => (
                <div key={note.id} style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRight: '3px solid #d1d5db',
                  border: '1px solid #e5e7eb',
                  borderRightWidth: '3px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.76rem' }}>{note.created_by}</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                      {new Date(note.created_at).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: '#374151', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div style={card}>
            <div style={sectionTitle}>משימות ({tasks.filter(t => !t.completed).length} פתוחות)</div>
            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="text"
                placeholder="משימה חדשה..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                style={{
                  width: '100%', padding: '7px 10px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.82rem', fontFamily: 'Heebo, sans-serif',
                  direction: 'rtl', outline: 'none',
                  color: '#374151', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  style={{
                    flex: 1, padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.78rem', fontFamily: 'Heebo, sans-serif',
                    outline: 'none', cursor: 'pointer',
                  }}
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  style={{
                    flex: 1, padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.78rem', fontFamily: 'Heebo, sans-serif',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
              </div>
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim() || savingTask}
                style={{
                  padding: '6px 14px',
                  background: newTaskTitle.trim() ? '#1c2b47' : '#e5e7eb',
                  color: newTaskTitle.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontFamily: 'Heebo, sans-serif',
                  cursor: newTaskTitle.trim() ? 'pointer' : 'default',
                }}
              >
                {savingTask ? 'שומר...' : '+ הוסף משימה'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>
                  אין משימות עדיין
                </p>
              ) : tasks.map((task) => {
                const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date()
                return (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    padding: '8px 10px',
                    border: `1px solid ${isOverdue ? '#fca5a5' : '#e5e7eb'}`,
                    background: task.completed ? '#f9fafb' : isOverdue ? '#fff7f7' : 'white',
                  }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      style={{ marginTop: '2px', cursor: 'pointer', accentColor: '#1c2b47', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 500,
                        color: task.completed ? '#9ca3af' : '#374151',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isOverdue && !task.completed ? '#dc2626' : '#9ca3af', marginTop: '2px' }}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : ''}
                        {' '}
                        {priorityLabels[task.priority]}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#d1d5db', fontSize: '0.8rem', padding: '2px', flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#dc2626' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#d1d5db' }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .lead-columns {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .lead-columns {
            grid-template-columns: 1fr !important;
          }
          .q-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
