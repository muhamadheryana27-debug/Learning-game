# Supabase Setup — VECT CT LAB (Online)

## 1. Buat Project

1. Buka https://supabase.com → New project
2. Region: `ap-southeast-1 (Singapore)` (terdekat)
3. Set DB password → Create (tunggu ~1 menit)

## 2. Jalankan Migration

1. Dashboard → **SQL Editor** → New query
2. Copy-paste isi `supabase/migrations/001_initial_schema.sql` → **Run**
3. Verifikasi: `select table_name from information_schema.tables where table_schema='public';` → harus ada `students, sessions, module1_traces, module2_answers, lab_experiments, reflections, ct_skills`

Opsional seed:

```sql
-- Copy supabase/seeds/seed.sql → Run (untuk test dashboard)
```

## 3. Aktifkan Realtime (untuk dashboard live)

Dashboard → **Database** → **Realtime** → Enable untuk tabel:

```sql
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table module1_traces;
alter publication supabase_realtime add table module2_answers;
```

Atau via SQL Editor jalankan 4 baris di atas.

## 4. Ambil Keys & Set ENV

Dashboard → **Project Settings** → **Data API** (atau API):

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

Di lokal:

```bash
cp .env.example .env
# isi 2 variabel di atas
```

Di Vercel:

Project → Settings → Environment Variables → tambah `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` → Redeploy.

## 5. Test Koneksi

```bash
npm run dev
# Buka http://localhost:5173 → Onboarding → Hub → Modul 1/2 → Kirim Laporan
# Cek Dashboard → harus muncul baris baru
# Atau SQL: select * from teacher_overview limit 5;
```

Validasi anon insert:

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/rest/v1/students" \
  -H "apikey: YOUR_ANON" -H "Authorization: Bearer YOUR_ANON" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","class":"VIII-A","absen":99}'
```

## 6. RLS MVP1 → MVP2

- **MVP1** (sekarang): anon boleh `insert/select/update` semua tabel (untuk PJJ darurat, tanpa auth).
- **MVP2**: aktifkan Supabase Auth (email/pin guru) + buat policy `role = teacher` bisa select all, siswa hanya own rows. Lihat komentar RLS di migration.

## 7. Backup & Export

Dashboard → **Database** → **Backups** (harian otomatis di Pro) atau `pg_dump`.

CSV export V4-kompatibel via app: **Hub → Selesai & Kirim Laporan** atau **Dashboard → Export CSV**.

## 8. Troubleshooting

- `permission denied` → cek RLS policies enabled & `Allow anon ...` exists.
- `relation does not exist` → migration belum di-Run.
- `realtime not working` → cek Realtime enabled + publication add table.

## 9. File Referensi

- `migrations/001_initial_schema.sql` — schema lengkap PRD V5 §9.2
- `seeds/seed.sql` — data dummy
- `src/lib/supabase.ts` — client + `isSupabaseConfigured` + `checkSupabaseConnection()`
