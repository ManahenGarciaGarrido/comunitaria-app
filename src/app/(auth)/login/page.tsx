'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="animate-up" style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '36px 32px',
      boxShadow: '0 8px 40px rgba(91,76,245,.1), 0 2px 8px rgba(15,14,13,.06)',
    }}>
      {/* Top accent bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, var(--brand), var(--brand-3))',
        borderRadius: '2px 2px 0 0',
        margin: '-36px -32px 28px',
      }} />

      <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-.025em', color: 'var(--ink)', marginBottom: 4 }}>
        Bienvenido de nuevo
      </h1>
      <p style={{ fontSize: '.875rem', color: 'var(--muted)', marginBottom: 28 }}>
        Inicia sesión para continuar estudiando
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', display: 'block', marginBottom: 6, letterSpacing: '.01em' }}>
            Correo electrónico
          </label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', display: 'block', marginBottom: 6, letterSpacing: '.01em' }}>
            Contraseña
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{
            background: 'var(--err-soft)', color: 'var(--err)',
            border: '1px solid rgba(220,38,38,.2)',
            borderRadius: 10, padding: '10px 14px', fontSize: '.83rem',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          className="btn btn-accent"
          type="submit"
          disabled={loading}
          style={{ marginTop: 4, padding: '12px 24px', fontSize: '.9rem', borderRadius: 12 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              Entrando…
            </span>
          ) : 'Iniciar sesión →'}
        </button>
      </form>

      <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

      <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
          Regístrate gratis →
        </Link>
      </p>
    </div>
  )
}
