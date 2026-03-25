'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  LeadDetail, LeadStatus, LeadSource,
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS, BANK_UPDATE_STATUSES,
} from '@/lib/types'

function apiHeaders() {
  const pw = sessionStorage.getItem('crm_pw') || ''
  return { 'Content-Type': 'application/json', 'x-crm-password': pw }
}

function fmtDate(dt: string | null | undefined) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1px solid #E2E8F0', marginBottom: '16px',
      overflow: 'hidden', boxShadow: '0 2px 8px rgba(14,30,64,.04)',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #F0F4F8',
        fontWeight: 800, fontSize: '.95rem', color: '#1A1A2E',
      }}>
        {title}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '.75rem', color: '#8492A6', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '.92rem', color: value ? '#1A1A2E' : '#CBD5E0', fontFamily: mono ? 'monospace' : 'inherit', direction: mono ? 'ltr' : 'rtl', display: 'inline-block' }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [newTask, setNewTask] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')

  async function fetchLead() {
    const res = await fetch(`/api/leads/${id}`, { headers: apiHeaders() })
    if (res.ok) {
      const data = await res.json()
      setLead(data.data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchLead() }, [id])

  async function updateField(field: string, value: unknown) {
    setSaving(true)
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify({ [field]: value }),
    })
    await fetchLead()
    setSaving(false)
  }

  async function addNote() {
    if (!newNote.trim()) return
    await fetch(`/api/leads/${id}/notes`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ content: newNote }),
    })
    setNewNote('')
    fetchLead()
  }

  async function addTask() {
    if (!newTask.trim()) return
    await fetch(`/api/leads/${id}/tasks`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ title: newTask, due_date: newTaskDue || null }),
    })
    setNewTask('')
    setNewTaskDue('')
    fetchLead()
  }

  async function toggleTask(taskId: string, done: boolean) {
    await fetch(`/api/leads/${id}/tasks`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify({ task_id: taskId, done }),
    })
    fetchLead()
  }

  async function toggleDoc(docId: string, received: boolean) {
    await fetch(`/api/leads/${id}/documents`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify({ doc_id: docId, received }),
    })
    fetchLead()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F7F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Heebo', sans-serif" }}>
      <span style={{ color: '#8492A6' }}>טוען...</span>
    </div>
  )

  if (!lead) return (
    <div style={{ minHeight: '100vh', background: '#F7F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Heebo', sans-serif" }}>
      <span style={{ color: '#EF4444' }}>ליד לא נמצא</span>
    </div>
  )

  const q = lead.questionnaire

  return (
    <div style={{
      minHeight: '100vh', background: '#F7F9FC',
      fontFamily: "'Heebo', sans-serif", direction: 'rtl',
    }}>

      {/* Top bar */}
      <div style={{
        background: '#0E1E40', padding: '0 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/crm')}
            style={{
              background: 'rgba(255,255,255,.08)', border: 'none',
              color: 'rgba(255,255,255,.7)', padding: '7px 14px',
              borderRadius: '8px', cursor: 'pointer',
              fontFamily: "'Heebo', sans-serif", fontSize: '.85rem',
            }}
          >
            ← חזרה
          </button>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'לידים', href: '/crm' },
              { label: 'לקוחות', href: '/crm/clients' },
              { label: 'פגישות', href: '/crm/meetings' },
              { label: 'מסמכים', href: '/crm/documents' },
              { label: 'הגדרות', href: '/crm/settings' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                color: 'rgba(255,255,255,.45)',
                fontSize: '.82rem',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
              }}>
                {item.label}
              </a>
            ))}
          </nav>
          <span style={{ color: '#fff', fontWeight: 700 }}>{lead.name}</span>
          {saving && <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>שומר...</span>}
        </div>
        <div style={{
          color: '#E8C96A', fontWeight: 800, fontSize: '.9rem',
        }}>
          {lead.estimated_refund_min && lead.estimated_refund_max
            ? `₪${lead.estimated_refund_min.toLocaleString()}–₪${lead.estimated_refund_max.toLocaleString()}`
            : 'טרם הוערך'}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Status + Pipeline */}
          <Section title="סטטוס ופייפליין">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '10px' }}>
                סטטוס נוכחי
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(s => {
                  const active = lead.status === s
                  const color = LEAD_STATUS_COLORS[s]
                  return (
                    <button
                      key={s}
                      onClick={() => updateField('status', s)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px',
                        border: `2px solid ${active ? color : '#E2E8F0'}`,
                        background: active ? `${color}22` : 'transparent',
                        color: active ? color : '#4A5568',
                        fontFamily: "'Heebo', sans-serif", fontSize: '.82rem',
                        fontWeight: active ? 800 : 500, cursor: 'pointer',
                        transition: 'all .2s',
                      }}
                    >
                      {LEAD_STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '6px' }}>
                  מקור ליד
                </label>
                <select
                  value={lead.source}
                  onChange={e => updateField('source', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif", fontSize: '.88rem', outline: 'none' }}
                >
                  {(Object.keys(LEAD_SOURCE_LABELS) as LeadSource[]).map(s => (
                    <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '6px' }}>
                  עדכון חשבון בנק
                </label>
                <select
                  value={lead.bank_update_status || 'לא עודכן'}
                  onChange={e => updateField('bank_update_status', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif", fontSize: '.88rem', outline: 'none' }}
                >
                  {BANK_UPDATE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '6px' }}>
                  תאריך מעקב הבא
                </label>
                <input
                  type="date"
                  defaultValue={lead.next_followup_date?.slice(0, 10) || ''}
                  onBlur={e => e.target.value && updateField('next_followup_date', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif", fontSize: '.88rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '6px' }}>
                  סכום החזר בפועל (₪)
                </label>
                <input
                  type="number"
                  defaultValue={lead.actual_refund_amount || ''}
                  onBlur={e => updateField('actual_refund_amount', Number(e.target.value) || null)}
                  placeholder="0"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif", fontSize: '.88rem', outline: 'none', direction: 'ltr' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.78rem', color: '#8492A6', fontWeight: 700, marginBottom: '6px' }}>
                  שת"פ / הפניה
                </label>
                <input
                  type="text"
                  defaultValue={lead.partner || ''}
                  onBlur={e => updateField('partner', e.target.value || null)}
                  placeholder="שם שותף / מפנה"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: "'Heebo', sans-serif", fontSize: '.88rem', outline: 'none' }}
                />
              </div>
            </div>
          </Section>

          {/* Notes */}
          <Section title={`הערות (${lead.notes_list?.length || 0})`}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="הוסף הערה..."
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px',
                  borderRadius: '10px', border: '1px solid #E2E8F0',
                  fontFamily: "'Heebo', sans-serif", fontSize: '.88rem',
                  outline: 'none', resize: 'none', direction: 'rtl',
                }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                style={{
                  padding: '0 16px',
                  background: newNote.trim() ? '#0E1E40' : '#E2E8F0',
                  color: newNote.trim() ? '#fff' : '#8492A6',
                  border: 'none', borderRadius: '10px',
                  fontFamily: "'Heebo', sans-serif",
                  cursor: newNote.trim() ? 'pointer' : 'default',
                  fontWeight: 700, fontSize: '.85rem',
                }}
              >
                הוסף
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(lead.notes_list || []).map(note => (
                <div key={note.id} style={{
                  background: '#F7F9FC', borderRadius: '10px',
                  padding: '12px 16px', border: '1px solid #EFF2F8',
                }}>
                  <div style={{ fontSize: '.9rem', color: '#1A1A2E', lineHeight: 1.6, marginBottom: '6px' }}>
                    {note.content}
                  </div>
                  <div style={{ fontSize: '.72rem', color: '#8492A6' }}>
                    {note.author} · {fmtDate(note.created_at)}
                  </div>
                </div>
              ))}
              {!lead.notes_list?.length && (
                <p style={{ color: '#8492A6', fontSize: '.85rem', textAlign: 'center', padding: '12px 0' }}>
                  אין הערות עדיין
                </p>
              )}
            </div>
          </Section>

          {/* Tasks */}
          <Section title={`משימות (${lead.tasks_list?.filter(t => !t.done).length || 0} פתוחות)`}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="כותרת משימה..."
                style={{
                  flex: 1, minWidth: '160px', padding: '9px 14px',
                  borderRadius: '8px', border: '1px solid #E2E8F0',
                  fontFamily: "'Heebo', sans-serif", fontSize: '.88rem',
                  outline: 'none',
                }}
              />
              <input
                type="date"
                value={newTaskDue}
                onChange={e => setNewTaskDue(e.target.value)}
                style={{
                  padding: '9px 12px', borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontFamily: "'Heebo', sans-serif", fontSize: '.85rem', outline: 'none',
                }}
              />
              <button
                onClick={addTask}
                disabled={!newTask.trim()}
                style={{
                  padding: '9px 16px',
                  background: newTask.trim() ? '#0E1E40' : '#E2E8F0',
                  color: newTask.trim() ? '#fff' : '#8492A6',
                  border: 'none', borderRadius: '8px',
                  fontFamily: "'Heebo', sans-serif",
                  cursor: newTask.trim() ? 'pointer' : 'default',
                  fontWeight: 700,
                }}
              >
                + הוסף
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(lead.tasks_list || []).map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: task.done ? '#F0FDF4' : '#F7F9FC',
                  border: `1px solid ${task.done ? '#BBF7D0' : '#EFF2F8'}`,
                }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={e => toggleTask(task.id, e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981' }}
                  />
                  <span style={{
                    flex: 1, fontSize: '.88rem', color: task.done ? '#6B7280' : '#1A1A2E',
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span style={{
                      fontSize: '.75rem',
                      color: !task.done && new Date(task.due_date) < new Date() ? '#EF4444' : '#8492A6',
                      fontWeight: !task.done && new Date(task.due_date) < new Date() ? 700 : 400,
                      whiteSpace: 'nowrap',
                    }}>
                      {new Date(task.due_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
              {!lead.tasks_list?.length && (
                <p style={{ color: '#8492A6', fontSize: '.85rem', textAlign: 'center', padding: '12px 0' }}>
                  אין משימות
                </p>
              )}
            </div>
          </Section>

          {/* Questionnaire answers */}
          {q && (
            <Section title="תשובות השאלון">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Field label="סוג תעסוקה" value={q.employment_type} />
                <Field label="שנות בדיקה" value={q.years_to_check?.join(', ')} />
                <Field label="החליף מעסיק" value={q.changed_employer ? `כן (${q.num_employers || 1} מעסיקים)` : 'לא'} />
                <Field label="עבד במקביל" value={q.parallel_jobs ? 'כן' : 'לא'} />
                <Field label="חופשת לידה" value={q.maternity_leave ? 'כן' : 'לא'} />
                <Field label="מילואים" value={q.military_reserve ? 'כן' : 'לא'} />
                <Field label="אבטלה" value={q.unemployment ? 'כן' : 'לא'} />
                <Field label={'חל"ת'} value={q.unpaid_leave ? 'כן' : 'לא'} />
                <Field label="מספר ילדים" value={q.num_children} />
                <Field label="גיל הקטן ביותר" value={q.youngest_child_age} />
                <Field label="תואר אקדמי" value={q.academic_degree ? 'כן' : 'לא'} />
                <Field label="ישוב מזכה" value={q.periphery_resident == null ? 'לא יודע' : q.periphery_resident ? 'כן' : 'לא'} />
                <Field label="תרומות" value={q.donations ? `כן (${q.donation_amount || 'לא צוין'})` : 'לא'} />
                <Field label="הפקדות עצמאיות" value={q.self_deposits ? 'כן' : 'לא'} />
                <Field label="טווח הכנסה" value={q.income_range} />
                <Field label="הגיש החזר בעבר" value={q.previous_tax_return ? 'כן' : 'לא'} />
                <Field label="יכול להעלות מסמכים" value={q.can_upload_docs ? 'כן' : 'לא'} />
              </div>
            </Section>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>

          {/* Contact info */}
          <Section title="פרטי קשר">
            <Field label="שם מלא" value={lead.name} />
            <Field label="טלפון" value={lead.phone} mono />
            <Field label="אימייל" value={lead.email} mono />
            <Field label='ת"ז' value={lead.id_number} mono />
            <Field label="עיר" value={lead.city} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' as const }}>
              {lead.phone && (
                <a
                  href={`https://wa.me/972${lead.phone.replace(/^0/, '').replace(/\D/g, '')}?text=שלום ${lead.name}, אני אלמוג בן דוד. רציתי לעדכן אותך לגבי בקשת החזר המס שלך.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '9px 16px', borderRadius: '8px',
                    background: '#25D36622', color: '#25D366',
                    border: '1px solid #25D36644',
                    fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  💬 וואטסאפ
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  style={{
                    padding: '9px 16px', borderRadius: '8px',
                    background: '#EFF2F8', color: '#4A5568',
                    border: '1px solid #E2E8F0',
                    fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  📞 התקשר
                </a>
              )}
            </div>
          </Section>

          {/* Financial summary */}
          <Section title="סיכום פיננסי">
            <div style={{
              background: 'linear-gradient(135deg, #0E1E40, #1B3358)',
              borderRadius: '12px', padding: '16px', marginBottom: '12px', textAlign: 'center',
            }}>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.78rem', marginBottom: '6px' }}>
                הערכת החזר משוערת
              </div>
              <div style={{ color: '#E8C96A', fontSize: '1.6rem', fontWeight: 900 }}>
                {lead.estimated_refund_min && lead.estimated_refund_max
                  ? `₪${lead.estimated_refund_min.toLocaleString()}–₪${lead.estimated_refund_max.toLocaleString()}`
                  : 'לא הוערך'}
              </div>
            </div>
            {lead.actual_refund_amount && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: '10px', padding: '12px', textAlign: 'center',
              }}>
                <div style={{ color: '#059669', fontSize: '.78rem', fontWeight: 700 }}>סכום החזר בפועל</div>
                <div style={{ color: '#059669', fontSize: '1.4rem', fontWeight: 900 }}>
                  ₪{lead.actual_refund_amount.toLocaleString()}
                </div>
              </div>
            )}
            <Field label="ציון ליד" value={`${lead.score}/10 — ${lead.score_label === 'hot' ? 'חם' : lead.score_label === 'warm' ? 'בינוני' : 'קר'}`} />
          </Section>

          {/* Documents */}
          <Section title={`מסמכים (${lead.documents?.filter(d => d.received).length || 0}/${lead.documents?.length || 0})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(lead.documents || []).map(doc => (
                <label key={doc.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', padding: '8px 10px', borderRadius: '8px',
                  background: doc.received ? '#F0FDF4' : '#F7F9FC',
                  border: `1px solid ${doc.received ? '#BBF7D0' : '#EFF2F8'}`,
                  transition: 'background .2s',
                }}>
                  <input
                    type="checkbox"
                    checked={doc.received}
                    onChange={e => toggleDoc(doc.id, e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#10B981', flexShrink: 0 }}
                  />
                  <span style={{
                    fontSize: '.82rem',
                    color: doc.received ? '#059669' : '#4A5568',
                    flex: 1, lineHeight: 1.4,
                  }}>
                    {doc.name}
                  </span>
                  {doc.received && doc.received_at && (
                    <span style={{ fontSize: '.7rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {new Date(doc.received_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </Section>

          {/* Meta */}
          <Section title="מידע נוסף">
            <Field label="נוצר בתאריך" value={fmtDate(lead.created_at)} />
            <Field label="עודכן לאחרונה" value={fmtDate(lead.updated_at)} />
            <Field label="מזהה ליד" value={lead.id} mono />
          </Section>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 900px) {
          .lead-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
