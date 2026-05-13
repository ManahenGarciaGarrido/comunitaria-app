export type TopicId = 'tema6' | 'tema7' | 'tema8' | 'tema9' | 'tema10'
export type ExamMode = 'exam' | 'study'
export type UserRole = 'student' | 'admin'

export interface Topic {
  id: TopicId
  name: string
  short: string
  full: string
  color: string
  tint: string
}

export interface Question {
  id: number
  topic: TopicId
  question: string
  answers: string[] // answers[0] is always correct
  is_active: boolean
}

export interface Profile {
  id: string
  username: string
  role: UserRole
  streak: number
  best_streak: number
  last_study_date: string | null
  total_exams: number
  created_at: string
}

export interface ExamSession {
  id: string
  user_id: string
  topics: TopicId[]
  mode: ExamMode
  n_total: number
  n_correct: number
  n_wrong: number
  n_blank: number
  score: number
  created_at: string
}

export interface UserFailed {
  user_id: string
  question_id: number
  fail_count: number
  last_failed_at: string
}

export interface RankingRow {
  id: string
  username: string
  streak: number
  best_streak: number
  total_exams: number
  avg_score: number
  total_correct: number
  exams_done: number
}

// Exam engine types
export interface ExamQuestion extends Question {
  shuffledAnswers: string[]
  correctIndex: number  // index in shuffledAnswers that is correct
}

export interface ExamAnswer {
  questionId: number
  selectedIndex: number | null  // null = blank
  isCorrect: boolean | null
}

export interface ExamConfig {
  topics: TopicId[]
  n: number
  mode: ExamMode
  minutes: number
  onlyFailed: boolean
}
