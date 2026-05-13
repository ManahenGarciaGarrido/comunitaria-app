'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TOPICS } from '@/lib/topics'
import type { TopicId, ExamMode } from '@/lib/types'

export default function SetupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const onlyFailed = params.get('failed') === '1'

  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>(['tema6','tema7','tema8','tema9','tema10'])
  const [n, setN] = useState(20)
  const [mode, setMode] = useState<ExamMode>('exam')
  const [minutes, setMinutes] = useState(30)

  function toggle(id: TopicId) {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function start() {
    if (selectedTopics.length === 0) return
    const query = new URLSearchParams({
      topics: selectedTopics.join(','),
      n: n.toString(),
      mode,
      minutes: minutes.toString(),
      ...(onlyFailed ? { failed: '1' } : {}),
    })
    router.push(`/exam?${query}`)
  }

  return (
    <div className="flex flex-col gap-5 animate-up">
      <div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>Configurar examen</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Elige los temas, el número de preguntas y el modo</p>
      </div>

      {/* Topics */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Temas</h2>
        <div className="flex flex-col gap-2">
          {TOPICS.map(t => {
            const selected = selectedTopics.includes(t.id)
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, border: '2px solid',
                  borderColor: selected ? t.color : 'var(--line)',
                  background: selected ? t.tint : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800 }}>
                  {t.short}
                </span>
                <span style={{ flex: 1, fontSize: '.85rem', fontWeight: selected ? 700 : 500, color: selected ? t.color : 'var(--ink-2)' }}>
                  {t.full}
                </span>
                {selected && <span style={{ color: t.color, fontSize: '.9rem' }}>✓</span>}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '4px 10px' }} onClick={() => setSelectedTopics(TOPICS.map(t => t.id))}>Todos</button>
          <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '4px 10px' }} onClick={() => setSelectedTopics([])}>Ninguno</button>
        </div>
      </div>

      {/* Options */}
      <div className="card flex flex-col gap-5">
        <div>
          <label style={{ fontWeight: 700, fontSize: '.9rem', display: 'block', marginBottom: 8 }}>
            Número de preguntas: <strong style={{ color: 'var(--accent)' }}>{n}</strong>
          </label>
          <input
            type="range" min={5} max={100} value={n}
            onChange={e => setN(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>
            <span>5</span><span>100</span>
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '.9rem', display: 'block', marginBottom: 8 }}>Modo</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['exam','study'] as ExamMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '10px', borderRadius: 10, border: '2px solid',
                  borderColor: mode === m ? 'var(--accent)' : 'var(--line)',
                  background: mode === m ? 'var(--accent-soft)' : 'transparent',
                  cursor: 'pointer', fontWeight: mode === m ? 700 : 500,
                  color: mode === m ? 'var(--accent)' : 'var(--ink-2)',
                  fontSize: '.85rem',
                }}
              >
                {m === 'exam' ? '📝 Examen' : '📖 Estudio'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 6 }}>
            {mode === 'exam' ? 'Resultados al terminar · penalización activa' : 'Feedback inmediato tras cada pregunta'}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 700, fontSize: '.9rem', display: 'block', marginBottom: 8 }}>
            Tiempo límite: <strong style={{ color: 'var(--accent)' }}>{minutes} min</strong>
          </label>
          <input
            type="range" min={5} max={120} step={5} value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {onlyFailed && (
        <div style={{ background: 'var(--warn-soft)', color: 'var(--warn)', padding: '10px 14px', borderRadius: 10, fontSize: '.82rem', fontWeight: 600 }}>
          🔁 Solo se incluirán las preguntas que hayas fallado anteriormente
        </div>
      )}

      <button
        className="btn btn-accent"
        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        onClick={start}
        disabled={selectedTopics.length === 0}
      >
        Empezar examen →
      </button>
    </div>
  )
}
