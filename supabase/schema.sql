-- ══════════════════════════════════════════════════════
-- COMUNITARIA II · Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ══════════════════════════════════════════════════════

-- ── EXTENSIONS ──────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  role        text not null default 'student' check (role in ('student','admin')),
  streak      integer not null default 0,
  best_streak integer not null default 0,
  last_study_date date,
  total_exams integer not null default 0,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by all authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── QUESTIONS ───────────────────────────────────────
create table if not exists public.questions (
  id          integer primary key,
  topic       text not null check (topic in ('tema6','tema7','tema8','tema9','tema10')),
  question    text not null,
  answers     jsonb not null,  -- answers[0] is always correct
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

alter table public.questions enable row level security;

create policy "Questions readable by all authenticated users"
  on public.questions for select
  using (auth.role() = 'authenticated');

create policy "Only admins can insert questions"
  on public.questions for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update questions"
  on public.questions for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete questions"
  on public.questions for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── EXAM SESSIONS ───────────────────────────────────
create table if not exists public.exam_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topics      text[] not null,
  mode        text not null check (mode in ('exam','study')),
  n_total     integer not null,
  n_correct   integer not null default 0,
  n_wrong     integer not null default 0,
  n_blank     integer not null default 0,
  score       numeric(5,2) not null default 0,
  created_at  timestamptz default now()
);

alter table public.exam_sessions enable row level security;

create policy "Users see their own sessions"
  on public.exam_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert their own sessions"
  on public.exam_sessions for insert
  with check (auth.uid() = user_id);

-- ── USER FAILED QUESTIONS ───────────────────────────
create table if not exists public.user_failed (
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   integer not null references public.questions(id),
  fail_count    integer not null default 1,
  last_failed_at timestamptz default now(),
  primary key (user_id, question_id)
);

alter table public.user_failed enable row level security;

create policy "Users see their own failed"
  on public.user_failed for select
  using (auth.uid() = user_id);

create policy "Users upsert their own failed"
  on public.user_failed for insert
  with check (auth.uid() = user_id);

create policy "Users update their own failed"
  on public.user_failed for update
  using (auth.uid() = user_id);

create policy "Users delete their own failed"
  on public.user_failed for delete
  using (auth.uid() = user_id);

-- ── RANKING VIEW ────────────────────────────────────
create or replace view public.ranking as
select
  p.id,
  p.username,
  p.streak,
  p.best_streak,
  p.total_exams,
  coalesce(avg(s.score), 0)::numeric(5,2) as avg_score,
  coalesce(sum(s.n_correct), 0)::integer   as total_correct,
  coalesce(count(s.id), 0)::integer        as exams_done
from public.profiles p
left join public.exam_sessions s on s.user_id = p.id
where p.role = 'student'
group by p.id, p.username, p.streak, p.best_streak, p.total_exams
order by avg_score desc, total_correct desc;

-- Grant select on view to authenticated users
grant select on public.ranking to authenticated;

-- ── VOKAB PLATFORM MIGRATION ────────────────────────
-- Run this block if upgrading from Comunitaria-only schema

-- Add platform metadata fields to questions
alter table public.questions
  add column if not exists university text      not null default 'UAX',
  add column if not exists degree     text      not null default 'Enfermería',
  add column if not exists year       integer   not null default 3,
  add column if not exists subject    text      not null default 'Comunitaria II',
  add column if not exists is_public  boolean   not null default true;

-- Allow unauthenticated (anon) users to read public questions (for /browse page)
create policy "Public questions readable by everyone"
  on public.questions for select
  using (is_public = true);

-- Index for fast browse queries
create index if not exists idx_questions_university on public.questions(university);
create index if not exists idx_questions_subject    on public.questions(subject);
create index if not exists idx_questions_is_public  on public.questions(is_public);
