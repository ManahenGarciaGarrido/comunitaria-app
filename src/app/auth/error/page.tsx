import Link from 'next/link'

export default function AuthErrorPage() {
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
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center' }}>
        <div>
          <div style={{ width:52, height:52, borderRadius:14, background:'#2d4a3e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:900, color:'#fff', margin:'0 auto 10px', boxShadow:'0 6px 20px rgba(45,74,62,.25)' }}>CII</div>
          <div style={{ fontSize:'.95rem', fontWeight:800, color:'#2d4a3e' }}>Comunitaria II</div>
        </div>
        <div style={{ width:'100%', background:'#fff', border:'1px solid #d8d0be', borderRadius:20, padding:'40px 32px', boxShadow:'0 4px 20px rgba(26,23,20,.08)' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5dede', border:'2px solid rgba(155,44,40,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'1.8rem' }}>✗</div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:900, letterSpacing:'-.025em', color:'#1a1714', marginBottom:10 }}>
            Enlace expirado
          </h1>
          <p style={{ fontSize:'.9rem', color:'#7a7265', lineHeight:1.65, marginBottom:28 }}>
            El enlace de verificación ha caducado o ya fue usado.
            Vuelve a registrarte o contacta con soporte.
          </p>
          <Link href="/register" style={{ display:'block', width:'100%', padding:'13px 20px', borderRadius:12, background:'#2d4a3e', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'.9rem', textAlign:'center' }}>
            Volver al registro →
          </Link>
        </div>
      </div>
    </main>
  )
}
