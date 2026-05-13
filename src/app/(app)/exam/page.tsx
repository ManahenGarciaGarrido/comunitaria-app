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
  const onlyFailed  = params.get('failed') === '1'
  const notFailed   = params.get('notFailed') === '1'

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

      if (notFailed) {
        const { data: failedRows } = await supabase.from('user_failed').select('question_id').eq('user_id', user.id)
        const failedIds = (failedRows ?? []).map(r => r.question_id)
        if (failedIds.length > 0) {
          // Exclude failed questions — shows only "fresh" ones
          const { data: allData } = await query
          const filtered = (allData ?? []).filter((q: any) => !failedIds.includes(q.id))
          if (filtered.length === 0) { setError('No hay preguntas nuevas disponibles. ¡Has visto todas!'); setLoading(false); return }
          const examQs = shuffle(filtered as any[]).slice(0, nParam).map(toExamQuestion)
          setQuestions(examQs)
          setAnswers(examQs.map(q => ({ questionId: q.id, selectedIndex: null, isCorrect: null })))
          setLoading(false)
          return
        }
      }

      const { data, error: dbErr } = await query
      if (dbErr) { setError(dbErr.message); setLoading(false); return }
      if (!data || data.length === 0) { setError('No hay preguntas disponibles para esta configuración.'); setLoading(false); return }

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

  useEffect(() => {
    if (loading || finished || mode === 'study') return
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

    await supabase.from('exam_sessions').insert({
      user_id: user.id, topics: topicsParam, mode,
      n_total: questions.length, n_correct: correct, n_wrong: wrong, n_blank: blank, score,
    })

    const wrongQIds   = answers.filter(a => a.isCorrect === false).map(a => a.questionId)
    const correctQIds = answers.filter(a => a.isCorrect === true).map(a => a.questionId)

    if (wrongQIds.length > 0) {
      for (const qid of wrongQIds) {
        await supabase.from('user_failed').upsert(
          { user_id: user.id, question_id: qid, fail_count: 1, last_failed_at: new Date().toISOString() },
          { onConflict: 'user_id,question_id', ignoreDuplicates: false }
        )
      }
    }
    if (correctQIds.length > 0) {
      await supabase.from('user_failed').delete().eq('user_id', user.id).in('question_id', correctQIds)
    }

    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const { data: profile } = await supabase.from('profiles').select('streak, best_streak, last_study_date, total_exams').eq('id', user.id).single()
    if (profile) {
      const lastDate  = profile.last_study_date
      const newStreak = lastDate === today ? profile.streak : lastDate === yesterday ? profile.streak + 1 : 1
      const newBest   = Math.max(newStreak, profile.best_streak)
      await supabase.from('profiles').update({
        streak: newStreak, best_streak: newBest, last_study_date: today, total_exams: profile.total_exams + 1,
      }).eq('id', user.id)
    }

    const resultParams = new URLSearchParams({
      correct: correct.toString(), wrong: wrong.toString(), blank: blank.toString(),
      score: score.toString(), total: questions.length.toString(), mode,
    })
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

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'pulse-soft 1.5s ease infinite' }}>📚</div>
      <div style={{ fontWeight: 600 }}>Preparando preguntas…</div>
    </div>
  )

  if (error) return (
    <div className="card animate-up" style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
      <p style={{ color: 'var(--err)', marginBottom: 20, fontWeight: 500 }}>{error}</p>
      <button className="btn btn-accent" onClick={() => router.push('/setup')}>← Volver a configuración</button>
    </div>
  )

  if (finished && submitting) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
      <div style={{ fontWeight: 600 }}>Guardando resultados…</div>
    </div>
  )

  const q = questions[current]
  const currentAnswer = answers[current]
  const progress = ((current + 1) / questions.length) * 100
  const answered = answers.filter(a => a.selectedIndex !== null).length
  const correct  = answers.filter(a => a.isCorrect === true).length
  const wrong    = answers.filter(a => a.isCorrect === false).length
  const topicInfo = TOPICS.find(t => t.id === q?.topic)
  const isAnswered = mode === 'study' && showStudyFeedback
  const timeWarning = timeLeft < 60 && mode === 'exam'

  return (
    <div className="flex flex-col gap-4 animate-up">

      {/* ── Header bar ── */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge" style={{ background: topicInfo?.tint, color: topicInfo?.color }}>
              {topicInfo?.short}
            </span>
            <span style={{ fontSize: '.82rem', color: 'var(--muted)', fontWeight: 500 }}>
              Pregunta <strong style={{ color: 'var(--ink)' }}>{current + 1}</strong> de {questions.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {mode === 'exam' && (
              <>
                <span style={{ fontSize: '.8rem', color: 'var(--ok)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: '1rem' }}>✓</span> {correct}
                </span>
                <span style={{ fontSize: '.8rem', color: 'var(--err)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: '1rem' }}>✗</span> {wrong}
                </span>
              </>
            )}
            {mode === 'exam' && (
              <div style={{
                padding: '4px 10px',
                borderRadius: 20,
                background: timeWarning ? 'var(--err-soft)' : 'var(--bg2)',
                color: timeWarning ? 'var(--err)' : 'var(--ink2)',
                fontWeight: 700,
                fontSize: '.85rem',
                fontVariantNumeric: 'tabular-nums',
                border: `1px solid ${timeWarning ? 'rgba(155,44,40,.2)' : 'var(--border)'}`,
                transition: 'all .3s',
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, background: topicInfo?.color ?? 'var(--accent)' }} />
        </div>

        {/* Answered dots (mini) */}
        {questions.length <= 30 && (
          <div style={{ display: 'flex', gap: 3, marginTop: 8, flexWrap: 'wrap' }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === current ? 'var(--accent)' : a.isCorrect === true ? 'var(--ok)' : a.isCorrect === false ? 'var(--err)' : a.selectedIndex !== null ? 'var(--muted2)' : 'var(--border2)',
                transition: 'background .2s',
                flexShrink: 0,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Question card ── */}
      <div className="card" style={{ padding: '24px' }}>
        <p style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.55, color: 'var(--ink)', marginBottom: 20 }}>
          {q?.question}
        </p>

        <div className="flex flex-col gap-2">
          {q?.shuffledAnswers.map((ans, idx) => {
            const isSelected = currentAnswer?.selectedIndex === idx
            const isCorrectAns = idx === q.correctIndex
            let cls = 'answer-btn'
            if (isAnswered && isCorrectAns) cls += ' correct'
            else if (isAnswered && isSelected && !isCorrectAns) cls += ' wrong'
            else if (isSelected && !isAnswered) cls += ' selected'

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => { if (!isAnswered && currentAnswer?.selectedIndex === null) selectAnswer(idx) }}
                disabled={isAnswered || (mode === 'exam' && currentAnswer?.selectedIndex !== null)}
              >
                <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                <span>{ans}</span>
              </button>
            )
          })}
        </div>

        {/* Study feedback */}
        {mode === 'study' && showStudyFeedback && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: currentAnswer?.isCorrect ? 'var(--ok-soft)' : 'var(--err-soft)',
            color: currentAnswer?.isCorrect ? 'var(--ok)' : 'var(--err)',
            fontWeight: 600,
            fontSize: '.88rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            border: `1px solid ${currentAnswer?.isCorrect ? 'rgba(30,107,61,.15)' : 'rgba(155,44,40,.15)'}`,
          }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{currentAnswer?.isCorrect ? '✓' : '✗'}</span>
            <span>
              {currentAnswer?.isCorrect
                ? '¡Correcto!'
                : <>Incorrecto — La respuesta correcta es: <strong>"{q?.shuffledAnswers[q.correctIndex]}"</strong></>
              }
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => router.push('/setup')}
          style={{ fontSize: '.8rem', padding: '8px 16px' }}
        >
          ← Abandonar
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {mode === 'exam' && current < questions.length - 1 && currentAnswer?.selectedIndex === null && (
            <button
              className="btn btn-ghost"
              onClick={() => setCurrent(c => c + 1)}
              style={{ fontSize: '.82rem' }}
            >
              En blanco →
            </button>
          )}
          {(mode === 'study' ? showStudyFeedback : currentAnswer?.selectedIndex !== null) && (
            <button className="btn btn-accent" onClick={next} style={{ padding: '10px 24px' }}>
              {current < questions.length - 1 ? 'Siguiente →' : '🏁 Ver resultados'}
            </button>
          )}
          {mode === 'exam' && current === questions.length - 1 && currentAnswer?.selectedIndex !== null && (
            <button className="btn btn-accent" onClick={() => handleFinish()} style={{ padding: '10px 24px' }}>
              🏁 Terminar examen
            </button>
          )}
        </div>
      </div>

      {/* Answered counter */}
      <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--muted)' }}>
        {answered} de {questions.length} respondidas
        {mode === 'exam' && questions.length - current - 1 > 0 && ` · ${questions.length - current - 1} restantes`}
      </div>
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>📚</div>
        <div style={{ fontWeight: 600 }}>Cargando…</div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  )
}
