import type { Topic, TopicId } from './types'

export const TOPICS: Topic[] = [
  { id: 'tema6',  name: 'Tema 6',  short: 'T6',  full: 'Obesidad y Cáncer',                    color: '#9a3412', tint: '#fdebd9' },
  { id: 'tema7',  name: 'Tema 7',  short: 'T7',  full: 'Medio Ambiente y Salud Comunitaria',    color: '#1d4d3c', tint: '#dceae2' },
  { id: 'tema8',  name: 'Tema 8',  short: 'T8',  full: 'EDO y Alertas de Salud Pública',        color: '#1e3a5f', tint: '#dde6f2' },
  { id: 'tema9',  name: 'Tema 9',  short: 'T9',  full: 'Salud Internacional y Viajero',         color: '#4c1d6b', tint: '#e8dcf3' },
  { id: 'tema10', name: 'Tema 10', short: 'T10', full: 'Prevención de Accidentes',              color: '#92400e', tint: '#fbe7c8' },
]

export const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t])) as Record<TopicId, Topic>

export function getTopic(id: TopicId) { return TOPIC_MAP[id] }
