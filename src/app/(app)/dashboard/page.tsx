import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TOPICS } from '@/lib/topics'
import { formatScore, formatDate } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sessions }, { data: failed }, { count: totalQ }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('exam_sessions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('user_failed').select('question_id').eq('user_id', user!.id),
    supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const allSessions   = sessions ?? []
  const failedCount   = (failed ?? []).length
  const qCount        = totalQ ?? 490
  const totalExams    = profile?.total_exams ?? 0
  const avgScore      = allSessions.length ? allSessions.reduce((a, s) => a + Number(s.score), 0) / allSessions.length : 0
  const totalAnswered = allSessions.reduce((a, s) => a + s.n_correct + s.n_wrong + s.n_blank, 0)
  const totalCorrect  = allSessions.reduce((a, s) => a + s.n_correct, 0)
  const hitRate       = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const streak        = profile?.streak ?? 0

  const topicStats: Record<string, { exams: number; avgScore: number; correct: number; wrong: number }> = {}
  for (const t of TOPICS) {
    const ts = allSessions.filter(s => s.topics.includes(t.id))
    topicStats[t.id] = {
      exams:    ts.length,
      avgScore: ts.length ? ts.reduce((a, s) => a + Number(s.score), 0) / ts.length : 0,
      correct:  ts.reduce((a, s) => a + s.n_correct, 0),
      wrong:    ts.reduce((a, s) => a + s.n_wrong, 0),
    }
  }

  const weakest = TOPICS
    .filter(t => topicStats[t.id].exams > 0)
    .sort((a, b) => topicStats[a.id].avgScore - topicStats[b.id].avgScore)[0]

  // Accent colors per card
  const rightCards = [
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=60&mode=exam&minutes=75',
      tag: 'Simulacro oficial',
      title: '60 preguntas',
      sub: '75 min · penalización activa',
      icon: '🎯',
      color: '#5b4cf5', bg: '#ede9fe', borderColor: 'rgba(91,76,245,.2)',
    },
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=20&mode=study&minutes=999',
      tag: 'Sin presión',
      title: 'Estudio libre',
      sub: 'Feedback instantáneo',
      icon: '📖',
      color: '#0284c7', bg: '#e0f2fe', borderColor: 'rgba(2,132,199,.2)',
    },
    {
      href: weakest
        ? `/exam?topics=${weakest.id}&n=20&mode=exam&minutes=30`
        : '/setup',
      tag: 'Mi punto débil',
      title: weakest ? weakest.full : 'Sin datos aún',
      sub: weakest ? `${formatScore(topicStats[weakest.id].avgScore)}/10 de media` : 'Haz un examen primero',
      icon: '💀',
      color: '#dc2626', bg: '#fee2e2', borderColor: 'rgba(220,38,38,.2)',
    },
    {
      href: `/exam?topics=tema6,tema7,tema8,tema9,tema10&n=20&mode=exam&minutes=30&notFailed=1`,
      tag: 'Preguntas frescas',
      title: 'Sin fallar antes',
      sub: failedCount > 0 ? `Excluye ${failedCount} ya falladas` : 'Todas disponibles',
      icon: '🆕',
      color: '#059669', bg: '#d1fae5', borderColor: 'rgba(5,150,105,.2)',
    },
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=10&mode=exam&minutes=10',
      tag: 'Relámpago ⚡',
      title: '10 preg · 10 min',
      sub: 'Repaso express rápido',
      icon: '⚡',
      color: '#d97706', bg: '#fef3c7', borderColor: 'rgba(217,119,6,.2)',
    },
  ]

  const stats = [
    {
      value: String(qCount),
      label: 'Preguntas en banco',
      sub: 'activas',
      icon: '📚',
      iconBg: '#ede9fe', iconColor: '#5b4cf5',
    },
    {
      value: String(totalAnswered),
      label: 'Respondidas',
      sub: `en ${totalExams} exámenes`,
      icon: '✅',
      iconBg: '#dcfce7', iconColor: '#16a34a',
    },
    {
      value: totalAnswered > 0 ? `${hitRate}%` : '—',
      label: 'Tasa de acierto',
      sub: totalAnswered > 0 ? `${totalCorrect} correctas` : 'sin datos aún',
      icon: '🎯',
      iconBg: '#fef3c7', iconColor: '#d97706',
    },
    {
      value: String(totalExams),
      label: 'Exámenes hechos',
      sub: streak > 0 ? `🔥 ${streak} días seguidos` : 'empieza hoy',
      icon: '🏆',
      iconBg: '#e0f2fe', iconColor: '#0284c7',
    },
  ]

  return (
    <>
      <style>{`
        .dash-stat:hover { background: var(--bg2) !important; }
        .right-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.1) !important; transform: translateY(-3px) !important; }
        .topic-pill:hover { transform: translateY(-2px); box-shadow: var(--shadow) !important; }
        .topic-row:hover  { background: var(--bg2); }
        .session-row:hover{ background: var(--bg2); }
        .main-cta:hover   { box-shadow: 0 24px 64px rgba(91,76,245,.45) !important; transform: translateY(-4px) !important; }
        .main-cta:hover .cta-arrow { background: rgba(255,255,255,.25) !important; border-color: rgba(255,255,255,.5) !important; }
        .right-card:hover .card-arrow { background: currentColor !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="animate-up stagger">
          {/* Context badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 99,
              background: 'var(--brand-soft)', border: '1px solid rgba(91,76,245,.18)',
              fontSize: '.72rem', fontWeight: 700, color: 'var(--brand)',
              letterSpacing: '.05em', textTransform: 'uppercase',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--brand)',
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(91,76,245,.2)',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }} />
              Vokab · Comunitaria II · UAX · 3.º
            </div>
          </div>

          <h1 className="hero-title" style={{ marginBottom: 18, maxWidth: 780 }}>
            Tu <em>progreso</em> real,{' '}
            pregunta a pregunta.
          </h1>

          <p style={{ fontSize: '1.02rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 540, marginBottom: 28 }}>
            Banco de{' '}
            <strong style={{ color: 'var(--ink)' }}>{qCount} preguntas</strong>{' '}
            sobre los temas 6–10. Modo examen con penalización
            y modo estudio con feedback inmediato. Tu racha se guarda.
          </p>

          {/* Quick-action pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/setup" className="btn btn-brand" style={{ padding: '11px 24px', borderRadius: 12 }}>
              Nuevo examen →
            </Link>
            <Link href="/browse" className="btn btn-ghost" style={{ padding: '11px 24px', borderRadius: 12 }}>
              Explorar temas
            </Link>
            {failedCount > 0 && (
              <Link
                href="/exam?topics=tema6,tema7,tema8,tema9,tema10&n=20&mode=study&minutes=30&onlyFailed=1"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '11px 20px', borderRadius: 12,
                  background: '#fee2e2', border: '1px solid rgba(220,38,38,.2)',
                  color: 'var(--err)', textDecoration: 'none',
                  fontSize: '.875rem', fontWeight: 700,
                }}>
                Repasar {failedCount} falladas
              </Link>
            )}
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────────── */}
        <section className="animate-up" style={{ animationDelay: '.08s' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            border: '1px solid var(--border)', borderRadius: 20,
            background: 'var(--card)', overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {stats.map((s, i) => (
              <div key={i} className="dash-stat" style={{
                padding: '24px 24px 20px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                transition: 'background .2s', cursor: 'default',
              }}>
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                  background: s.iconBg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.1rem',
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-.04em',
                  lineHeight: 1, color: s.iconColor, marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARD GRID ─────────────────────────────────────── */}
        <section className="animate-up" style={{ animationDelay: '.15s' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 14,
            alignItems: 'stretch',
          }}>

            {/* ── Big purple CTA ── */}
            <Link href="/setup" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <div className="main-cta" style={{
                height: '100%',
                background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #5b4cf5 100%)',
                borderRadius: 22,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '34px', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'all .28s cubic-bezier(.22,1,.36,1)',
                boxShadow: '0 12px 48px rgba(91,76,245,.35), 0 4px 16px rgba(91,76,245,.2)',
              }}>
                {/* Decorative orbs */}
                <div style={{
                  position: 'absolute', bottom: -80, right: -60,
                  width: 280, height: 280, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  animation: 'float 7s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'absolute', top: -40, right: 80,
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  animation: 'floatAlt 9s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                {/* Shimmer overlay */}
                <div className="shimmer" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .4,
                }} />

                <div style={{ position: 'relative' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 99,
                    background: 'rgba(255,255,255,.1)',
                    border: '1px solid rgba(255,255,255,.15)',
                    fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,.7)',
                    marginBottom: 20,
                  }}>
                    ✦ Empezar ahora
                  </div>
                  <h2 style={{
                    fontSize: '2.3rem', fontWeight: 900, letterSpacing: '-.04em',
                    lineHeight: 1.08, color: '#fff', marginBottom: 14,
                  }}>
                    Nuevo examen<br />tipo test
                  </h2>
                  <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.75, maxWidth: 320 }}>
                    Elige temas, cantidad de preguntas, modo y tiempo.
                    Reparto equilibrado. Penalización opcional.
                  </p>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', position: 'relative', marginTop: 36,
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 99,
                    background: 'rgba(255,255,255,.08)',
                    border: '1px solid rgba(255,255,255,.15)',
                    fontSize: '.77rem', fontWeight: 600, color: 'rgba(255,255,255,.75)',
                  }}>
                    📚 {qCount} preguntas disponibles
                  </div>
                  <div className="cta-arrow" style={{
                    width: 42, height: 42, borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,.25)',
                    background: 'rgba(255,255,255,.1)',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0,
                    transition: 'all .2s',
                  }}>→</div>
                </div>
              </div>
            </Link>

            {/* ── Right 2×3 mini cards ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 14,
            }}>
              {rightCards.map((card, i) => (
                <Link key={i} href={card.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="right-card" style={{
                    height: '100%', cursor: 'pointer', padding: '18px 18px 16px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    background: 'var(--card)', border: `1.5px solid ${card.borderColor}`,
                    borderRadius: 16,
                    boxShadow: `0 2px 12px ${card.color}18`,
                    transition: 'all .22s cubic-bezier(.22,1,.36,1)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Subtle tinted top */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: card.color, opacity: .7, borderRadius: '16px 16px 0 0',
                    }} />

                    <div>
                      {/* Icon */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, marginBottom: 10,
                        background: card.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                      }}>
                        {card.icon}
                      </div>
                      <div style={{
                        fontSize: '.64rem', fontWeight: 700, letterSpacing: '.07em',
                        textTransform: 'uppercase', color: card.color,
                        marginBottom: 5, opacity: .85,
                      }}>{card.tag}</div>
                      <h3 style={{
                        fontSize: '.97rem', fontWeight: 800, letterSpacing: '-.015em',
                        color: 'var(--ink)', lineHeight: 1.25,
                      }}>{card.title}</h3>
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginTop: 14,
                    }}>
                      <span style={{
                        fontSize: '.72rem', fontWeight: 600,
                        color: 'var(--muted)', lineHeight: 1.4, paddingRight: 6,
                      }}>
                        {card.sub}
                      </span>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        border: `1.5px solid ${card.borderColor}`,
                        background: card.bg,
                        color: card.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.8rem', transition: 'all .2s',
                        fontWeight: 700,
                      }}>→</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── "Por un solo tema" row ── */}
          <div style={{ marginTop: 14 }}>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 18, padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8,
              }}>
                <div>
                  <div style={{
                    fontSize: '.67rem', fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
                  }}>Por tema</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                    Examen específico de un tema
                  </h3>
                </div>
                <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                  20 preguntas · 30 min
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {TOPICS.map(t => {
                  const st = topicStats[t.id]
                  const hasData = st.exams > 0
                  const pct = Math.round(st.avgScore * 10)
                  return (
                    <Link
                      key={t.id}
                      href={`/exam?topics=${t.id}&n=20&mode=exam&minutes=30`}
                      className="topic-pill"
                      style={{
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', borderRadius: 13,
                        border: `1.5px solid ${t.color}28`,
                        background: t.tint,
                        transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                        flex: '1 1 160px',
                        boxShadow: `0 2px 8px ${t.color}18`,
                      }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: t.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.65rem', fontWeight: 900,
                        boxShadow: `0 4px 10px ${t.color}40`,
                      }}>{t.short}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: t.color, marginBottom: 2 }}>{t.full}</div>
                        {hasData ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 4, borderRadius: 99, background: `${t.color}22`, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: t.color, borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: '.65rem', fontWeight: 800, color: t.color, flexShrink: 0 }}>
                              {formatScore(st.avgScore)}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '.67rem', color: t.color, opacity: .5 }}>Sin datos</div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── TOPIC PROGRESS ────────────────────────────────── */}
        <section className="animate-up" style={{ animationDelay: '.2s' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 18,
          }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-.015em', color: 'var(--ink)' }}>
                Progreso por tema
              </h2>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>
                Basado en tus últimos {allSessions.length} exámenes
              </p>
            </div>
            <Link href="/ranking" style={{
              fontSize: '.8rem', fontWeight: 700, color: 'var(--brand)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Ver ranking global →
            </Link>
          </div>

          <div style={{
            border: '1px solid var(--border)', borderRadius: 18,
            background: 'var(--card)', overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {TOPICS.map((t, i) => {
              const st = topicStats[t.id]
              const pct = Math.min(100, Math.round(st.avgScore * 10))
              const hasData = st.exams > 0
              const scoreColor = !hasData ? 'var(--muted2)' : pct >= 70 ? 'var(--ok)' : pct >= 50 ? t.color : 'var(--err)'
              return (
                <div key={t.id} className="topic-row" style={{
                  display: 'grid', gridTemplateColumns: '1fr 200px 80px',
                  alignItems: 'center', gap: 20, padding: '18px 24px',
                  borderBottom: i < TOPICS.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: t.tint, border: `1.5px solid ${t.color}28`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.65rem', fontWeight: 900, color: t.color,
                      boxShadow: `0 2px 6px ${t.color}20`,
                    }}>{t.short}</div>
                    <div>
                      <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}>{t.full}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>
                        {hasData
                          ? `${st.exams} exámen${st.exams > 1 ? 'es' : ''} · ${st.correct} ✓ ${st.wrong} ✗`
                          : 'Sin datos — ¡empieza ya!'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{
                        width: hasData ? `${pct}%` : '0%',
                        background: hasData
                          ? pct >= 70 ? 'var(--ok)' : pct >= 50 ? t.color : 'var(--err)'
                          : 'var(--border-2)',
                      }} />
                    </div>
                    <span style={{ fontSize: '.7rem', color: 'var(--muted)', flexShrink: 0, width: 30, textAlign: 'right' }}>
                      {hasData ? `${pct}%` : ''}
                    </span>
                  </div>

                  <div style={{
                    textAlign: 'right', fontWeight: 900, fontSize: '.95rem', color: scoreColor,
                  }}>
                    {hasData ? `${formatScore(st.avgScore)}/10` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── RECENT ACTIVITY ───────────────────────────────── */}
        {allSessions.length > 0 && (
          <section className="animate-up" style={{ animationDelay: '.24s' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-.015em', marginBottom: 18, color: 'var(--ink)' }}>
              Actividad reciente
            </h2>
            <div style={{
              border: '1px solid var(--border)', borderRadius: 18,
              background: 'var(--card)', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 90px 80px 72px',
                padding: '10px 24px', borderBottom: '1px solid var(--border)',
                fontSize: '.67rem', fontWeight: 700, letterSpacing: '.07em',
                textTransform: 'uppercase', color: 'var(--muted2)', gap: 16,
              }}>
                <span>Examen</span>
                <span>Fecha</span>
                <span style={{ textAlign: 'center' }}>Resultado</span>
                <span style={{ textAlign: 'center' }}>Modo</span>
                <span style={{ textAlign: 'right' }}>Nota</span>
              </div>
              {allSessions.map((s, i) => {
                const score  = Number(s.score)
                const passed = score >= 5
                return (
                  <div key={s.id} className="session-row" style={{
                    display: 'grid', gridTemplateColumns: '1fr 110px 90px 80px 72px',
                    alignItems: 'center', padding: '14px 24px', gap: 16,
                    borderBottom: i < allSessions.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background .15s',
                  }}>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {s.topics.map((t: string) => t.replace('tema', 'T')).join(', ')}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>
                        {s.n_total} preguntas · {s.n_correct} ✓ · {s.n_wrong} ✗ · {s.n_blank} en blanco
                      </div>
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{formatDate(s.created_at)}</div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: passed ? 'var(--ok-soft)' : 'var(--err-soft)',
                        color: passed ? 'var(--ok)' : 'var(--err)',
                      }}>{passed ? '✓ Aprobado' : '✗ Suspenso'}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)' }}>
                      {s.mode === 'study' ? '📖 Estudio' : '📝 Examen'}
                    </div>
                    <div style={{
                      textAlign: 'right', fontWeight: 900, fontSize: '1.05rem',
                      color: passed ? 'var(--ok)' : 'var(--err)',
                    }}>
                      {formatScore(score)}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────── */}
        {totalExams === 0 && (
          <section className="animate-up" style={{ animationDelay: '.2s' }}>
            <div style={{
              border: '2px dashed var(--brand-soft)',
              background: 'linear-gradient(135deg, var(--purple-soft) 0%, #fafaf9 100%)',
              borderRadius: 22, padding: '64px 40px', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -60, right: -40,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(91,76,245,.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{ fontSize: '3rem', marginBottom: 16 }} className="animate-float">🚀</div>
              <h3 style={{
                fontWeight: 900, fontSize: '1.4rem', marginBottom: 10,
                letterSpacing: '-.025em', color: 'var(--ink)',
              }}>
                ¡Tu primera pregunta te espera!
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7 }}>
                {qCount} preguntas, {TOPICS.length} temas. Cada examen actualiza tu progreso
                y tu posición en el ranking global.
              </p>
              <Link href="/setup" className="btn btn-brand"
                style={{ padding: '13px 36px', fontSize: '.95rem', borderRadius: 13 }}>
                Configurar mi primer examen →
              </Link>
            </div>
          </section>
        )}

      </div>
    </>
  )
}
