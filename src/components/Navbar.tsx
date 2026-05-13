'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  username: string
  role: string
  streak: number
}

export default function Navbar({ username, role, streak }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/ranking',   label: 'Ranking' },
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header style={{
      background: 'var(--elev)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 16px', height: 54, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--accent)', textDecoration: 'none', marginRight: 8 }}>
          Comunitaria II
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: '.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: pathname === l.href || (l.href === '/dashboard' && pathname === '/') ? 'var(--accent)' : 'var(--ink-2)',
                background: pathname === l.href || (l.href === '/dashboard' && pathname === '/') ? 'var(--accent-soft)' : 'transparent',
                transition: 'background .15s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Streak */}
        {streak > 0 && (
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: 3 }}>
            🔥 {streak}
          </div>
        )}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
          <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>@{username}</span>
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '.75rem' }}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
