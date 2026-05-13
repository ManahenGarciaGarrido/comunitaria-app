import { clsx, type ClassValue } from 'clsx'
import type { ExamQuestion, Question } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Shuffle array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Convert raw Question → ExamQuestion (shuffle answers, track correct index) */
export function toExamQuestion(q: Question): ExamQuestion {
  const correct = q.answers[0]
  const shuffled = shuffle(q.answers)
  return {
    ...q,
    shuffledAnswers: shuffled,
    correctIndex: shuffled.indexOf(correct),
  }
}

/** Score formula: max(0, (correct - wrong/3) / total * 10) */
export function calcScore(correct: number, wrong: number, total: number): number {
  if (total === 0) return 0
  return Math.max(0, ((correct - wrong / 3) / total) * 10)
}

export function formatScore(score: number): string {
  return score.toFixed(2)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  return `hace ${days} d`
}
