import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TOPICS } from '@/lib/topics'
import { formatScore, formatDate } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sessions }, { data: failed }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('exam_sessions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('user_failed').select('question_id').eq('user_id', user!.id),
  ])

  const allSessions = (sessions ?? [])
  const failedCount = (failed ?? []).length

  // Topic stats from sessions
  const topicStats: Record<string, { exams: number; avgScore: number }> = {}
  for (const t of TOPICS) {
    const ts = allSessions.filter(s => s.topics.includes(t.id))
    topicStats[t.id] = {
      exams: ts.length,
      avgScore: ts.length ? ts.reduce((a, s) => a + Number(s.score), 0) / ts.length : 0,
    }
  }

  const totalExams = profile?.total_exams ?? 0
  const avgScore = allSessions.length
    ? allSessions.reduce((a, s) => a + Number(s.score), 0) / allSessions.length
    : 0

  return (
    <div className="flex flex-col gap-5 animate-up">
      {/* Header */}
      <div className="card" style={{ background: 'var(--accent)', border: 'none', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '.8rem', opacity: .75, marginBottom: 4 }}>Bienvenida de nuevo</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 2 }}>@{profile?.username}</h1>
            <div style={{ fontSize: '.82rem', opacity: .8 }}>
              {totalExams} examen{totalExams !== 1 ? 'es' : ''} · Nota media: <strong>{formatScore(avgScore)}</strong>/10
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {(profile?.streak ?? 0) > 0 ? (
              <div>
                <div style={{ fontSize: '2rem' }}>🔥</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{profile?.streak}</div>
                <div style={{ fontSize: '.72rem', opacity: .75 }}>días seguidos</div>
              </div>
            ) : (
              <div style={{ opacity: .6, fontSize: '.82rem' }}>Sin racha activa</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Link href="/setup" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: 'box-shadow .15s' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📝</div>
          <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Nuevo examen</div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Configura temas y preguntas</div>
        </Link>
        <Link href="/setup?failed=1" className="card" style={{ textDecoration: 'none', textAlign: 'center', cursor: 'pointer', transition: 'box-shadow .15s' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>🔁</div>
          <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Repasar falladas</div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{failedCount} pregunta{failedCount !== 1 ? 's' : ''} pendiente{failedCount !== 1 ? 's' : ''}</div>
        </Link>
      </div>

      {/* Topic stats */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>Progreso por tema</h2>
        <div className="flex flex-col gap-3">
          {TOPICS.map(t => {
            const st = topicStats[t.id]
            const pct = st.avgScore * 10
            return (
              <div key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 600, color: t.color }}>{t.short} · {t.full}</span>
                  <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                    {st.exams > 0 ? `${formatScore(st.avgScore)}/10` : 'Sin datos'}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--line)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: t.color, width: `${pct}%`, transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent exams */}
      {allSessions.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 14, fontSize: '.95rem' }}>Últimos exámenes</h2>
          <div className="flex flex-col gap-2">
            {allSessions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '.82rem', fontWeight: 600 }}>
                    {s.topics.join(', ')} · {s.n_total} Qs
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{formatDate(s.created_at)}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: Number(s.score) >= 5 ? 'var(--ok)' : 'var(--err)' }}>
                  {formatScore(Number(s.score))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
