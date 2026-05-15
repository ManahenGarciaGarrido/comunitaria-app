import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,249,.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(15,14,13,.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(91,76,245,.35)',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12L6 4L8 9L10 6L14 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)', letterSpacing: '-.03em' }}>
                Vokab
              </span>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <a href="#como-funciona" style={{ padding: '5px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color .15s' }}>Cómo funciona</a>
            <a href="#precios" style={{ padding: '5px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>Precios</a>
            <Link href="/login" style={{ padding: '5px 14px', borderRadius: 8, fontSize: '.82rem', fontWeight: 600, color: 'var(--ink2)', textDecoration: 'none' }}>Entrar</Link>
            <Link href="/register" className="btn btn-brand" style={{ padding: '7px 18px', fontSize: '.82rem', borderRadius: 8 }}>
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 24px 80px' }}>
        {/* Glow orbs */}
        <div className="hero-glow" style={{ width: 500, height: 500, top: -150, left: '50%', transform: 'translateX(-60%)', background: 'radial-gradient(circle, rgba(91,76,245,.12) 0%, transparent 70%)' }} />
        <div className="hero-glow" style={{ width: 300, height: 300, top: 50, right: '10%', background: 'radial-gradient(circle, rgba(109,40,217,.08) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="pill-tag animate-in" style={{ marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
            Banco público de tests universitarios · España
          </div>

          <h1 className="hero-title animate-up" style={{ marginBottom: 24 }}>
            El test correcto para<br />
            <em>tu asignatura</em>, cuando<br />
            más lo necesitas.
          </h1>

          <p className="animate-up" style={{ animationDelay: '.08s', fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            Accede a miles de preguntas tipo test organizadas por universidad, carrera y asignatura.
            Estudia gratis o suscríbete para tests ilimitados.
          </p>

          <div className="animate-up" style={{ animationDelay: '.14s', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-brand" style={{ padding: '13px 32px', fontSize: '1rem', borderRadius: 12 }}>
              Empezar gratis →
            </Link>
            <a href="#como-funciona" className="btn btn-ghost" style={{ padding: '13px 28px', fontSize: '1rem', borderRadius: 12 }}>
              Ver cómo funciona
            </a>
          </div>

          {/* Social proof */}
          <div className="animate-up" style={{ animationDelay: '.2s', marginTop: 48, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '490+', label: 'preguntas disponibles' },
              { n: '1',    label: 'universidad de momento' },
              { n: '24h',  label: 'para tener tu temario' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.03em', color: 'var(--ink)' }}>{s.n}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: '80px 24px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="pill-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>Cómo funciona</div>
            <h2 className="section-title">Dos formas de usar Vokab</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Columna 1: Practicar */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 20 }}>📚</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-.02em' }}>Practicar tests</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 24 }}>Busca por universidad, carrera y asignatura. Haz 1 test gratis al día o suscríbete para acceso ilimitado.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🔍', text: 'Filtra por tu universidad y asignatura' },
                  { icon: '🆓', text: '1 test gratuito al día, siempre' },
                  { icon: '♾️', text: 'Tests ilimitados con suscripción Pro' },
                  { icon: '📊', text: 'Seguimiento de tu progreso y nota media' },
                ].map(s => (
                  <div key={s.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '.9rem', flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--ink2)' }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: Subir temario */}
            <div style={{ background: 'linear-gradient(135deg, #5b4cf5 0%, #6d28d9 100%)', border: 'none', borderRadius: 20, padding: '36px', boxShadow: 'var(--shadow-brand)', color: '#fff' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 20 }}>✨</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-.02em' }}>Subir tu temario</h3>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 24 }}>Sube tu temario y en menos de 24 horas tendrás preguntas tipo test listas. Puedes compartirlas o mantenerlas privadas.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '📤', text: 'Sube PDF o Word de tu asignatura' },
                  { icon: '⚡', text: 'Preguntas generadas en menos de 24h' },
                  { icon: '🔒', text: 'Elige si son públicas o privadas' },
                  { icon: '🎁', text: 'Si las publicas, ganas días Pro gratis' },
                ].map(s => (
                  <div key={s.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '.9rem', flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.85)' }}>{s.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', fontSize: '.82rem', color: 'rgba(255,255,255,.8)' }}>
                💡 Por cada 100 preguntas que publiques, ganas <strong style={{ color: '#fff' }}>30 días Pro gratis</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="pill-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>Precios</div>
            <h2 className="section-title" style={{ marginBottom: 12 }}>Sencillo y transparente</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>Empieza gratis, mejora cuando quieras.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
            {/* Free */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Gratis</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 4 }}>0€</div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 28 }}>Para siempre</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['1 test al día', 'Acceso al banco público', 'Seguimiento básico de progreso', 'Filtros por carrera y asignatura'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--ok)', fontWeight: 700, fontSize: '.9rem' }}>✓</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--ink2)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '11px' }}>
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="pricing-card-popular" style={{ background: 'var(--card)', border: '2px solid var(--brand)', borderRadius: 20, padding: '32px 28px', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#5b4cf5,#6d28d9)', color: '#fff', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                Más popular
              </div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 16 }}>Pro</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 4 }}>4,99€</div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 28 }}>por mes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Tests ilimitados cada día', 'Modo examen con penalización', 'Modo estudio con feedback', 'Estadísticas avanzadas', 'Ranking global', 'Acceso prioritario a nuevos bancos'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '.9rem' }}>✓</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--ink2)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn btn-brand" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '11px' }}>
                Empezar con Pro →
              </Link>
            </div>

            {/* Temario */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Genera preguntas</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-.04em' }}>5€</span>
                <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/100 preg.</span>
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 28 }}>pago único por lote</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Sube tu PDF o Word', 'Preguntas listas en &lt;24h', 'Públicas o privadas', '+30 días Pro si las publicas', 'Sin suscripción necesaria'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--ok)', fontWeight: 700, fontSize: '.9rem' }}>✓</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--ink2)' }} dangerouslySetInnerHTML={{ __html: f }} />
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '11px' }}>
                Subir temario
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIVERSIDADES DEMO ── */}
      <section style={{ padding: '60px 24px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: 24 }}>
            Disponible ahora para
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              'UAX · Enfermería 3º · Comunitaria II',
              'Más universidades próximamente…',
            ].map((u, i) => (
              <div key={u} style={{
                padding: '10px 20px', borderRadius: 99,
                background: i === 0 ? 'var(--brand-soft)' : 'var(--card)',
                border: `1px solid ${i === 0 ? 'rgba(91,76,245,.2)' : 'var(--border)'}`,
                fontSize: '.83rem', fontWeight: 600,
                color: i === 0 ? 'var(--brand)' : 'var(--muted2)',
              }}>{u}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ width: 600, height: 400, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(91,76,245,.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            ¿Listo para aprobar<br />
            <span className="gradient-text">con cabeza</span>?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 36 }}>
            Empieza gratis hoy. Sin tarjeta de crédito.
          </p>
          <Link href="/register" className="btn btn-brand" style={{ padding: '14px 40px', fontSize: '1rem', borderRadius: 14 }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 12L6 4L8 9L10 6L14 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)', letterSpacing: '-.02em' }}>Vokab</span>
          </div>
          <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
            © 2025 Vokab · Tests universitarios en español
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/login" style={{ fontSize: '.78rem', color: 'var(--muted)', textDecoration: 'none' }}>Entrar</Link>
            <Link href="/register" style={{ fontSize: '.78rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
