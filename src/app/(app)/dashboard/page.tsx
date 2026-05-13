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

  const allSessions = sessions ?? []
  const failedCount = (failed ?? []).length

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
  const bestScore = allSessions.length
    ? Math.max(...allSessions.map(s => Number(s.score)))
    : 0

  return (
    <div className="flex flex-col gap-5 animate-up">

      {/* ── Hero banner ── */}
      <div style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, var(--accent) 0%, #1a3329 100%)',
        padding: '28px 28px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(45,74,62,.35), 0 2px 8px rgba(45,74,62,.2)',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 60, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
          <div>
            <div style={{ fontSize: '.78rem', opacity: .65, fontWeight: 500, marginBottom: 6, letterSpacing: '.03em', textTransform: 'uppercase' }}>
              Bienvenida de nuevo
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: 6, letterSpacing: '-.02em' }}>
              @{profile?.username}
            </h1>
            <div style={{ fontSize: '.85rem', opacity: .75, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>📝 {totalExams} examen{totalExams !== 1 ? 'es' : ''}</span>
              <span>📊 Media: <strong style={{ opacity: 1 }}>{formatScore(avgScore)}/10</strong></span>
              {bestScore > 0 && <span>🏅 Mejor: <strong style={{ opacity: 1 }}>{formatScore(bestScore)}/10</strong></span>}
            </div>
          </div>

          {/* Streak */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {(profile?.streak ?? 0) > 0 ? (
              <div style={{
                background: 'rgba(255,255,255,.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: 14,
                padding: '12px 20px',
                border: '1px solid rgba(255,255,255,.15)',
              }}>
                <div style={{ fontSize: '2rem', lineHeight: 1 }}>🔥</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, marginTop: 4 }}>{profile?.streak}</div>
                <div style={{ fontSize: '.68rem', opacity: .7, marginTop: 2, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>días seguidos</div>
                {(profile?.best_streak ?? 0) > 1 && (
                  <div style={{ fontSize: '.68rem', opacity: .55, marginTop: 3 }}>Máx. {profile?.best_streak}</div>
                )}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,.08)',
                borderRadius: 14,
                padding: '12px 20px',
                border: '1px solid rgba(255,255,255,.1)',
                fontSize: '.8rem',
                opacity: .6,
              }}>
                🌱 Sin racha<br />¡empieza hoy!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick stats row ── */}
      {totalExams > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Exámenes', value: totalExams, icon: '📝', color: 'var(--accent)', bg: 'var(--accent-soft)' },
            { label: 'Nota media', value: `${formatScore(avgScore)}/10`, icon: '📊', color: Number(avgScore) >= 5 ? 'var(--ok)' : 'var(--err)', bg: Number(avgScore) >= 5 ? 'var(--ok-soft)' : 'var(--err-soft)' },
            { label: 'Falladas', value: failedCount, icon: '🔁', color: failedCount > 0 ? 'var(--warn)' : 'var(--ok)', bg: failedCount > 0 ? 'var(--warn-soft)' : 'var(--ok-soft)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Link href="/setup" className="card card-hover" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 20px', cursor: 'pointer', borderColor: 'var(--accent)', borderWidth: 1.5 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: 12,
            boxShadow: '0 4px 12px rgba(45,74,62,.3)',
          }}>📝</div>
          <div style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: 4, fontSize: '.95rem' }}>Nuevo examen</div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>Configura temas,<br />modo y tiempo</div>
        </Link>

        <Link href="/setup?failed=1" className="card card-hover" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 20px', cursor: 'pointer', opacity: failedCount === 0 ? .6 : 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: failedCount > 0 ? 'var(--warn-soft)' : 'var(--bg2)',
            color: failedCount > 0 ? 'var(--warn)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: 12,
            border: `1.5px solid ${failedCount > 0 ? 'rgba(146,88,13,.2)' : 'var(--border)'}`,
          }}>🔁</div>
          <div style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: 4, fontSize: '.95rem' }}>Repasar falladas</div>
          <div style={{ fontSize: '.78rem', color: failedCount > 0 ? 'var(--warn)' : 'var(--muted)', fontWeight: failedCount > 0 ? 700 : 400 }}>
            {failedCount > 0 ? `${failedCount} pregunta${failedCount !== 1 ? 's' : ''} pendiente${failedCount !== 1 ? 's' : ''}` : 'Todo correcto 🎉'}
          </div>
        </Link>
      </div>

      {/* ── Topic progress ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>Progreso por tema</h2>
          <Link href="/ranking" style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Ver ranking →
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {TOPICS.map(t => {
            const st = topicStats[t.id]
            const pct = Math.min(100, st.avgScore * 10)
            return (
              <div key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--ink2)' }}>
                      <span style={{ color: t.color, fontWeight: 800 }}>{t.short}</span> · {t.full}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {st.exams > 0 && (
                      <span style={{ fontSize: '.7rem', color: 'var(--muted2)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: 99 }}>
                        {st.exams} ex.
                      </span>
                    )}
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: st.exams > 0 ? (st.avgScore >= 5 ? 'var(--ok)' : 'var(--err)') : 'var(--muted2)' }}>
                      {st.exams > 0 ? `${formatScore(st.avgScore)}/10` : '—'}
                    </span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: st.exams > 0 ? t.color : 'var(--border2)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent exams ── */}
      {allSessions.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)' }}>Últimos exámenes</h2>
          </div>
          {allSessions.map((s, i) => {
            const score = Number(s.score)
            const passed = score >= 5
            return (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderBottom: i < allSessions.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: passed ? 'var(--ok-soft)' : 'var(--err-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.85rem',
                    flexShrink: 0,
                  }}>
                    {passed ? '✅' : '❌'}
                  </div>
                  <div>
                    <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)' }}>
                      {s.topics.map((t: string) => t.replace('tema', 'T')).join(', ')} · {s.n_total} preguntas
                    </div>
                    <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: 1 }}>
                      {formatDate(s.created_at)} · {s.mode === 'study' ? '📖 Estudio' : '📝 Examen'}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  color: passed ? 'var(--ok)' : 'var(--err)',
                  minWidth: 52,
                  textAlign: 'right',
                }}>
                  {formatScore(score)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* First time empty state */}
      {totalExams === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚀</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>¡Empieza tu primer examen!</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: 20 }}>
            490 preguntas de Enfermería Familiar y Comunitaria II te esperan.
          </p>
          <Link href="/setup" className="btn btn-accent" style={{ padding: '11px 28px' }}>
            Configurar examen →
          </Link>
        </div>
      )}

    </div>
  )
}
