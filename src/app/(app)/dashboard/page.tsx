import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TOPICS } from '@/lib/topics'
import { formatScore, formatDate } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sessions }, { data: failed }, { count: totalQ }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('exam_sessions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
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

  const topicStats: Record<string, { exams: number; avgScore: number; correct: number; wrong: number }> = {}
  for (const t of TOPICS) {
    const ts = allSessions.filter(s => s.topics.includes(t.id))
    topicStats[t.id] = {
      exams: ts.length,
      avgScore: ts.length ? ts.reduce((a, s) => a + Number(s.score), 0) / ts.length : 0,
      correct: ts.reduce((a, s) => a + s.n_correct, 0),
      wrong:   ts.reduce((a, s) => a + s.n_wrong, 0),
    }
  }

  // Weakest topic (with data)
  const weakest = TOPICS
    .filter(t => topicStats[t.id].exams > 0)
    .sort((a, b) => topicStats[a.id].avgScore - topicStats[b.id].avgScore)[0]

  const rightCards = [
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=60&mode=exam&minutes=75',
      tag: 'Simulacro oficial',
      title: '60 preguntas · 75 min',
      sub: 'Todos los temas · penalización activa',
      subColor: 'var(--muted)',
      icon: '🎯',
    },
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=20&mode=study&minutes=999',
      tag: 'Modo estudio',
      title: 'Estudio libre',
      sub: 'Sin tiempo · feedback inmediato',
      subColor: 'var(--muted)',
      icon: '📖',
    },
    {
      href: weakest
        ? `/exam?topics=${weakest.id}&n=20&mode=exam&minutes=30`
        : '/setup',
      tag: 'Mi punto débil',
      title: weakest ? weakest.full : 'Sin datos aún',
      sub: weakest
        ? `${formatScore(topicStats[weakest.id].avgScore)}/10 de media`
        : 'Haz un examen primero',
      subColor: weakest ? 'var(--err)' : 'var(--muted)',
      icon: '💀',
    },
    {
      href: `/exam?topics=tema6,tema7,tema8,tema9,tema10&n=20&mode=exam&minutes=30&notFailed=1`,
      tag: 'Sin responder',
      title: 'Preguntas nuevas',
      sub: failedCount > 0 ? `Excluye ${failedCount} falladas` : 'Todas disponibles',
      subColor: 'var(--muted)',
      icon: '🆕',
    },
    {
      href: '/exam?topics=tema6,tema7,tema8,tema9,tema10&n=10&mode=exam&minutes=10',
      tag: 'Relámpago',
      title: '10 preguntas · 10 min',
      sub: 'Para repasar rápido',
      subColor: 'var(--muted)',
      icon: '⚡',
    },
  ]

  return (
    <>
      <style>{`
        .stat-cell:hover  { background: var(--bg2); }
        .topic-row:hover  { background: var(--bg2); }
        .session-row:hover{ background: var(--bg2); }
        .topic-pill:hover { opacity:.75; transform:translateY(-1px); }
        .right-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-3px); border-color:var(--border-2); }
        .right-card:hover .arrow-circle { background:var(--ink); color:#fff; border-color:var(--ink); }
        .main-cta:hover   { box-shadow:var(--shadow-xl); transform:translateY(-3px); background:#243d30; }
        .main-cta:hover .arrow-circle-dark { background:#fff; color:var(--ink); border-color:#fff; }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', gap:48 }}>

        {/* ── HERO ── */}
        <section className="animate-up">
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:22,
            fontSize:'.68rem', fontWeight:700, letterSpacing:'.1em',
            textTransform:'uppercase', color:'var(--muted)',
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block',flexShrink:0}} />
            Enfermería Familiar y Comunitaria II · UAX · 3.º Grado
          </div>

          <h1 className="hero-title" style={{marginBottom:22, maxWidth:820}}>
            Prepara el examen con{' '}
            <em>preguntas tipo test</em>{' '}
            basadas en tu temario.
          </h1>

          <p style={{fontSize:'1rem', color:'var(--muted)', lineHeight:1.7, maxWidth:580}}>
            Banco de <strong style={{color:'var(--ink)'}}>{qCount} preguntas</strong> repartidas
            entre los temas 6–10. Modo examen con penalización por fallos
            (3 mal restan 1 bien) y modo estudio con feedback inmediato.
            Tu progreso queda guardado.
          </p>
        </section>

        {/* ── STATS BAR ── */}
        <section className="animate-up" style={{animationDelay:'.07s'}}>
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(4,1fr)',
            border:'1px solid var(--border)', borderRadius:16,
            background:'var(--card)', overflow:'hidden', boxShadow:'var(--shadow-sm)',
          }}>
            {[
              { value: qCount,        label: 'Preguntas en banco', sub: 'disponibles' },
              { value: totalAnswered, label: 'Respondidas',         sub: `en ${totalExams} exámenes` },
              { value: `${hitRate}%`, label: 'Tasa de acierto',     sub: totalAnswered > 0 ? `${totalCorrect} correctas` : 'sin datos' },
              { value: totalExams,    label: 'Exámenes hechos',     sub: (profile?.streak ?? 0) > 0 ? `🔥 ${profile!.streak} días seguidos` : 'empieza hoy' },
            ].map((s, i) => (
              <div key={i} className="stat-cell" style={{
                padding:'22px 24px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                transition:'background .2s', cursor:'default',
              }}>
                <div style={{fontSize:'2rem', fontWeight:900, letterSpacing:'-.03em', lineHeight:1, color:'var(--ink)', marginBottom:5}}>
                  {s.value}
                </div>
                <div style={{fontSize:'.8rem', fontWeight:700, color:'var(--ink2)', marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:'.72rem', color:'var(--muted)'}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MAIN CARD GRID ── */}
        <section className="animate-up" style={{animationDelay:'.13s'}}>
          {/* Outer grid: left big card + right 2-col grid. Height is driven by the right side. */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'1.45fr 1fr',
            gap:14,
            alignItems:'stretch',
          }}>
            {/* ── Big dark CTA ── */}
            <Link href="/setup" style={{textDecoration:'none'}}>
              <div className="main-cta" style={{
                height:'100%',
                background:'var(--card-dark)',
                border:'1px solid rgba(255,255,255,.07)',
                borderRadius:20,
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                padding:'30px', cursor:'pointer',
                position:'relative', overflow:'hidden',
                transition:'all .25s cubic-bezier(.22,1,.36,1)',
                boxShadow:'var(--shadow)',
              }}>
                <div style={{position:'absolute',bottom:-60,right:-60,width:240,height:240,borderRadius:'50%',background:'rgba(255,255,255,.035)',pointerEvents:'none'}} />
                <div style={{position:'absolute',top:20,right:0,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.02)',pointerEvents:'none'}} />

                <div style={{position:'relative'}}>
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:6, marginBottom:16,
                    fontSize:'.68rem', fontWeight:700, letterSpacing:'.09em',
                    textTransform:'uppercase', color:'rgba(255,255,255,.4)',
                  }}>
                    Empezar
                  </div>
                  <h2 style={{
                    fontSize:'2.1rem', fontWeight:900, letterSpacing:'-.03em',
                    lineHeight:1.1, color:'#fff', marginBottom:18,
                  }}>
                    Nuevo examen tipo test
                  </h2>
                  <p style={{fontSize:'.9rem', color:'rgba(255,255,255,.5)', lineHeight:1.7, maxWidth:340}}>
                    Elige temas, cantidad de preguntas, modo y tiempo.
                    Reparto equilibrado entre los temas seleccionados.
                  </p>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', marginTop:32}}>
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:8,
                    padding:'7px 15px', borderRadius:99,
                    background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)',
                    fontSize:'.76rem', fontWeight:600, color:'rgba(255,255,255,.7)',
                  }}>
                    {qCount} preguntas disponibles
                  </div>
                  <div className="arrow-circle-dark" style={{
                    width:38, height:38, borderRadius:'50%',
                    border:'1.5px solid rgba(255,255,255,.2)',
                    background:'rgba(255,255,255,.08)', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'.95rem', flexShrink:0,
                    transition:'all .2s',
                  }}>→</div>
                </div>
              </div>
            </Link>

            {/* ── Right 2×3 grid ── */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gridTemplateRows:'repeat(3, 1fr)',
              gap:14,
            }}>
              {rightCards.map((card, i) => (
                <Link key={i} href={card.href} style={{textDecoration:'none'}}>
                  <div className="right-card" style={{
                    height:'100%', cursor:'pointer', padding:'20px',
                    display:'flex', flexDirection:'column', justifyContent:'space-between',
                    background:'var(--card)', border:'1px solid var(--border)',
                    borderRadius:16, boxShadow:'var(--shadow-sm)',
                    transition:'all .22s cubic-bezier(.22,1,.36,1)',
                  }}>
                    <div>
                      <div style={{
                        fontSize:'.67rem', fontWeight:700, letterSpacing:'.08em',
                        textTransform:'uppercase', color:'var(--muted)', marginBottom:10,
                      }}>{card.tag}</div>
                      <h3 style={{
                        fontSize:'1.05rem', fontWeight:800, letterSpacing:'-.02em',
                        color:'var(--ink)', lineHeight:1.25,
                      }}>{card.title}</h3>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16}}>
                      <span style={{fontSize:'.74rem', fontWeight:600, color:card.subColor, lineHeight:1.3, paddingRight:8}}>
                        {card.sub}
                      </span>
                      <div className="arrow-circle" style={{
                        width:32, height:32, borderRadius:'50%', flexShrink:0,
                        border:'1.5px solid var(--border-2)',
                        background:'var(--card)', color:'var(--ink)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'.85rem', transition:'all .2s',
                      }}>→</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Por un solo tema (full width below) ── */}
          <div style={{marginTop:14}}>
            <div style={{
              background:'var(--card)', border:'1px solid var(--border)',
              borderRadius:16, padding:'22px 24px', boxShadow:'var(--shadow-sm)',
            }}>
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                marginBottom:16, flexWrap:'wrap', gap:8,
              }}>
                <div>
                  <div style={{fontSize:'.68rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)', marginBottom:6}}>
                    Por un solo tema
                  </div>
                  <h3 style={{fontSize:'1.05rem', fontWeight:800, color:'var(--ink)', letterSpacing:'-.01em'}}>
                    Examen específico
                  </h3>
                </div>
                <span style={{fontSize:'.78rem', color:'var(--muted)'}}>Elige el tema y lanza 20 preguntas directamente</span>
              </div>
              <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                {TOPICS.map(t => {
                  const st = topicStats[t.id]
                  return (
                    <Link
                      key={t.id}
                      href={`/exam?topics=${t.id}&n=20&mode=exam&minutes=30`}
                      className="topic-pill"
                      style={{
                        textDecoration:'none', display:'flex', alignItems:'center', gap:10,
                        padding:'10px 16px', borderRadius:12,
                        border:`1.5px solid ${t.color}33`,
                        background: t.tint,
                        transition:'all .18s cubic-bezier(.22,1,.36,1)',
                        flex:'1 1 160px',
                      }}
                    >
                      <div style={{
                        width:32, height:32, borderRadius:8, flexShrink:0,
                        background: t.color, color:'#fff',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'.65rem', fontWeight:900,
                      }}>{t.short}</div>
                      <div>
                        <div style={{fontSize:'.78rem', fontWeight:700, color:t.color}}>{t.full}</div>
                        <div style={{fontSize:'.68rem', color: st.exams > 0 ? t.color : 'var(--muted)', opacity: st.exams > 0 ? .7 : .5, marginTop:1}}>
                          {st.exams > 0 ? `${formatScore(st.avgScore)}/10` : 'Sin datos'}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── TOPIC PROGRESS ── */}
        <section className="animate-up" style={{animationDelay:'.18s'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:18}}>
            <h2 style={{fontSize:'1.05rem', fontWeight:800, letterSpacing:'-.01em', color:'var(--ink)'}}>Progreso por tema</h2>
            <Link href="/ranking" style={{fontSize:'.8rem', fontWeight:600, color:'var(--accent)', textDecoration:'none'}}>
              Ver ranking global →
            </Link>
          </div>
          <div style={{border:'1px solid var(--border)', borderRadius:16, background:'var(--card)', overflow:'hidden', boxShadow:'var(--shadow-sm)'}}>
            {TOPICS.map((t, i) => {
              const st = topicStats[t.id]
              const pct = Math.min(100, st.avgScore * 10)
              const hasData = st.exams > 0
              return (
                <div key={t.id} className="topic-row" style={{
                  display:'grid', gridTemplateColumns:'1fr 220px 70px',
                  alignItems:'center', gap:20, padding:'16px 24px',
                  borderBottom: i < TOPICS.length-1 ? '1px solid var(--border)' : 'none',
                  transition:'background .15s',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{
                      width:34, height:34, borderRadius:9, flexShrink:0,
                      background:t.tint, border:`1.5px solid ${t.color}33`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'.65rem', fontWeight:900, color:t.color,
                    }}>{t.short}</div>
                    <div>
                      <div style={{fontSize:'.87rem', fontWeight:700, color:'var(--ink)'}}>{t.full}</div>
                      <div style={{fontSize:'.72rem', color:'var(--muted)', marginTop:1}}>
                        {hasData ? `${st.exams} ex. · ${st.correct}✓ ${st.wrong}✗` : 'Sin datos aún'}
                      </div>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: hasData ? `${pct}%` : '0%',
                      background: hasData ? (pct>=70 ? 'var(--ok)' : pct>=50 ? t.color : 'var(--err)') : 'var(--border)',
                    }} />
                  </div>
                  <div style={{textAlign:'right', fontWeight:800, fontSize:'.9rem',
                    color: !hasData ? 'var(--muted2)' : pct>=50 ? 'var(--ok)' : 'var(--err)'}}>
                    {hasData ? `${formatScore(st.avgScore)}/10` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── RECENT ACTIVITY ── */}
        {allSessions.length > 0 && (
          <section className="animate-up" style={{animationDelay:'.22s'}}>
            <h2 style={{fontSize:'1.05rem', fontWeight:800, letterSpacing:'-.01em', marginBottom:18, color:'var(--ink)'}}>Actividad reciente</h2>
            <div style={{border:'1px solid var(--border)', borderRadius:16, background:'var(--card)', overflow:'hidden', boxShadow:'var(--shadow-sm)'}}>
              <div style={{
                display:'grid', gridTemplateColumns:'1fr 120px 90px 80px 70px',
                padding:'10px 24px', borderBottom:'1px solid var(--border)',
                fontSize:'.68rem', fontWeight:700, letterSpacing:'.07em',
                textTransform:'uppercase', color:'var(--muted2)', gap:16,
              }}>
                <span>Examen</span><span>Fecha</span>
                <span style={{textAlign:'center'}}>Resultado</span>
                <span style={{textAlign:'center'}}>Modo</span>
                <span style={{textAlign:'right'}}>Nota</span>
              </div>
              {allSessions.map((s, i) => {
                const score = Number(s.score)
                const passed = score >= 5
                return (
                  <div key={s.id} className="session-row" style={{
                    display:'grid', gridTemplateColumns:'1fr 120px 90px 80px 70px',
                    alignItems:'center', padding:'14px 24px', gap:16,
                    borderBottom: i < allSessions.length-1 ? '1px solid var(--border)' : 'none',
                    transition:'background .15s',
                  }}>
                    <div>
                      <div style={{fontSize:'.85rem', fontWeight:700, color:'var(--ink)'}}>
                        {s.topics.map((t: string) => t.replace('tema','T')).join(', ')}
                      </div>
                      <div style={{fontSize:'.73rem', color:'var(--muted)', marginTop:1}}>
                        {s.n_total} preg. · {s.n_correct}✓ {s.n_wrong}✗ {s.n_blank}○
                      </div>
                    </div>
                    <div style={{fontSize:'.78rem', color:'var(--muted)'}}>{formatDate(s.created_at)}</div>
                    <div style={{textAlign:'center'}}>
                      <span style={{
                        fontSize:'.71rem', fontWeight:700, padding:'3px 10px', borderRadius:99,
                        background: passed ? 'var(--ok-soft)' : 'var(--err-soft)',
                        color: passed ? 'var(--ok)' : 'var(--err)',
                      }}>{passed ? 'Aprobado' : 'Suspenso'}</span>
                    </div>
                    <div style={{textAlign:'center', fontSize:'.78rem', color:'var(--muted)'}}>
                      {s.mode === 'study' ? '📖' : '📝'}
                    </div>
                    <div style={{textAlign:'right', fontWeight:900, fontSize:'1rem', color: passed ? 'var(--ok)' : 'var(--err)'}}>
                      {formatScore(score)}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ── */}
        {totalExams === 0 && (
          <section className="animate-up" style={{animationDelay:'.2s'}}>
            <div style={{border:'2px dashed var(--border-2)', borderRadius:20, padding:'64px 40px', textAlign:'center'}}>
              <div style={{fontSize:'2.8rem', marginBottom:16}}>🚀</div>
              <h3 style={{fontWeight:800, fontSize:'1.25rem', marginBottom:10}}>¡Empieza tu primer examen!</h3>
              <p style={{color:'var(--muted)', fontSize:'.9rem', maxWidth:400, margin:'0 auto 28px'}}>
                {qCount} preguntas te esperan. Cada examen guarda tu progreso y actualiza el ranking.
              </p>
              <Link href="/setup" className="btn btn-accent" style={{padding:'12px 32px', fontSize:'.9rem'}}>
                Configurar examen →
              </Link>
            </div>
          </section>
        )}

      </div>
    </>
  )
}
