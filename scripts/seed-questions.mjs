/**
 * Seed script: reads data.js from the old project and inserts all questions into Supabase.
 * Run once after setting up Supabase:
 *   node scripts/seed-questions.mjs
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * You can load them with: node --env-file=.env.local scripts/seed-questions.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Missing env vars. Run:')
  console.error('   node --env-file=.env.local scripts/seed-questions.mjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

// Read & eval the original data.js — it sets QBANK in scope
const dataPath = join(__dirname, '..', '..', 'OneDrive', 'Desktop', 'comunitaria', 'data.js')
let rawData
try {
  rawData = readFileSync(dataPath, 'utf-8')
} catch {
  // Try alternate path (running from different CWD)
  const alt = join(process.env.USERPROFILE || process.env.HOME || '', 'OneDrive', 'Desktop', 'comunitaria', 'data.js')
  rawData = readFileSync(alt, 'utf-8')
}

// Replace const/let with var so the Function constructor can return QBANK
const script = rawData
  .replace(/^const /gm, 'var ')
  .replace(/^let /gm, 'var ')

// Use Function() instead of eval() — works correctly in ES modules
const questions = new Function(script + '\nreturn QBANK;')()

console.log(`📚  Found ${questions.length} questions — inserting into Supabase...`)

// Map to DB schema
const rows = questions.map(q => ({
  id:       q.id,
  topic:    q.topic,
  question: q.q,
  answers:  q.answers,  // jsonb
  is_active: true,
}))

// Upsert in batches of 100
const BATCH = 100
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' })
  if (error) {
    console.error(`❌  Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`   ✅  ${Math.min(i + BATCH, rows.length)} / ${rows.length}`)
}

console.log(`\n🎉  All ${rows.length} questions seeded successfully!`)
