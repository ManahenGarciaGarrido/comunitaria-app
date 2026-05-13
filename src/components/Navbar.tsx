'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { username: string; role: string; streak: number }

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
  const isActive = (href: string) => pathname === href || (href === '/dashboard' && pathname === '/')

  return (
    <header style={{
      background: 'rgba(238,232,219,.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 28px',
        height: 56, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', marginRight:16 }}>
          <div style={{
            width:28, height:28, borderRadius:7,
            background:'var(--accent)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'.65rem', fontWeight:900, letterSpacing:'-.02em',
          }}>CII</div>
          <span style={{ fontWeight:800, fontSize:'.92rem', color:'var(--ink)', letterSpacing:'-.02em' }}>
            Comunitaria II
          </span>
        </Link>

        {/* Separator */}
        <div style={{ width:1, height:18, background:'var(--border-2)', marginRight:8 }} />

        {/* Nav */}
        <nav style={{ display:'flex', gap:2, flex:1 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding:'5px 13px', borderRadius:8,
              fontSize:'.82rem', fontWeight:isActive(l.href) ? 700 : 500,
              textDecoration:'none',
              color: isActive(l.href) ? 'var(--accent)' : 'var(--muted)',
              background: isActive(l.href) ? 'var(--accent-soft)' : 'transparent',
              transition:'all .15s',
            }}>{l.label}</Link>
          ))}
        </nav>

        {/* Streak */}
        {streak > 0 && (
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            padding:'3px 10px', borderRadius:99,
            background:'var(--warn-soft)', border:'1px solid rgba(140,90,13,.12)',
          }}>
            <span style={{fontSize:'.82rem'}}>🔥</span>
            <span style={{fontSize:'.76rem', fontWeight:800, color:'var(--warn)'}}>{streak}</span>
          </div>
        )}

        {/* User */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:8 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'4px 10px 4px 5px', borderRadius:99,
            background:'var(--card)', border:'1px solid var(--border)',
          }}>
            <div style={{
              width:22, height:22, borderRadius:'50%',
              background:'var(--accent)', color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'.62rem', fontWeight:900,
            }}>{username.charAt(0).toUpperCase()}</div>
            <span style={{fontSize:'.77rem', fontWeight:600, color:'var(--ink2)'}}>@{username}</span>
          </div>
          <button onClick={logout} className="btn btn-ghost"
            style={{padding:'5px 13px', fontSize:'.76rem', borderRadius:8}}>
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
