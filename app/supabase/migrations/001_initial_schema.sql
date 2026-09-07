-- ============================================
-- VECT CT LAB — Supabase Initial Schema
-- PRD V5 §9.2 + Blind Test + Pastry Kitchen
-- Run in Supabase Dashboard > SQL Editor
-- ============================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. students
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class text not null check (class in ('VIII-A','VIII-B','VIII-C','VIII-D')),
  absen integer not null check (absen between 1 and 40),
  created_at timestamptz default now(),
  unique (name, class, absen)
);
create index if not exists idx_students_class on students(class);

-- 2. sessions (pengganti student_activity_log.csv V4)
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  start_time timestamptz default now(),
  finish_time timestamptz,
  mod1_score integer not null default 0 check (mod1_score between 0 and 100),
  mod2_score integer not null default 0 check (mod2_score between 0 and 100),
  water_correct boolean not null default false,
  reasoning text,
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  attempts integer not null default 0,
  hints_used integer not null default 0,
  debugging_attempts integer not null default 0,
  -- final_score = (M1*0.4 + M2*0.6) - hints*10, clamped 0-100
  final_score integer generated always as (
    greatest(0, least(100, ( (mod1_score * 0.4 + mod2_score * 0.6)::int - hints_used*10 )))
  ) stored
);
create index if not exists idx_sessions_student on sessions(student_id);
create index if not exists idx_sessions_status on sessions(status);
create index if not exists idx_sessions_start on sessions(start_time desc);

-- 3. module1_traces (pabrik/dough pipeline)
create table if not exists module1_traces (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  door integer not null check (door between 1 and 3),
  start_shape text not null check (start_shape in ('Square','Triangle','Circle')),
  pipeline jsonb not null,          -- [["Square","Triangle"], ...] actual gates used (GATES ids)
  history jsonb not null,           -- ["Square","Triangle","Circle"]
  result_shape text not null check (result_shape in ('Square','Triangle','Circle')),
  served boolean not null default false, -- apakah cocok dengan pelanggan
  created_at timestamptz default now()
);
create index if not exists idx_m1_session on module1_traces(session_id);

-- 4. module2_answers (pupuk ajaib — blind test)
create table if not exists module2_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  assignments jsonb not null,       -- {"A":"Air Biasa", "B":"Menumbuhkan Daun", ...}
  experiment_answers jsonb not null default '[]'::jsonb, -- [{"exp":1,"checked":["Daun"]}, ...]
  verified boolean not null default false,
  verify_details jsonb,             -- hasil verifyAll()
  created_at timestamptz default now()
);
create index if not exists idx_m2_session on module2_answers(session_id);

-- 5. lab_experiments (lab bench — pastry kitchen style, optional normalized)
create table if not exists lab_experiments (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  selected_beakers text[] not null, -- {"A","B","C"}
  flower_state jsonb not null,      -- FlowerState
  animation_phase text not null default 'idle',
  created_at timestamptz default now()
);

-- 6. reflections
create table if not exists reflections (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  q1 text not null,
  q2 text not null,
  q3 text not null,
  q4_essay text,
  score integer not null default 0 check (score between 0 and 100),
  created_at timestamptz default now()
);
create index if not exists idx_ref_session on reflections(session_id);

-- 7. ct_skills (agregat per siswa — radar)
create table if not exists ct_skills (
  student_id uuid primary key references students(id) on delete cascade,
  pattern_recognition integer not null default 0 check (pattern_recognition between 0 and 100),
  algorithmic_thinking integer not null default 0 check (algorithmic_thinking between 0 and 100),
  debugging integer not null default 0 check (debugging between 0 and 100),
  abstraction integer not null default 0 check (abstraction between 0 and 100),
  decomposition integer not null default 0 check (decomposition between 0 and 100),
  updated_at timestamptz default now()
);

-- 8. Teacher view (untuk dashboard)
create or replace view teacher_overview as
select
  s.id as student_id,
  s.name, s.class, s.absen,
  sess.id as session_id,
  sess.mod1_score, sess.mod2_score, sess.water_correct,
  sess.reasoning, sess.status, sess.attempts, sess.hints_used,
  sess.debugging_attempts, sess.final_score, sess.start_time, sess.finish_time
from students s
join sessions sess on sess.student_id = s.id
order by s.class, s.absen, sess.start_time desc;

-- 9. Helper function — upsert CT skills
create or replace function upsert_ct_skills(
  p_student_id uuid,
  p_pattern integer,
  p_algo integer,
  p_debug integer,
  p_abstraction integer,
  p_decomp integer
) returns void as $$
begin
  insert into ct_skills (student_id, pattern_recognition, algorithmic_thinking, debugging, abstraction, decomposition)
  values (p_student_id, p_pattern, p_algo, p_debug, p_abstraction, p_decomp)
  on conflict (student_id) do update set
    pattern_recognition = excluded.pattern_recognition,
    algorithmic_thinking = excluded.algorithmic_thinking,
    debugging = excluded.debugging,
    abstraction = excluded.abstraction,
    decomposition = excluded.decomposition,
    updated_at = now();
end;
$$ language plpgsql;

-- 10. Realtime — enable for sessions & students (for dashboard live)
-- Jalankan di Supabase Dashboard > Database > Realtime jika belum aktif:
-- alter publication supabase_realtime add table sessions;
-- alter publication supabase_realtime add table students;
-- alter publication supabase_realtime add table module1_traces;
-- alter publication supabase_realtime add table module2_answers;

-- 11. RLS
alter table students enable row level security;
alter table sessions enable row level security;
alter table module1_traces enable row level security;
alter table module2_answers enable row level security;
alter table lab_experiments enable row level security;
alter table reflections enable row level security;
alter table ct_skills enable row level security;

-- MVP1: anon boleh insert/select — tighten di MVP2 dengan JWT role
drop policy if exists "Allow anon insert students" on students;
create policy "Allow anon insert students" on students for insert with check (true);
drop policy if exists "Allow anon select students" on students;
create policy "Allow anon select students" on students for select using (true);
drop policy if exists "Allow anon update students" on students;
create policy "Allow anon update students" on students for update using (true);

drop policy if exists "Allow anon insert sessions" on sessions;
create policy "Allow anon insert sessions" on sessions for insert with check (true);
drop policy if exists "Allow anon select sessions" on sessions;
create policy "Allow anon select sessions" on sessions for select using (true);
drop policy if exists "Allow anon update sessions" on sessions;
create policy "Allow anon update sessions" on sessions for update using (true);

drop policy if exists "Allow anon all m1" on module1_traces;
create policy "Allow anon all m1" on module1_traces for all using (true) with check (true);
drop policy if exists "Allow anon all m2" on module2_answers;
create policy "Allow anon all m2" on module2_answers for all using (true) with check (true);
drop policy if exists "Allow anon all lab" on lab_experiments;
create policy "Allow anon all lab" on lab_experiments for all using (true) with check (true);
drop policy if exists "Allow anon all reflections" on reflections;
create policy "Allow anon all reflections" on reflections for all using (true) with check (true);
drop policy if exists "Allow anon all ct" on ct_skills;
create policy "Allow anon all ct" on ct_skills for all using (true) with check (true);

-- 12. Storage (optional — untuk upload bukti foto jika ada)
-- Buat bucket manual di Dashboard > Storage > New bucket: vect-assets (public)

-- Verification query (jalan setelah migrasi):
-- select table_name from information_schema.tables where table_schema='public' and table_name in ('students','sessions','module1_traces','module2_answers','reflections','ct_skills');
