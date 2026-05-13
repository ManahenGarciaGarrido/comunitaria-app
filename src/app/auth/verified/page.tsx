import Link from 'next/link'

export default function VerifiedPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#eee8db',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div>
          <div style={{
            width: 52, height: 52,
            borderRadius: 14,
            background: '#2d4a3e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 900, color: '#fff',
            margin: '0 auto 10px',
            boxShadow: '0 6px 20px rgba(45,74,62,.25)',
          }}>CII</div>
          <div style={{ fontSize: '.95rem', fontWeight: 800, color: '#2d4a3e', letterSpacing: '-.01em' }}>
            Comunitaria II
          </div>
          <div style={{ fontSize: '.76rem', color: '#7a7265', marginTop: 3 }}>
            Enfermería Familiar y Comunitaria · UAX
          </div>
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          background: '#fff',
          border: '1px solid #d8d0be',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 4px 20px rgba(26,23,20,.08)',
        }}>
          {/* Checkmark */}
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: '#d0ead9',
            border: '2px solid rgba(26,107,58,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '1.8rem',
          }}>✓</div>

          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            letterSpacing: '-.025em',
            color: '#1a1714',
            marginBottom: 10,
          }}>
            Correo verificado
          </h1>

          <p style={{
            fontSize: '.9rem',
            color: '#7a7265',
            lineHeight: 1.65,
            marginBottom: 28,
          }}>
            Tu cuenta está activa. Ya puedes iniciar sesión y empezar
            a preparar el examen.
          </p>

          <Link href="/login" style={{
            display: 'block',
            width: '100%',
            padding: '13px 20px',
            borderRadius: 12,
            background: '#2d4a3e',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '.9rem',
            textAlign: 'center',
            boxShadow: '0 4px 14px rgba(45,74,62,.28)',
            transition: 'all .15s',
          }}>
            Iniciar sesión →
          </Link>
        </div>

        <p style={{ fontSize: '.76rem', color: '#a09890' }}>
          Si no solicitaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>
    </main>
  )
}
