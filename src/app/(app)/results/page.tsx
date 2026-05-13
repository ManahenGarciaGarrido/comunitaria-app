'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatScore } from '@/lib/utils'

function ResultsContent() {
  const params = useSearchParams()
  const router = useRouter()

  const correct = Number(params.get('correct') ?? 0)
  const wrong   = Number(params.get('wrong') ?? 0)
  const blank   = Number(params.get('blank') ?? 0)
  const score   = Number(params.get('score') ?? 0)
  const total   = Number(params.get('total') ?? 0)
  const mode    = params.get('mode') ?? 'exam'

  const passed  = score >= 5
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0

  // Score color
  const scoreColor = score >= 7 ? 'var(--ok)' : score >= 5 ? 'var(--warn)' : 'var(--err)'
  const scoreBg    = score >= 7 ? 'var(--ok-soft)' : score >= 5 ? 'var(--warn-soft)' : 'var(--err-soft)'

  const emoji = score >= 9 ? '🏆' : score >= 7 ? '🎉' : score >= 5 ? '✅' : score >= 3 ? '📚' : '😓'
  const msg   = score >= 9 ? '¡Excelente! Dominas el tema.'
              : score >= 7 ? '¡Muy bien! Sigue así.'
              : score >= 5 ? 'Aprobado, pero hay margen de mejora.'
              : score >= 3 ? 'Suspenso. Repasa los temas fallados.'
              : 'Necesitas repasar bastante. ¡Tú puedes!'

  return (
    <div className="flex flex-col gap-5 animate-up">
      {/* Score hero */}
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px', background: scoreBg, border: `2px solid ${scoreColor}` }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{emoji}</div>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
          {formatScore(score)}
        </div>
        <div style={{ fontSize: '1rem', color: scoreColor, fontWeight: 600, marginTop: 4 }}>/ 10</div>
        <div style={{ marginTop: 12, fontSize: '.9rem', color: 'var(--ink-2)', fontWeight: 500 }}>{msg}</div>
        <div style={{ marginTop: 8, display: 'inline-block', padding: '4px 14px', borderRadius: 99, background: scoreColor, color: '#fff', fontSize: '.78rem', fontWeight: 700 }}>
          {passed ? 'APROBADO' : 'SUSPENSO'}
        </div>
      </div>

      {/* Breakdown */}
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '.95rem' }}>Desglose</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'var(--ok-soft)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ok)' }}>{correct}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--ok)', fontWeight: 600, marginTop: 2 }}>Correctas</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'var(--err-soft)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--err)' }}>{wrong}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--err)', fontWeight: 600, marginTop: 2 }}>Incorrectas</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'var(--surface)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--muted)' }}>{blank}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>En blanco</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--muted)', marginBottom: 4 }}>
            <span>Aciertos sobre total</span>
            <span>{correct}/{total} ({pct}%)</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: scoreColor, width: `${pct}%`, transition: 'width .6s ease' }} />
          </div>
        </div>

        {mode === 'exam' && (
          <div style={{ marginTop: 12, fontSize: '.78rem', color: 'var(--muted)', padding: '8px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <strong>Fórmula aplicada:</strong> Nota = max(0, (aciertos − errores/3) / total × 10)
            <br />
            <span style={{ fontFamily: 'monospace' }}>{correct} − {wrong}/3 = {(correct - wrong/3).toFixed(2)} → {formatScore(score)}/10</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {wrong > 0 && (
          <button
            className="btn btn-accent"
            style={{ width: '100%', padding: '13px' }}
            onClick={() => router.push('/setup?failed=1')}
          >
            🔁 Repasar preguntas falladas ({wrong})
          </button>
        )}
        <button
          className="btn btn-accent"
          style={{ width: '100%', padding: '13px', background: 'var(--accent)' }}
          onClick={() => router.push('/setup')}
        >
          📝 Nuevo examen
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => router.push('/dashboard')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Cargando…</div>}>
      <ResultsContent />
    </Suspense>
  )
}
