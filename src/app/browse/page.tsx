import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Question banks available on the platform
const BANKS = [
  {
    id: 'uax-enf-comunitaria2',
    university: 'UAX',
    universityFull: 'Universidad Alfonso X el Sabio',
    degree: 'Grado en Enfermería',
    year: 3,
    subject: 'Enfermería Familiar y Comunitaria II',
    shortName: 'Comunitaria II',
    topics: ['Obesidad y Cáncer', 'Medio Ambiente', 'EDO y Salud Pública', 'Salud Internacional', 'Prevención de Accidentes'],
    topicCount: 5,
    color: '#5b4cf5',
    bg: '#ede9fe',
    borderColor: 'rgba(91,76,245,.2)',
    emoji: '🏥',
    live: true,
  },
]

const COMING_SOON = [
  { university: 'UCM', degree: 'Medicina', subject: 'Farmacología', emoji: '💊', color: '#dc2626', bg: '#fee2e2' },
  { university: 'UAM', degree: 'Psicología', subject: 'Psicopatología', emoji: '🧠', color: '#7c3aed', bg: '#ede9fe' },
  { university: 'UAX', degree: 'Fisioterapia', subject: 'Anatomía II', emoji: '🦴', color: '#0284c7', bg: '#e0f2fe' },
  { university: 'UPM', degree: 'Informática', subject: 'Algoritmos', emoji: '💻', color: '#059669', bg: '#d1fae5' },
]

export default async function BrowsePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch question count for live banks
  const { count: questionCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const qCount = questionCount ?? 490

  return (
    <>
      <style>{`
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatAlt { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .browse-nav-link:hover { color: var(--ink) !important; }
        .bank-card:hover {
          box-shadow: 0 20px 64px rgba(91,76,245,.18), 0 4px 16px rgba(91,76,245,.1) !important;
          transform: translateY(-5px) !important;
          border-color: rgba(91,76,245,.35) !important;
        }
        .coming-card:hover {
          box-shadow: var(--shadow) !important;
          transform: translateY(-3px) !important;
        }
        .filter-pill:hover { border-color: var(--brand) !important; color: var(--brand) !important; background: var(--brand-soft) !important; }
        .filter-pill.active { border-color: var(--brand) !important; color: var(--brand) !important; background: var(--brand-soft) !important; }
        .suggest-box:hover { border-color: var(--brand) !important; background: var(--brand-soft) !important; }
        .cta-btn:hover { box-shadow: 0 16px 48px rgba(91,76,245,.4) !important; transform: translateY(-2px) !important; }
        .stagger > *:nth-child(1){animation-delay:.04s}
        .stagger > *:nth-child(2){animation-delay:.09s}
        .stagger > *:nth-child(3){animation-delay:.14s}
        .stagger > *:nth-child(4){animation-delay:.19s}
        .stagger > *:nth-child(5){animation-delay:.24s}
        .stagger > *:nth-child(6){animation-delay:.29s}
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>

        {/* ── NAVBAR ──────────────────────────────────────── */}
        <header style={{
          background: 'rgba(250,250,249,.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid #e8e5e0',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1160, margin: '0 auto', padding: '0 28px',
            height: 62, display: 'flex', alignItems: 'center', gap: 24,
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(91,76,245,.38)',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 5L9 13.5L15 5" stroke="white" strokeWidth="2.6"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{
                fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-.03em',
                background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Vokab</span>
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
              {[
                { href: '/', label: 'Inicio' },
                { href: '/browse', label: 'Explorar', active: true },
              ].map(l => (
                <Link key={l.href} href={l.href} className="browse-nav-link"
                  style={{
                    padding: '5px 13px', borderRadius: 8,
                    fontSize: '.83rem', fontWeight: l.active ? 700 : 500,
                    textDecoration: 'none',
                    color: l.active ? '#5b4cf5' : '#7a7670',
                    background: l.active ? '#ede9fe' : 'transparent',
                    transition: 'all .15s',
                  }}>{l.label}</Link>
              ))}
            </nav>

            {/* Auth CTAs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {user ? (
                <Link href="/dashboard" style={{
                  padding: '8px 20px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                  color: '#fff', textDecoration: 'none',
                  fontSize: '.84rem', fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(91,76,245,.3)',
                }}>Mi dashboard →</Link>
              ) : (
                <>
                  <Link href="/login" style={{
                    padding: '8px 18px', borderRadius: 10,
                    border: '1.5px solid #e8e5e0', background: 'transparent',
                    color: '#4a4640', textDecoration: 'none',
                    fontSize: '.84rem', fontWeight: 600,
                  }}>Entrar</Link>
                  <Link href="/register" style={{
                    padding: '8px 20px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                    color: '#fff', textDecoration: 'none',
                    fontSize: '.84rem', fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(91,76,245,.3)',
                  }}>Registrarse gratis</Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── HERO ────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(160deg, #f8f7ff 0%, #fafaf9 50%, #f0effe 100%)',
          borderBottom: '1px solid #e8e5e0',
          padding: '80px 28px 72px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Orbs */}
          <div style={{
            position: 'absolute', top: -60, right: 80,
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,76,245,.14) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, left: -40,
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109,40,217,.1) 0%, transparent 70%)',
            animation: 'floatAlt 10s ease-in-out infinite', pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
            {/* Badge */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 14px', borderRadius: 99,
                background: '#ede9fe', border: '1px solid rgba(91,76,245,.2)',
                fontSize: '.72rem', fontWeight: 700, color: '#5b4cf5',
                letterSpacing: '.06em', textTransform: 'uppercase',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#5b4cf5', display: 'inline-block',
                }} />
                {BANKS.length} banco{BANKS.length > 1 ? 's' : ''} disponible{BANKS.length > 1 ? 's' : ''} · {qCount} preguntas
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              fontWeight: 900, lineHeight: 1.1,
              letterSpacing: '-.04em', color: '#0f0e0d',
              marginBottom: 16, maxWidth: 640,
            }}>
              Todos los tests,{' '}
              <span style={{
                fontStyle: 'italic', fontFamily: 'Georgia, serif',
                background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>en un solo lugar</span>
            </h1>

            <p style={{
              fontSize: '1.05rem', color: '#7a7670', lineHeight: 1.75,
              maxWidth: 520, marginBottom: 36,
            }}>
              Explora el catálogo de bancos de preguntas organizados por universidad,
              grado y asignatura. Preparados por estudiantes, para estudiantes.
            </p>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Todos', 'Enfermería', 'Medicina', 'Psicología', 'Informática'].map((f, i) => (
                <button key={f} className={`filter-pill${i === 0 ? ' active' : ''}`}
                  style={{
                    padding: '8px 18px', borderRadius: 99,
                    border: '1.5px solid #e8e5e0',
                    background: i === 0 ? '#ede9fe' : '#fff',
                    color: i === 0 ? '#5b4cf5' : '#4a4640',
                    fontSize: '.83rem', fontWeight: i === 0 ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── BANKS GRID ──────────────────────────────────── */}
        <section style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 28px 0' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f0e0d', letterSpacing: '-.015em' }}>
                Bancos disponibles
              </h2>
              <p style={{ fontSize: '.78rem', color: '#7a7670', marginTop: 3 }}>
                {BANKS.length} banco{BANKS.length > 1 ? 's' : ''} activo{BANKS.length > 1 ? 's' : ''}
              </p>
            </div>
            <span style={{ fontSize: '.78rem', color: '#7a7670' }}>
              Actualizado · Mayo 2026
            </span>
          </div>

          {/* Live bank cards */}
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {BANKS.map(bank => (
              <div key={bank.id} className="bank-card animate-up" style={{
                background: '#fff', border: '1.5px solid rgba(91,76,245,.15)',
                borderRadius: 20,
                boxShadow: '0 4px 24px rgba(91,76,245,.08), 0 1px 4px rgba(15,14,13,.04)',
                transition: 'all .25s cubic-bezier(.22,1,.36,1)',
                overflow: 'hidden',
              }}>
                {/* Color top bar */}
                <div style={{
                  height: 5,
                  background: `linear-gradient(90deg, ${bank.color}, #6d28d9)`,
                }} />

                <div style={{ padding: '24px' }}>
                  {/* University + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 13, flexShrink: 0,
                      background: bank.bg, border: `1.5px solid ${bank.borderColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>{bank.emoji}</div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 99,
                      background: '#dcfce7', color: '#16a34a',
                      fontSize: '.68rem', fontWeight: 700, letterSpacing: '.05em',
                    }}>✓ ACTIVO</span>
                  </div>

                  {/* Subject info */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em',
                      textTransform: 'uppercase', color: bank.color, marginBottom: 4,
                    }}>
                      {bank.university} · {bank.degree} · {bank.year}.º año
                    </div>
                    <h3 style={{
                      fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-.02em',
                      color: '#0f0e0d', lineHeight: 1.2, marginBottom: 6,
                    }}>{bank.subject}</h3>
                    <p style={{ fontSize: '.78rem', color: '#7a7670' }}>
                      {bank.universityFull}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    gap: 1, background: '#e8e5e0',
                    borderRadius: 12, overflow: 'hidden', marginBottom: 16,
                  }}>
                    {[
                      { val: String(qCount), label: 'Preguntas' },
                      { val: String(bank.topicCount), label: 'Temas' },
                      { val: 'Gratis', label: 'Acceso' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        background: '#fafaf9', padding: '10px 8px', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '.95rem', fontWeight: 900, color: bank.color, letterSpacing: '-.02em' }}>
                          {s.val}
                        </div>
                        <div style={{ fontSize: '.65rem', color: '#7a7670', marginTop: 1, fontWeight: 600 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Topics preview */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {bank.topics.slice(0, 4).map(t => (
                      <span key={t} style={{
                        padding: '3px 9px', borderRadius: 99,
                        background: bank.bg, color: bank.color,
                        fontSize: '.67rem', fontWeight: 700,
                        border: `1px solid ${bank.borderColor}`,
                      }}>{t}</span>
                    ))}
                    {bank.topics.length > 4 && (
                      <span style={{
                        padding: '3px 9px', borderRadius: 99,
                        background: '#f3f2f0', color: '#7a7670',
                        fontSize: '.67rem', fontWeight: 600,
                      }}>+{bank.topics.length - 4} más</span>
                    )}
                  </div>

                  {/* CTA */}
                  {user ? (
                    <Link href="/dashboard" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '13px 20px', borderRadius: 13,
                      background: `linear-gradient(135deg, ${bank.color}, #6d28d9)`,
                      color: '#fff', textDecoration: 'none',
                      fontSize: '.88rem', fontWeight: 700,
                      boxShadow: `0 6px 20px ${bank.color}40`,
                      transition: 'all .2s',
                    }}>
                      Practicar ahora →
                    </Link>
                  ) : (
                    <Link href="/register" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '13px 20px', borderRadius: 13,
                      background: `linear-gradient(135deg, ${bank.color}, #6d28d9)`,
                      color: '#fff', textDecoration: 'none',
                      fontSize: '.88rem', fontWeight: 700,
                      boxShadow: `0 6px 20px ${bank.color}40`,
                    }}>
                      Empezar gratis →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMING SOON ─────────────────────────────────── */}
        <section style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f0e0d', letterSpacing: '-.015em' }}>
              Próximamente
            </h2>
            <span style={{
              padding: '2px 10px', borderRadius: 99,
              background: '#fef3c7', color: '#d97706',
              fontSize: '.68rem', fontWeight: 700,
            }}>EN DESARROLLO</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {COMING_SOON.map((bank, i) => (
              <div key={i} className="coming-card" style={{
                background: '#fff', border: '1.5px solid #e8e5e0',
                borderRadius: 16, padding: '20px',
                transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                opacity: .75, cursor: 'default',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11, marginBottom: 12,
                  background: bank.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.2rem',
                }}>{bank.emoji}</div>
                <div style={{ fontSize: '.68rem', fontWeight: 700, color: bank.color, marginBottom: 4, letterSpacing: '.05em' }}>
                  {bank.university}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f0e0d', marginBottom: 2 }}>
                  {bank.subject}
                </div>
                <div style={{ fontSize: '.73rem', color: '#7a7670' }}>{bank.degree}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SUGGEST BOX ─────────────────────────────────── */}
        <section style={{ maxWidth: 1160, margin: '48px auto 0', padding: '0 28px' }}>
          <div className="suggest-box" style={{
            border: '2px dashed #d6d2ca', borderRadius: 20, padding: '40px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'all .2s',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>➕</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f0e0d', marginBottom: 6 }}>
              ¿Tu asignatura no está aquí?
            </h3>
            <p style={{ fontSize: '.87rem', color: '#7a7670', marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
              Sugiere una asignatura y te avisamos cuando la añadamos.
              También puedes generar las preguntas tú mismo con el plan Pro.
            </p>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 28px', borderRadius: 12,
              border: '1.5px solid #5b4cf5', background: 'transparent',
              color: '#5b4cf5', textDecoration: 'none',
              fontSize: '.87rem', fontWeight: 700,
            }}>
              Sugerir asignatura →
            </Link>
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────────── */}
        {!user && (
          <section style={{ maxWidth: 1160, margin: '56px auto', padding: '0 28px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #5b4cf5 100%)',
              borderRadius: 24, padding: '56px 48px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 28,
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(91,76,245,.35)',
            }}>
              <div style={{
                position: 'absolute', top: -60, right: 80,
                width: 260, height: 260, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)',
                pointerEvents: 'none', animation: 'float 8s ease-in-out infinite',
              }} />

              <div style={{ position: 'relative' }}>
                <div style={{
                  fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 12,
                }}>¿Listo para empezar?</div>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900,
                  letterSpacing: '-.035em', color: '#fff', lineHeight: 1.15, marginBottom: 10,
                }}>
                  Gratis para siempre.
                </h2>
                <p style={{ fontSize: '.92rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>
                  Un examen al día, ranking global, estadísticas de progreso. Sin tarjeta.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexShrink: 0, position: 'relative' }}>
                <Link href="/register" className="cta-btn" style={{
                  padding: '14px 32px', borderRadius: 13,
                  background: '#fff', color: '#5b4cf5',
                  textDecoration: 'none', fontWeight: 900,
                  fontSize: '.95rem', letterSpacing: '-.01em',
                  boxShadow: '0 8px 32px rgba(0,0,0,.2)',
                  transition: 'all .2s',
                }}>
                  Crear cuenta gratis →
                </Link>
                <Link href="/login" style={{
                  padding: '14px 24px', borderRadius: 13,
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.2)',
                  color: 'rgba(255,255,255,.85)',
                  textDecoration: 'none', fontWeight: 700,
                  fontSize: '.95rem',
                  transition: 'all .2s',
                }}>
                  Entrar
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid #e8e5e0',
          padding: '32px 28px',
          marginTop: user ? 56 : 0,
        }}>
          <div style={{
            maxWidth: 1160, margin: '0 auto',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4L7 10.5L12 4" stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '.9rem', color: '#5b4cf5' }}>Vokab</span>
            </div>
            <p style={{ fontSize: '.77rem', color: '#a8a49e' }}>
              © 2026 Vokab · El banco de tests universitarios
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}
