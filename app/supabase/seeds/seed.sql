-- Seed minimal untuk testing dashboard
-- Jalankan setelah 001_initial_schema.sql

insert into students (name, class, absen) values
  ('Budi Santoso', 'VIII-A', 12),
  ('Siti Aminah', 'VIII-A', 5),
  ('Rizky Demo', 'VIII-B', 1)
on conflict (name, class, absen) do nothing;

-- Ambil id Budi
-- insert contoh sesi completed
insert into sessions (student_id, mod1_score, mod2_score, water_correct, reasoning, status, attempts, hints_used, debugging_attempts)
select id, 100, 80, true, 'Saya lihat C ada di EXP1 & EXP3 dengan kelopak putih, jadi C=Putih.', 'completed', 3, 1, 2
from students where name='Budi Santoso' limit 1;

-- CT skills contoh
insert into ct_skills (student_id, pattern_recognition, algorithmic_thinking, debugging, abstraction, decomposition)
select id, 85, 100, 80, 70, 80 from students where name='Budi Santoso'
on conflict (student_id) do update set pattern_recognition=85, algorithmic_thinking=100;
