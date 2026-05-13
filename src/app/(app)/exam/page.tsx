'use client'
import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TOPICS } from '@/lib/topics'
import { shuffle, toExamQuestion, calcScore, formatScore } from '@/lib/utils'
import type { Question, ExamQuestion, ExamAnswer, TopicId, ExamMode } from '@/lib/types'

function ExamContent() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const topicsParam = (params.get('topics') ?? 'tema6,tema7,tema8,tema9,tema10').split(',') as TopicId[]
  const nParam = Number(params.get('n') ?? 20)
  const mode = (params.get('mode') ?? 'exam') as ExamMode
  const minutes = Number(params.get('minutes') ?? 30)
  const onlyFailed = params.get('failed') === '1'

  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [answers, setAnswers] = useState<ExamAnswer[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(minutes * 60)
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showStudyFeedback, setShowStudyFeedback] = useState(false)
  const submitted = useRef(false)

  // Load questions from Supabase
  useEffect(() => {
    async function loadQuestions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let query = supabase.from('questions').select('*').eq('is_active', true).in('topic', topicsParam)

      if (onlyFailed) {
        const { data: failedRows } = await supabase.from('user_failed').select('question_id').eq('user_id', user.id)
        const failedIds = (failedRows ?? []).map(r => r.question_id)
        if (failedIds.length === 0) { setError('No tienes preguntas falladas en estos temas.'); setLoading(false); return }
        query = query.in('id', failedIds)
      }

      const { data, error: dbErr } = await query
      if (dbErr) { setError(dbErr.message); setLoading(false); return }
      if (!data || data.length === 0) { setError('No hay preguntas disponibles para esta configuración.'); setLoading(false); return }

      // Equitable distribution across topics
      const byTopic: Record<string, Question[]> = {}
      for (const q of data as Question[]) {
        if (!byTopic[q.topic]) byTopic[q.topic] = []
        byTopic[q.topic].push(q)
      }

      const activeTopics = topicsParam.filter(t => (byTopic[t]?.length ?? 0) > 0)
      const perTopic = Math.max(1, Math.floor(nParam / activeTopics.length))
      let selected: Question[] = []
      for (const t of activeTopics) {
        selected = [...selected, ...shuffle(byTopic[t] ?? []).slice(0, perTopic)]
      }
      selected = shuffle(selected).slice(0, nParam)

      const examQs = selected.map(toExamQuestion)
      setQuestions(examQs)
      setAnswers(examQs.map(q => ({ questionId: q.id, selectedIndex: null, isCorrect: null })))
      setLoading(false)
    }
    loadQuestions()
  }, []) // eslint-disable-line

  // Timer
  useEffect(() => {
    if (loading || finished) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); handleFinish(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [loading, finished]) // eslint-disable-line

  const handleFinish = useCallback(async () => {
    if (submitted.current) return
    submitted.current = true
    setFinished(true)
    setSubmitting(true)

    const correct = answers.filter(a => a.isCorrect === true).length
    const wrong   = answers.filter(a => a.isCorrect === false).length
    const blank   = answers.filter(a => a.selectedIndex === null).length
    const score   = calcScore(correct, wrong, questions.length)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save session
    await supabase.from('exam_sessions').insert({
      user_id: user.id,
      topics: topicsParam,
      mode,
      n_total: questions.length,
      n_correct: correct,
      n_wrong: wrong,
      n_blank: blank,
      score,
    })

    // Update failed questions
    const wrongQIds = answers.filter(a => a.isCorrect === false).map(a => a.questionId)
    const correctQIds = answers.filter(a => a.isCorrect === true).map(a => a.questionId)

    if (wrongQIds.length > 0) {
      for (const qid of wrongQIds) {
        await supabase.from('user_failed').upsert({ user_id: user.id, question_id: qid, fail_count: 1, last_failed_at: new Date().toISOString() }, { onConflict: 'user_id,question_id', ignoreDuplicates: false })
      }
    }
    if (correctQIds.length > 0) {
      await supabase.from('user_failed').delete().eq('user_id', user.id).in('question_id', correctQIds)
    }

    // Update streak + total_exams via RPC / direct update
    const today = new Date().toISOString().split('T')[0]
    const { data: profile } = await supabase.from('profiles').select('streak, best_streak, last_study_date, total_exams').eq('id', user.id).single()
    if (profile) {
      const lastDate = profile.last_study_date
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = lastDate === today ? profile.streak : lastDate === yesterday ? profile.streak + 1 : 1
      const newBest   = Math.max(newStreak, profile.best_streak)
      await supabase.from('profiles').update({ streak: newStreak, best_streak: newBest, last_study_date: today, total_exams: profile.total_exams + 1 }).eq('id', user.id)
    }

    // Redirect to results
    const resultParams = new URLSearchParams({ correct: correct.toString(), wrong: wrong.toString(), blank: blank.toString(), score: score.toString(), total: questions.length.toString(), mode })
    router.push(`/results?${resultParams}`)
    setSubmitting(false)
  }, [answers, questions, topicsParam, mode]) // eslint-disable-line

  function selectAnswer(answerIndex: number) {
    const q = questions[current]
    const isCorrect = answerIndex === q.correctIndex
    setAnswers(prev => prev.map((a, i) => i === current ? { ...a, selectedIndex: answerIndex, isCorrect } : a))
    if (mode === 'study') setShowStudyFeedback(true)
  }

  function next() {
    setShowStudyFeedback(false)
    if (current < questions.length - 1) setCurrent(c => c + 1)
    else handleFinish()
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Cargando preguntas…</div>
  if (error) return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚠️</div>
      <p style={{ color: 'var(--err)', marginBottom: 16 }}>{error}</p>
      <button className="btn btn-accent" onClick={() => router.push('/setup')}>Volver a configuración</button>
    </div>
  )
  if (finished && submitting) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Guardando resultados…</div>

  const q = questions[current]
  const currentAnswer = answers[current]
  const progress = ((current + 1) / questions.length) * 100
  const answered = answers.filter(a => a.selectedIndex !== null).length
  const correct = answers.filter(a => a.isCorrect === true).length
  const wrong   = answers.filter(a => a.isCorrect === false).length

  const topicInfo = TOPICS.find(t => t.id === q?.topic)

  return (
    <div className="flex flex-col gap-4 animate-up">
      {/* Header bar */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
            Pregunta <strong>{current + 1}</strong> / {questions.length}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {mode === 'exam' && (
              <>
                <span style={{ fontSize: '.75rem', color: 'var(--ok)', fontWeight: 700 }}>✓ {correct}</span>
                <span style={{ fontSize: '.75rem', color: 'var(--err)', fontWeight: 700 }}>✗ {wrong}</span>
              </>
            )}
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: timeLeft < 60 ? 'var(--err)' : 'var(--ink)' }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: 'var(--line)' }}>
          <div style={{ height: '100%', borderRadius: 99, background: topicInfo?.color ?? 'var(--accent)', width: `${progress}%`, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card">
        <div style={{ marginBottom: 8 }}>
          <span className="badge" style={{ background: topicInfo?.tint, color: topicInfo?.color }}>{topicInfo?.short}</span>
        </div>
        <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
          {q?.question}
        </p>

        <div className="flex flex-col gap-2">
          {q?.shuffledAnswers.map((ans, idx) => {
            const isSelected = currentAnswer?.selectedIndex === idx
            const isAnswered = mode === 'study' && showStudyFeedback
            const isCorrectAns = idx === q.correctIndex
            let bg = 'var(--surface)', border = 'var(--line-2)', color = 'var(--ink)'
            if (isSelected && !isAnswered) { bg = 'var(--accent-soft)'; border = 'var(--accent)'; color = 'var(--accent)' }
            if (isAnswered && isCorrectAns) { bg = 'var(--ok-soft)'; border = 'var(--ok)'; color = 'var(--ok)' }
            if (isAnswered && isSelected && !isCorrectAns) { bg = 'var(--err-soft)'; border = 'var(--err)'; color = 'var(--err)' }
            return (
              <button
                key={idx}
                onClick={() => { if (!isAnswered && currentAnswer?.selectedIndex === null) selectAnswer(idx) }}
                disabled={isAnswered || (mode === 'exam' && currentAnswer?.selectedIndex !== null)}
                style={{ padding: '11px 14px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color, textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer', fontWeight: isSelected || (isAnswered && isCorrectAns) ? 700 : 400, fontSize: '.9rem', lineHeight: 1.4, transition: 'all .15s' }}
              >
                <span style={{ opacity: .5, marginRight: 8, fontSize: '.75rem' }}>{String.fromCharCode(65 + idx)}</span>
                {ans}
              </button>
            )
          })}
        </div>

        {/* Study mode feedback */}
        {mode === 'study' && showStudyFeedback && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: currentAnswer?.isCorrect ? 'var(--ok-soft)' : 'var(--err-soft)', color: currentAnswer?.isCorrect ? 'var(--ok)' : 'var(--err)', fontWeight: 600, fontSize: '.85rem' }}>
            {currentAnswer?.isCorrect ? '✓ Correcto' : `✗ Incorrecto — La respuesta era: "${q?.shuffledAnswers[q.correctIndex]}"`}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/setup')} style={{ fontSize: '.8rem' }}>
          Abandonar
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {mode === 'exam' && current < questions.length - 1 && currentAnswer?.selectedIndex === null && (
            <button className="btn btn-ghost" onClick={() => setCurrent(c => c + 1)} style={{ fontSize: '.82rem' }}>
              En blanco →
            </button>
          )}
          {(mode === 'study' ? showStudyFeedback : currentAnswer?.selectedIndex !== null) && (
            <button className="btn btn-accent" onClick={next}>
              {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultados'}
            </button>
          )}
          {mode === 'exam' && current === questions.length - 1 && (
            <button className="btn btn-accent" onClick={() => handleFinish()}>
              Terminar examen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExamPage() {
  return <Suspense fallback={<div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Cargando…</div>}><ExamContent /></Suspense>
}
