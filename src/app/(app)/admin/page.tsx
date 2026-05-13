'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOPICS } from '@/lib/topics'
import type { Question, TopicId } from '@/lib/types'

type Tab = 'questions' | 'add' | 'users'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [users, setUsers] = useState<{ id: string; username: string; role: string; total_exams: number; streak: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTopic, setFilterTopic] = useState<'all' | TopicId>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [search, setSearch] = useState('')

  // Add question form
  const [newQ, setNewQ] = useState({ topic: 'tema6' as TopicId, question: '', answers: ['', '', '', ''] })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }

      const [{ data: qs }, { data: us }] = await Promise.all([
        supabase.from('questions').select('*').order('id', { ascending: true }),
        supabase.from('profiles').select('id, username, role, total_exams, streak').order('total_exams', { ascending: false }),
      ])
      setQuestions(qs ?? [])
      setUsers(us ?? [])
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line

  async function toggleActive(q: Question) {
    await supabase.from('questions').update({ is_active: !q.is_active }).eq('id', q.id)
    setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_active: !item.is_active } : item))
  }

  async function deleteQuestion(id: number) {
    if (!confirm('¿Seguro que quieres eliminar esta pregunta? Esta acción no se puede deshacer.')) return
    await supabase.from('questions').delete().eq('id', id)
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  async function setUserRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  async function addQuestion() {
    if (!newQ.question.trim()) { setSaveMsg('❌ La pregunta no puede estar vacía.'); return }
    const filled = newQ.answers.filter(a => a.trim())
    if (filled.length < 2) { setSaveMsg('❌ Necesitas al menos 2 respuestas.'); return }
    if (!newQ.answers[0].trim()) { setSaveMsg('❌ La primera respuesta debe ser la correcta.'); return }

    setSaving(true)
    setSaveMsg('')

    // Get next id for topic
    const prefix = parseInt(newQ.topic.replace('tema', '')) * 100 + 1
    const existingInTopic = questions.filter(q => q.topic === newQ.topic).map(q => q.id)
    let nextId = prefix
    while (existingInTopic.includes(nextId)) nextId++

    const answers = newQ.answers.filter(a => a.trim())
    const { error } = await supabase.from('questions').insert({
      id: nextId,
      topic: newQ.topic,
      question: newQ.question.trim(),
      answers,
      is_active: true,
    })

    if (error) {
      setSaveMsg(`❌ Error: ${error.message}`)
    } else {
      setSaveMsg('✅ Pregunta añadida correctamente')
      setNewQ({ topic: newQ.topic, question: '', answers: ['', '', '', ''] })
      // Reload questions
      const { data: qs } = await supabase.from('questions').select('*').order('id', { ascending: true })
      setQuestions(qs ?? [])
    }
    setSaving(false)
  }

  const filteredQs = questions.filter(q => {
    if (filterTopic !== 'all' && q.topic !== filterTopic) return false
    if (filterActive === 'active' && !q.is_active) return false
    if (filterActive === 'inactive' && q.is_active) return false
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const tabStyle = (t: Tab) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: tab === t ? 700 : 500,
    fontSize: '.85rem',
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? '#fff' : 'var(--ink-2)',
    transition: 'all .15s',
  })

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Cargando panel…</div>

  return (
    <div className="flex flex-col gap-5 animate-up">
      <div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>Panel de administración</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
          {questions.length} preguntas · {questions.filter(q => q.is_active).length} activas · {users.length} usuarios
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 4, borderRadius: 10 }}>
        <button style={tabStyle('questions')} onClick={() => setTab('questions')}>📋 Preguntas</button>
        <button style={tabStyle('add')} onClick={() => setTab('add')}>➕ Añadir</button>
        <button style={tabStyle('users')} onClick={() => setTab('users')}>👥 Usuarios</button>
      </div>

      {/* Questions tab */}
      {tab === 'questions' && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="card flex flex-col gap-3" style={{ padding: '12px 16px' }}>
            <input
              className="input"
              placeholder="Buscar pregunta…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="input"
                style={{ width: 'auto', padding: '6px 10px' }}
                value={filterTopic}
                onChange={e => setFilterTopic(e.target.value as any)}
              >
                <option value="all">Todos los temas</option>
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.short} – {t.full}</option>)}
              </select>
              <select
                className="input"
                style={{ width: 'auto', padding: '6px 10px' }}
                value={filterActive}
                onChange={e => setFilterActive(e.target.value as any)}
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
              <span style={{ fontSize: '.8rem', color: 'var(--muted)', alignSelf: 'center' }}>
                {filteredQs.length} resultado{filteredQs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredQs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No hay preguntas con estos filtros.</div>
            ) : (
              filteredQs.map(q => {
                const topic = TOPICS.find(t => t.id === q.topic)
                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--line)',
                      opacity: q.is_active ? 1 : 0.5,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: topic?.tint, color: topic?.color, fontSize: '.68rem' }}>{topic?.short}</span>
                          <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>#{q.id}</span>
                          {!q.is_active && <span style={{ fontSize: '.68rem', background: 'var(--err-soft)', color: 'var(--err)', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>INACTIVA</span>}
                        </div>
                        <p style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.4 }}>{q.question}</p>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                          {(q.answers as string[]).map((a, i) => (
                            <span key={i} style={{ marginRight: 8, color: i === 0 ? 'var(--ok)' : 'var(--muted)' }}>
                              {i === 0 ? '✓' : '·'} {a}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: '.72rem', padding: '4px 10px' }}
                          onClick={() => toggleActive(q)}
                        >
                          {q.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '.72rem', padding: '4px 10px' }}
                          onClick={() => deleteQuestion(q.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Add question tab */}
      {tab === 'add' && (
        <div className="card flex flex-col gap-4">
          <h2 style={{ fontWeight: 700, fontSize: '.95rem' }}>Nueva pregunta</h2>

          <div>
            <label style={{ fontWeight: 600, fontSize: '.85rem', display: 'block', marginBottom: 6 }}>Tema</label>
            <select
              className="input"
              value={newQ.topic}
              onChange={e => setNewQ(p => ({ ...p, topic: e.target.value as TopicId }))}
            >
              {TOPICS.map(t => <option key={t.id} value={t.id}>{t.short} – {t.full}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, fontSize: '.85rem', display: 'block', marginBottom: 6 }}>Enunciado</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Escribe la pregunta aquí…"
              value={newQ.question}
              onChange={e => setNewQ(p => ({ ...p, question: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, fontSize: '.85rem', display: 'block', marginBottom: 6 }}>
              Respuestas <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(la primera es la correcta)</span>
            </label>
            <div className="flex flex-col gap-2">
              {newQ.answers.map((ans, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: i === 0 ? 'var(--ok)' : 'var(--muted)', width: 20, textAlign: 'center', flexShrink: 0 }}>
                    {i === 0 ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  <input
                    className="input"
                    style={{ marginBottom: 0, borderColor: i === 0 ? 'var(--ok)' : undefined }}
                    placeholder={i === 0 ? 'Respuesta correcta' : `Distractor ${i}`}
                    value={ans}
                    onChange={e => setNewQ(p => ({ ...p, answers: p.answers.map((a, j) => j === i ? e.target.value : a) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {saveMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: saveMsg.startsWith('✅') ? 'var(--ok-soft)' : 'var(--err-soft)', color: saveMsg.startsWith('✅') ? 'var(--ok)' : 'var(--err)', fontWeight: 600, fontSize: '.85rem' }}>
              {saveMsg}
            </div>
          )}

          <button
            className="btn btn-accent"
            style={{ width: '100%', padding: '12px' }}
            onClick={addQuestion}
            disabled={saving}
          >
            {saving ? 'Guardando…' : '➕ Añadir pregunta'}
          </button>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '1fr 80px 70px 70px', gap: 8, fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700 }}>
            <span>Usuario</span>
            <span style={{ textAlign: 'right' }}>Exámenes</span>
            <span style={{ textAlign: 'right' }}>Racha</span>
            <span style={{ textAlign: 'right' }}>Rol</span>
          </div>
          {users.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No hay usuarios registrados.</div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 70px', gap: 8, padding: '11px 16px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.85rem' }}>@{u.username}</div>
                  {u.role === 'admin' && <span style={{ fontSize: '.68rem', background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>ADMIN</span>}
                </div>
                <div style={{ textAlign: 'right', fontSize: '.82rem', color: 'var(--muted)' }}>{u.total_exams}</div>
                <div style={{ textAlign: 'right', fontSize: '.82rem', color: 'var(--warn)' }}>{u.streak > 0 ? `🔥${u.streak}` : '—'}</div>
                <div style={{ textAlign: 'right' }}>
                  <select
                    style={{ fontSize: '.72rem', padding: '3px 6px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer' }}
                    value={u.role}
                    onChange={e => setUserRole(u.id, e.target.value)}
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
