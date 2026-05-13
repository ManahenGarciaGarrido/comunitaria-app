export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      flexDirection: 'column',
      gap: 24,
    }}>
      {/* Brand mark */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52,
          borderRadius: 14,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 900, color: '#fff',
          margin: '0 auto 10px',
          boxShadow: '0 6px 20px rgba(45,74,62,.3)',
        }}>
          CII
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-.01em' }}>
          Comunitaria II
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>
          Enfermería Familiar y Comunitaria · UAX
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {children}
      </div>
    </main>
  )
}
