import { createClient } from '@/lib/supabase/server'
import { formatScore } from '@/lib/utils'

export const revalidate = 60 // refresh every 60 s

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('ranking')
    .select('*')
    .order('avg_score', { ascending: false })
    .limit(50)

  const ranking = rows ?? []

  const myIndex = ranking.findIndex(r => r.id === user?.id)

  const medalEmoji = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

  return (
    <div className="flex flex-col gap-5 animate-up">
      <div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>Ranking global</h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Top 50 usuarios por nota media (actualizado cada minuto)</p>
      </div>

      {/* Podium (top 3) */}
      {ranking.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'flex-end' }}>
          {/* 2nd */}
          <div className="card" style={{ textAlign: 'center', padding: '16px 10px', order: 1 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>🥈</div>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', marginBottom: 2, wordBreak: 'break-all' }}>@{ranking[1]?.username}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#94a3b8' }}>{formatScore(Number(ranking[1]?.avg_score))}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 2 }}>{ranking[1]?.total_exams} ex.</div>
          </div>
          {/* 1st */}
          <div className="card" style={{ textAlign: 'center', padding: '20px 10px', order: 2, border: '2px solid var(--accent)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 4 }}>🥇</div>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--accent)', marginBottom: 2, wordBreak: 'break-all' }}>@{ranking[0]?.username}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{formatScore(Number(ranking[0]?.avg_score))}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 2 }}>{ranking[0]?.total_exams} ex.</div>
          </div>
          {/* 3rd */}
          <div className="card" style={{ textAlign: 'center', padding: '14px 10px', order: 3 }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🥉</div>
            <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', marginBottom: 2, wordBreak: 'break-all' }}>@{ranking[2]?.username}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#cd7c3a' }}>{formatScore(Number(ranking[2]?.avg_score))}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 2 }}>{ranking[2]?.total_exams} ex.</div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '36px 1fr 60px 60px 48px', gap: 8, fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700 }}>
          <span>#</span>
          <span>Usuario</span>
          <span style={{ textAlign: 'right' }}>Nota</span>
          <span style={{ textAlign: 'right' }}>Exámenes</span>
          <span style={{ textAlign: 'right' }}>Racha</span>
        </div>

        {ranking.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
            Nadie ha hecho un examen todavía. ¡Sé el primero! 🚀
          </div>
        ) : (
          ranking.map((r, i) => {
            const isMe = r.id === user?.id
            const medal = medalEmoji(i)
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 60px 60px 48px',
                  gap: 8,
                  padding: '11px 16px',
                  borderBottom: '1px solid var(--line)',
                  background: isMe ? 'var(--accent-soft)' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '.82rem', color: medal ? 'inherit' : 'var(--muted)' }}>
                  {medal ?? (i + 1)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: isMe ? 700 : 500, fontSize: '.85rem', color: isMe ? 'var(--accent)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{r.username}
                    {isMe && <span style={{ marginLeft: 6, fontSize: '.7rem', background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '1px 6px' }}>Tú</span>}
                  </div>
                  {(r.streak ?? 0) > 0 && (
                    <div style={{ fontSize: '.7rem', color: 'var(--warn)' }}>🔥 {r.streak} días</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '.9rem', color: Number(r.avg_score) >= 5 ? 'var(--ok)' : 'var(--err)' }}>
                  {r.avg_score != null ? formatScore(Number(r.avg_score)) : '—'}
                </div>
                <div style={{ textAlign: 'right', fontSize: '.82rem', color: 'var(--muted)' }}>
                  {r.total_exams ?? 0}
                </div>
                <div style={{ textAlign: 'right', fontSize: '.82rem', color: 'var(--muted)' }}>
                  {(r.streak ?? 0) > 0 ? `🔥${r.streak}` : '—'}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* My position if outside top 50 */}
      {myIndex === -1 && user && (
        <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
          <p style={{ fontSize: '.85rem', color: 'var(--accent)', fontWeight: 600 }}>
            Todavía no apareces en el ranking. ¡Completa tu primer examen para entrar!
          </p>
        </div>
      )}
    </div>
  )
}
