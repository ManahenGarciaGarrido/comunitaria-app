import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      flexDirection: 'column',
      gap: 28,
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #f8f7ff 0%, #fafaf9 40%, #f0effe 100%)',
    }}>

      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: -100, left: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,76,245,.12) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -120, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,40,217,.1) 0%, transparent 70%)',
        animation: 'floatAlt 10s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,76,245,.07) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite 2s',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 24px rgba(91,76,245,.4)',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 7L13 19L21 7" stroke="white" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{
            fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-.03em',
            background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Vokab</div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 3, letterSpacing: '.02em' }}>
            El banco de tests universitarios
          </div>
        </Link>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Footer */}
      <p style={{ fontSize: '.73rem', color: 'var(--muted2)', position: 'relative', zIndex: 1 }}>
        Al continuar aceptas los{' '}
        <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>términos de uso</span>
        {' '}y la{' '}
        <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>política de privacidad</span>
      </p>
    </main>
  )
}
