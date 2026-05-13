'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (username.length < 3) { setError('El nombre de usuario debe tener al menos 3 caracteres'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card animate-up w-full max-w-sm">
      <div className="mb-6 text-center">
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎓</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' }}>Crear cuenta</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Comunitaria II · UAX</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <div>
          <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 4 }}>
            Nombre de usuario
          </label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="enfermera_ana"
            minLength={3}
          />
        </div>
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
            minLength={6}
          />
        </div>

        {error && (
          <div style={{ background: 'var(--err-soft)', color: 'var(--err)', borderRadius: 8, padding: '8px 12px', fontSize: '.82rem' }}>
            {error}
          </div>
        )}

        <button className="btn btn-accent" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Creando cuenta…' : 'Registrarse'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '.82rem', color: 'var(--muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Inicia sesión</Link>
      </p>
    </div>
  )
}
