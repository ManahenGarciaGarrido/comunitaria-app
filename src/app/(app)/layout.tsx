import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, streak')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        username={profile?.username ?? ''}
        role={profile?.role ?? 'student'}
        streak={profile?.streak ?? 0}
      />
      <main style={{
        flex: 1,
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: '28px 20px 60px',
      }}>
        {children}
      </main>
    </div>
  )
}
