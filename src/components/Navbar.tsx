'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { username: string; role: string; streak: number }

export default function Navbar({ username, role, streak }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/ranking',   label: 'Ranking' },
    { href: '/browse',    label: 'Explorar' },
    ...(role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]
  const isActive = (href: string) => pathname === href || (href === '/dashboard' && pathname === '/')
  const initial  = username ? username.charAt(0).toUpperCase() : '?'

  return (
    <>
      <style>{`
        .nav-link:hover { color: var(--ink2) !important; background: var(--bg2) !important; }
        .nav-link-active { color: var(--brand) !important; background: var(--brand-soft) !important; }
        .logout-btn:hover { background: var(--bg2) !important; border-color: var(--muted2) !important; }
        .user-pill { transition: box-shadow .15s, border-color .15s; }
        .user-pill:hover { border-color: var(--brand) !important; box-shadow: 0 0 0 3px var(--brand-glow) !important; }
        .vokab-logo:hover .logo-mark { box-shadow: 0 6px 20px rgba(91,76,245,.5) !important; transform: scale(1.07) !important; }
        .logo-mark { transition: box-shadow .2s, transform .2s; }
        .explore-pill {
          background: linear-gradient(135deg, var(--brand-soft), var(--purple-soft));
          border: 1px solid rgba(91,76,245,.2);
          color: var(--brand);
          font-size: .72rem; font-weight: 700; letter-spacing: .04em;
          padding: 2px 8px; border-radius: 99px;
          text-transform: uppercase;
        }
      `}</style>

      <header style={{
        background: 'rgba(250,250,249,.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 28px',
          height: 62, display: 'flex', alignItems: 'center', gap: 8,
        }}>

          {/* ── Logo ── */}
          <Link href="/dashboard" className="vokab-logo"
            style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginRight:18, flexShrink:0 }}>
            <div className="logo-mark" style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #5b4cf5 0%, #6d28d9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(91,76,245,.38)',
              flexShrink: 0,
            }}>
              {/* V-path logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5L9 13.5L15 5" stroke="white" strokeWidth="2.6"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              fontWeight: 900, fontSize: '1.08rem', letterSpacing: '-.03em',
              background: 'linear-gradient(135deg, #5b4cf5, #6d28d9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Vokab</span>
          </Link>

          {/* ── Divider ── */}
          <div style={{ width: 1, height: 22, background: 'var(--border-2)', marginRight: 10, flexShrink: 0 }} />

          {/* ── Nav links ── */}
          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`nav-link${isActive(l.href) ? ' nav-link-active' : ''}`}
                style={{
                  padding: '6px 14px', borderRadius: 9,
                  fontSize: '.83rem', fontWeight: isActive(l.href) ? 700 : 500,
                  textDecoration: 'none',
                  color: isActive(l.href) ? 'var(--brand)' : 'var(--muted)',
                  background: isActive(l.href) ? 'var(--brand-soft)' : 'transparent',
                  transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {l.label}
                {l.label === 'Explorar' && !isActive(l.href) && (
                  <span className="explore-pill">New</span>
                )}
              </Link>
            ))}
          </nav>

          {/* ── Streak badge ── */}
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 99,
              background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
              border: '1px solid #fcd34d',
              boxShadow: '0 2px 8px rgba(217,119,6,.15)',
            }}>
              <span style={{ fontSize: '.9rem' }}>🔥</span>
              <span style={{ fontSize: '.78rem', fontWeight: 900, color: '#b45309' }}>{streak} días</span>
            </div>
          )}

          {/* ── User + logout ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div className="user-pill" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px 5px 5px', borderRadius: 99,
              background: 'var(--card)', border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-xs)', cursor: 'default',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--brand), var(--brand-3))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.68rem', fontWeight: 900,
                boxShadow: '0 2px 8px rgba(91,76,245,.3)',
              }}>{initial}</div>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink2)' }}>@{username}</span>
            </div>
            <button
              onClick={logout}
              className="logout-btn"
              style={{
                padding: '7px 15px', borderRadius: 9, border: '1.5px solid var(--border-2)',
                background: 'transparent', color: 'var(--muted)', fontSize: '.8rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}>
              Salir
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
