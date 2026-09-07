# VECT CT LAB — Hybrid Engine (Vite + Tailwind + Supabase + Vercel)

PRD: [`../PRD_V5_Hybrid_VECT_CT_LAB.md`](../PRD_V5_Hybrid_VECT_CT_LAB.md) — gabungan V4 (simplicity) + projek.docx (pedagogical depth).

## Stack

Vite 5 + React 18 + Tailwind 3.4 + Zustand + @dnd-kit + Framer Motion + Supabase + vite-plugin-pwa

## Cara Jalan (Tahap 1 — MVP1 Skeleton)

```bash
cd app
npm install
cp .env.example .env  # isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY jika ada Supabase
npm run dev            # http://localhost:5173
npm run build          # production + PWA (sw.js)
```

Tanpa Supabase tetap jalan (mode offline — data di localStorage + IndexedDB + export CSV di Hub).

## Flow (8 Route)

`/` (Briefing) → `/onboarding` → `/hub` → `/module/1` (Adonan) → `/module/2` (Pupuk, 3 eksperimen + drag&drop + verify) → `/reflection` → `/result` → `/dashboard` (guru)

Hub → `Selesai & Kirim Laporan` = insert ke Supabase `sessions` + download CSV V4-compatible.

## Supabase Setup (opsional untuk Tahap 1)

1. Buat project di supabase.com
2. SQL Editor → paste migrasi dari PRD V5 §9.2
3. Isi `.env`

## Deploy Vercel

```bash
vercel --prod
# atau push ke GitHub → import di vercel.com (Framework: Vite, Build: npm run build, Output: dist)
```

`vercel.json` sudah handle SPA rewrite.

## Next (Tahap 2)

- Hint engine 3 level full, evidence board graph, radar CT, realtime dashboard, test (Vitest/Playwright)
