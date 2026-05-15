'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres')
      setLoading(false); return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <div className="animate-scale" style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '40px 32px', textAlign: 'center',
      boxShadow: '0 8px 40px rgba(91,76,245,.1)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand-soft), #ddd6fe)',
        border: '2px solid rgba(91,76,245,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: '1.8rem',
      }}>📬</div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-.02em' }}>
        Revisa tu correo
      </h2>
      <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
        Hemos enviado un enlace de verificación a <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
        Confirma tu cuenta para empezar.
      </p>
      <Link href="/login" className="btn btn-outline-brand"
        style={{ padding: '11px 28px', borderRadius: 12, fontSize: '.88rem' }}>
        Volver al inicio de sesión
      </Link>
    </div>
  )

  return (
    <div className="animate-up" style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '36px 32px',
      boxShadow: '0 8px 40px rgba(91,76,245,.1), 0 2px 8px rgba(15,14,13,.06)',
    }}>
      {/* Gradient top bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, var(--brand), var(--brand-3))',
        borderRadius: '2px 2px 0 0',
        margin: '-36px -32px 28px',
      }} />

      <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-.025em', color: 'var(--ink)', marginBottom: 4 }}>
        Crea tu cuenta
      </h1>
      <p style={{ fontSize: '.875rem', color: 'var(--muted)', marginBottom: 28 }}>
        Gratis para siempre · sin tarjeta de crédito
      </p>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', display: 'block', marginBottom: 6 }}>
            Nombre de usuario
          </label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="maria_garcia"
            minLength={3}
          />
        </div>
        <div>
          <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', display: 'block', marginBottom: 6 }}>
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
          <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--ink2)', display: 'block', marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
          />
          <p style={{ fontSize: '.72rem', color: 'var(--muted2)', marginTop: 5 }}>Mínimo 6 caracteres</p>
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
          style={{ marginTop: 6, padding: '12px 24px', fontSize: '.9rem', borderRadius: 12 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              Creando cuenta…
            </span>
          ) : 'Crear cuenta gratis →'}
        </button>
      </form>

      {/* Plan highlight */}
      <div style={{
        marginTop: 20, padding: '12px 16px', borderRadius: 12,
        background: 'var(--brand-soft)', border: '1px solid rgba(91,76,245,.15)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <span style={{ fontSize: '1rem' }}>✨</span>
        <div>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--brand)' }}>Plan Gratuito incluye</div>
          <div style={{ fontSize: '.72rem', color: 'var(--brand)', opacity: .8, marginTop: 1 }}>
            1 examen/día · Ranking global · Estadísticas de progreso
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

      <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
          Iniciar sesión →
        </Link>
      </p>
    </div>
  )
}
