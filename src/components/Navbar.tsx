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

  const isActive = (href: string) =>
    pathname === href || (href === '/dashboard' && pathname === '/')

  return (
    <header style={{
      background: 'rgba(255,255,255,.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 0 rgba(26,23,20,.06)',
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 20px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          marginRight: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.75rem', fontWeight: 900, color: '#fff',
          }}>
            CII
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '.95rem',
            color: 'var(--accent)',
            letterSpacing: '-.01em',
          }}>
            Comunitaria II
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: '6px 13px',
                borderRadius: 8,
                fontSize: '.83rem',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive(l.href) ? 'var(--accent)' : 'var(--muted)',
                background: isActive(l.href) ? 'var(--accent-soft)' : 'transparent',
                transition: 'all .15s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Streak */}
        {streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'var(--warn-soft)',
            border: '1px solid rgba(146,88,13,.15)',
          }}>
            <span style={{ fontSize: '.85rem' }}>🔥</span>
            <span style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--warn)' }}>{streak}</span>
          </div>
        )}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 10px 5px 6px',
            borderRadius: 20,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 22, height: 22,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.65rem', fontWeight: 800,
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--ink2)' }}>
              @{username}
            </span>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ padding: '5px 12px', fontSize: '.76rem' }}
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
