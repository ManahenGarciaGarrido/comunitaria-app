'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card animate-up w-full max-w-sm">
      <div className="mb-6 text-center">
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📚</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' }}>Comunitaria II</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Inicia sesión para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div>
          <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>
            Email
          </label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="alumna@uax.es"
          />
        </div>
        <div>
          <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>
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
          <div style={{ background: 'var(--err-soft)', color: 'var(--err)', borderRadius: 8, padding: '8px 12px', fontSize: '.82rem' }}>
            {error}
          </div>
        )}

        <button className="btn btn-accent" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '.82rem', color: 'var(--muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Regístrate</Link>
      </p>
    </div>
  )
}
