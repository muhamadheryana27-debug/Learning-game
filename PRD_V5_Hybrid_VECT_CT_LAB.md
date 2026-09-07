# PRD V5 — VECT CT LAB Hybrid Engine

## Volcano Emergency Computational Thinking — Interactive Learning Game

| Field | Detail |
|---|---|
| **Version** | 5.0.0 — Hybrid Executable Specification |
| **Status** | Approved — Ready for Development |
| **Menggabungkan** | `PRD_V4_Learning_Game_Engine.md` (Simplicity) + `projek.docx` (Pedagogical Depth) |
| **Tech Stack** | **Vite + React + Tailwind CSS + Supabase + Vercel** |
| **Target Platform** | Web Responsive (Mobile-first) + PWA Offline Cache |
| **Target Audience** | SMP Kelas VIII Fase D & Guru Informatika |
| **Konteks** | Pembelajaran Daring Darurat akibat Hujan Abu Vulkanik (PJJ Darurat) |
| **Durasi Sesi** | 45–60 menit (1 sesi = 2 modul) |
| **Date** | 7 September 2026 |
| **Author** | EdTech Product Team |

---

## Daftar Isi

1. [Visi & Prinsip Desain](#1-visi--prinsip-desain)
2. [Ringkasan Eksekutif & Arsitektur Hybrid](#2-ringkasan-eksekutif--arsitektur-hybrid)
3. [Tech Stack & Alasan Pemilihan](#3-tech-stack--alasan-pemilihan)
4. [Arsitektur Sistem & State Machine](#4-arsitektur-sistem--state-machine)
5. [Struktur Modul: CT LAB Framework](#5-struktur-modul-ct-lab-framework)
6. [User Journey Lengkap](#6-user-journey-lengkap)
7. [Spesifikasi Layar (Screen-by-Screen)](#7-spesifikasi-layar-screen-by-screen)
8. [Game Engine — Aturan & Logika Inti](#8-game-engine--aturan--logika-inti)
9. [Data Model & Supabase Schema](#9-data-model--supabase-schema)
10. [Telemetry, Analytics & Teacher Dashboard](#10-telemetry-analytics--teacher-dashboard)
11. [Scoring Algorithm & CT Skill Rubrik](#11-scoring-algorithm--ct-skill-rubrik)
12. [Hint System (3 Tingkat) & Debugging](#12-hint-system-3-tingkat--debugging)
13. [Design System — Tailwind CSS](#13-design-system--tailwind-css)
14. [Offline-First, PWA & Performance](#14-offline-first-pwa--performance)
15. [Keamanan & Privacy](#15-keamanan--privacy)
16. [Deployment — Vercel](#16-deployment--vercel)
17. [MVP Roadmap (3 Fase)](#17-mvp-roadmap-3-fase)
18. [Acceptance Criteria](#18-acceptance-criteria)
19. [Appendix — Prompt Canva AI & Referensi Bebras](#19-appendix--prompt-canva-ai--referensi-bebras)

---

## 1. Visi & Prinsip Desain

### 1.1 Visi Pembelajaran (dari `projek.docx`)

> Siswa **tidak diberi soal** "Gelas A berisi pupuk apa?"  
> Siswa ditempatkan sebagai **🔬 DETEKTIF LABORATORIUM**:  
> *"Pak Taro kehilangan catatan lima pupuk ajaib. Hanya ada 3 hasil eksperimen yang tersisa. Bisakah kamu menemukan isi setiap gelas A–F?"*

Siswa harus: **mengamati → mencari pola → mengelompokkan informasi → menguji kemungkinan → menarik kesimpulan → debugging → membuktikan solusi.**

### 1.2 Prinsip Hybrid

| Prinsip | Dari V4 | Dari projek.docx | Hasil Hybrid V5 |
|---|---|---|---|
| **Kesederhanaan** | 2 modul, state machine linear, CSV telemetry | - | Tetap 2 modul inti di MVP 1 |
| **Kedalaman Pedagogi** | - | CT LAB framework, evidence board, reflection | Setiap modul diperkaya fase eksplorasi & verifikasi |
| **Reusability** | Engine generik (DAG + Matrix) | Content Pack terpisah dari Engine | **CT LAB Engine** + **Scenario Pack** (Pupuk/Mesin) |
| **Aksesibilitas Darurat** | Offline executable (PyInstaller) | Mobile friendly, autosave, ringan | PWA + Supabase offline queue + Vercel Edge |

### 1.3 Jangan Membuat "Game Pupuk" — Buat **CT LAB Engine**

```
CT LAB (Computational Thinking Interactive Lab)
│
├── 🔎 Pattern Lab      → Scenario: Pupuk Ajaib (Magic Fertilizer)
├── ⚙️ Algorithm Lab    → Scenario: Mesin Pembentuk Adonan (Dough Factory)
├── 🧩 Decomposition Lab → (MVP 3) Robot Lalu Lintas
├── 🐞 Debugging Lab    → (MVP 3) Detektif Data
└── 🧠 Abstraction Lab  → (MVP 3) Paket Ekspansi Guru
```

Pupuk & Adonan adalah **Content Pack** di atas engine yang sama. Guru Informatika nanti bisa mengganti scenario tanpa mengubah engine.

---

## 2. Ringkasan Eksekutif & Arsitektur Hybrid

### 2.1 Apa yang Diambil dari V4

*   State machine sederhana: `ONBOARD → HUB → MODULE_1 / MODULE_2 → TELEMETRY_SYNC`
*   `TelemetryLogger` → di-port ke Supabase Realtime
*   `Module1DoughEngine` (DAG transformation) + `Module2FertilizerEngine` (Matrix deduction) → di-port ke TypeScript
*   Skor persentase + `Reasoning_Text` → diperluas menjadi CT Skill Rubrik
*   Lean & offline-resilient → diwujudkan via PWA + IndexedDB

### 2.2 Apa yang Diambil dari projek.docx

*   28 bagian pedagogi lengkap: Mission Briefing → DNA Pupuk → Eksperimen → Pattern Board → Drag & Drop → Final Verification → Reflection
*   Evidence board detektif (bukan tabel spreadsheet)
*   Sistem Hint 3 tingkat + feedback edukatif (bukan "SALAH!")
*   Teacher analytics & learning dashboard
*   Curiosity loop (PETUNJUK → HIPOTESIS → COBA → HASIL → "Eh kenapa?")
*   MVP bertahap (MVP 1 → 2 → 3)
*   Peran Canva AI untuk aset visual
*   Requirement P0/P1/P2 untuk kondisi hujan abu

### 2.3 Arsitektur V5 dalam Satu Kalimat

> **Web app Vite+React yang ringan, di-deploy di Vercel, menyimpan progres ke Supabase (dengan antrian offline), memakai Tailwind untuk UI konsisten, dan memisahkan *Game Engine* (state, validasi, scoring) dari *Content Pack* (soal Pupuk & Adonan) sehingga guru bisa menambah skenario baru tanpa coding.**

---

## 3. Tech Stack & Alasan Pemilihan

| Layer | Pilihan | Alasan Hybrid |
|---|---|---|
| **Build** | **Vite 5** | HMR <100ms, ES modules native, build ke Vercel 1-click. Pengganti `PyInstaller` V4. |
| **Frontend** | **React 18 + React Router 6** | State machine V4 (`clear_screen()` → route) natural di React. Ekosistem drag-drop matang. |
| **Styling** | **Tailwind CSS 3.4** | Utility-first = konsisten cepat. Mendukung desain `projek.docx` (kartu, board, lab) tanpa CSS custom berantakan. Dark mode built-in (P1 requirement). |
| **State** | **Zustand + React Context** | Lebih ringan dari Redux. Cocok untuk state machine game (mirip `VECTGameApp` class V4). |
| **Drag & Drop** | **@dnd-kit/core + @dnd-kit/sortable** | Aksesibel, mobile-touch friendly, keyboard navigable (kebutuhan P0). Alternatif `react-beautiful-dnd` deprecated. |
| **Animasi** | **Framer Motion** | Animasi bunga/eksperimen ringan, `whileDrag`, `AnimatePresence` untuk transisi layar. |
| **Form & Validasi** | **React Hook Form + Zod** | Validasi onboarding (`name`, `absen` wajib) — port dari `messagebox.showwarning` V4. |
| **Icons** | **Lucide React** | Konsisten, 1500+ icons, tree-shakeable. Untuk ikon lab, gelas, bunga. |
| **Database & Auth** | **Supabase (PostgreSQL + Realtime + Auth)** | Pengganti `student_activity_log.csv` V4. Row Level Security (RLS) untuk privacy siswa. Realtime untuk dashboard guru. Gratis tier cukup untuk 1 sekolah. |
| **Offline Cache** | **IndexedDB (idb) + Service Worker (vite-plugin-pwa)** | Antrian tulis saat offline, sync saat online kembali. Memenuhi NFR "Network Independence" V4. |
| **Deployment** | **Vercel** | Deploy `git push` otomatis, Edge Functions untuk API ringan, Analytics & Speed Insights built-in. |
| **Testing** | **Vitest + Testing Library + Playwright** | Unit untuk engine, E2E untuk flow onboarding→verifikasi. |

### 3.1 Bundle Target (NFR V4 di-port)

*   First Load JS < 180 kB gzipped (V4: <15 MB executable → web jauh lebih ringan)
*   Lighthouse Performance > 90, Accessibility > 95
*   TTFB < 300ms via Vercel Edge (Jakarta region)
*   PWA installable, works offline setelah kunjungan pertama

---

## 4. Arsitektur Sistem & State Machine

### 4.1 Diagram State Machine Hybrid

```
┌─────────────────────────┐
│ STATE_ONBOARDING        │◄── Input: Nama, Kelas, Absen (Zod validation)
│ Validasi + Supabase Auth│    Autosave ke localStorage
└────────────┬────────────┘
             │ student_info persisted
             ▼
┌─────────────────────────┐
│ STATE_HUB               │◄── Pilih Modul + Lihat Progress Ring
│ Greeting + Progress     │    Card Module 1 & 2 + Tombol "Lanjut Sesi Terakhir"
└──────┬──────────┬───────┘
       │          │
       ▼          ▼
┌────────────┐ ┌────────────────────────────┐
│ MODULE_1   │ │ MODULE_2                   │
│ Algorithm  │ │ Pattern Lab                │
│ Lab        │ │ Pupuk Ajaib                │
│            │ │                            │
│ S1: TRACE  │ │ S1: EVIDENCE_BOARD         │
│ S2: VERIFY │ │ S2: EXPERIMENT_1/2/3       │
│ S3: REFLECT│ │ S3: PATTERN_DETECTION      │
│            │ │ S4: DRAG_DROP_ASSIGN       │
│            │ │ S5: FINAL_VERIFICATION     │
│            │ │ S6: REFLECTION             │
└─────┬──────┘ └─────────────┬──────────────┘
      │                      │
      └──────────┬───────────┘
                 ▼
┌─────────────────────────┐
│ STATE_TELEMETRY_SYNC    │◄── Flush IndexedDB → Supabase
│ Auto-save + Dashboard   │    Tampilkan CT Skill Breakdown
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ STATE_DASHBOARD (Guru)  │◄── Realtime Supabase subscription
└─────────────────────────┘
```

### 4.2 Pemisahan Engine vs Content (dari projek.docx §22-24)

```
src/
├── engine/                 # CT LAB Engine (reusable)
│   ├── state/              # Zustand stores: onboarding, module1, module2, telemetry
│   ├── rules/              # Module1DoughEngine.ts + Module2FertilizerEngine.ts (port V4)
│   ├── scoring/            # scoring.ts, ctSkills.ts
│   ├── hints/              # hintEngine.ts (3 levels)
│   └── sync/               # supabaseClient.ts, offlineQueue.ts
├── content/                # Content Packs (ganti tanpa ubah engine)
│   ├── pupuk-ajaib/        # experiments.json, glasses.json, flowerEffects.json
│   └── mesin-adonan/       # shapes.json, pipelineRules.json
├── components/             # UI (Tailwind)
│   ├── onboarding/
│   ├── hub/
│   ├── module1/
│   ├── module2/
│   ├── shared/             # Button, Card, EvidenceBoard, DragDrop
│   └── dashboard/
├── lib/                    # supabase, validation (zod schemas)
└── routes/                 # React Router pages
```

---

## 5. Struktur Modul: CT LAB Framework

### 5.1 Module 1 — Mesin Pembentuk Adonan (Algorithm Lab)

**Fokus CT:** Algorithm, Conditional Logic, Tracing, Decomposition  
**Port dari:** `Module1DoughEngine` V4 (`SHAPES = ["Square","Triangle","Circle"]`)

**Aturan Transformasi (V4 `apply_gate` di-port ke TS):**

```typescript
// engine/rules/doughEngine.ts
export type Shape = "Square" | "Triangle" | "Circle";
export type Rule = [Shape, Shape]; // [src, dst] = IF input==src THEN dst ELSE input

export function applyGate(input: Shape, rule: Rule): Shape {
  const [src, dst] = rule;
  return input === src ? dst : input;
}
export function tracePipeline(start: Shape, pipeline: Rule[]) {
  let cur = start;
  const history: Shape[] = [cur];
  for (const r of pipeline) { cur = applyGate(cur, r); history.push(cur); }
  return { result: cur, history };
}
```

**Pola Hybrid:**
*   V4: `trace_pipeline("Square", [("Square","Triangle"),("Triangle","Circle")]) → "Circle"`
*   projek.docx §11-12: Adonan bergerak melalui labirin/jalur, siswa pilih jalur berdasarkan `IF bentuk==🔺 THEN ⚪`

**Level Design (2 tingkat kesulitan):**

| Level | Pipeline | Tujuan |
|---|---|---|
| M1-Easy | 2 gates, 1 kondisional | Memahami `IF-THEN-ELSE` |
| M1-Medium | 3 gates, 2 kondisional + 1 no-op | Tracing berurutan + debugging |

**Interaksi Web (menggantikan `messagebox` V4):**
*   Visual pipeline horizontal dengan kartu bentuk (▢ → △ → ○)
*   Animasi adonan bergerak tiap gate
*   History ditampilkan sebagai breadcrumb
*   Feedback: `✅ Pattern Found!` / `🔍 Cek kembali gate ke-2`

### 5.2 Module 2 — Pupuk Ajaib (Pattern Lab)

**Fokus CT:** Pattern Recognition, Feature Deduction, Multi-variable Logic Elimination, Debugging  
**Port dari:** `Module2FertilizerEngine` V4

**Database Efek (V4 `GLASS_PROPERTIES` di-port + diperkaya projek.docx):**

```typescript
// content/pupuk-ajaib/glasses.ts
export const GLASS_PROPERTIES: Record<string, string> = {
  A: "Air Biasa (Tanpa Efek)",
  B: "Menumbuhkan Daun",
  C: "Kelopak Berlapis & Putih",
  D: "Tangkai Bergelombang",
  E: "Tengah Bunga Hitam",
  F: "Air Biasa (Tanpa Efek)",
};
// Dua gelas air (A & F) → kunci pattern deduction (V4: water_correct = ans in ["A","F"])
```

**3 Eksperimen (dari projek.docx §7 + V4 implisit):**

| Eksperimen | Campuran | Hasil yang Diharapkan (features) |
|---|---|---|
| EXP 1 | A + B + C | Daun + Kelopak Berlapis & Putih |
| EXP 2 | A + D + E | Tangkai Bergelombang + Tengah Hitam |
| EXP 3 | C + D + F | Kelopak Berlapis & Putih + Tangkai Bergelombang |

> Siswa **tidak diberi tabel jawaban**. Mereka harus mencentang fitur (`☐ Kelopak berlapis` dst. — projek.docx §8) lalu drag gelas ke fitur di Pattern Board.

**Mekanik Hybrid:**

1.  **Evidence Board** (projek.docx §9): Visual graph `Gelas → Eksperimen → Ciri Bunga`, siswa tarik garis.
2.  **Drag & Drop Utama** (projek.docx §10): `🧴 A/B/C/D/E/F` → `🌸 Kelopak / 🍃 Daun / 〰️ Tangkai / ⚪ Putih / ⚫ Hitam / 💧 Air`
3.  **Final Verification** (projek.docx §18 + V4 `submit_telemetry`): Sistem jalankan 3 eksperimen otomatis, cek `MATCH ✓` semua.
4.  **Reasoning Text** (V4 `Reasoning_Text`): Textarea wajib sebelum submit — disimpan ke Supabase + dipakai rubrik.

### 5.3 Koneksi Antar Modul (projek.docx §12)

> "Dua materi pada gambar ... bisa dibuat menjadi satu learning journey."

Alur yang direkomendasikan V5:

```
Pattern Lab (Pupuk)  ──►  Algorithm Lab (Adonan)
Mengenali pola           Menelusuri aturan
      │                         │
      └────► Refleksi CT: Apa bedanya mencari pola vs mengikuti algoritma?
```

Hub menampilkan progress ring: `Pupuk 0/1 → Adonan 0/1 → Verifikasi → Selesai`

---

## 6. User Journey Lengkap

### 6.1 Journey Siswa (45–60 menit)

```
START
  │
  ▼
🎬 MISI DIMULAI — Mission Briefing
│  Laboratorium Pak Taro berantakan, animasi 🚨 DATA HILANG!
│  Dialog: "Aku lupa mencatat pupuk di tiap gelas..."
│  Tombol: [MULAI INVESTIGASI]
  ▼
📖 ONBOARDING — Identitas (V4: student_name, class_name, attendance_num)
│  Form: Nama Lengkap*, Kelas (VIII-A..D)*, No. Absen*
│  Validasi Zod, autosave localStorage
│  Tombol: [Masuk Lab →]
  ▼
🏠 HUB — Pilih Modul
│  Greeting: "Halo, {name} ({class})"
│  Card 1: 🍪 Mesin Pembentuk Adonan — "Ikuti jejak adonan melalui gerbang logika"
│  Card 2: 🌱 Pupuk Ajaib — "Temukan 2 gelas air dari 3 eksperimen"
│  Progress: Ring 0% → 50% → 100%
│  Tombol: [Lanjut Sesi Terakhir] jika ada IndexedDB pending
  ▼
┌─────────────────────────────────────────────────────────────────┐
│  JALUR A: MODULE 1 (10–15 menit)                                │
│  ┌─ Kenali DNA Bentuk (mini-game drag bentuk ke gate)          │
│  ├─ Trace Pipeline (visual ▢→△→○ + history)                    │
│  ├─ Feedback langsung + skor 0/50/100                          │
│  └─ Simpan & kembali ke HUB                                     │
├─────────────────────────────────────────────────────────────────┤
│  JALUR B: MODULE 2 (25–35 menit)                                │
│  ┌─ Kenali DNA Pupuk (6 kartu efek → drag ke bunga)            │
│  ├─ Eksperimen 1/2/3 (pilih gelas → [JALANKAN] → animasi)      │
│  ├─ Checklist fitur per eksperimen (6 checkbox)                 │
│  ├─ Evidence Board (graph interaktif)                           │
│  ├─ Drag & Drop: Gelas → Fitur (validasi tidak langsung)        │
│  ├─ Hint 1/2/3 (cost skor)                                     │
│  ├─ Final Verification (auto-run 3 eksperimen → MATCH ✓/✗)      │
│  └─ Reasoning textarea + simpan                                 │
└─────────────────────────────────────────────────────────────────┘
  ▼
🧠 REFLEKSI CT (5 menit) — 3 soal pilihan ganda + 1 esai singkat
│  Q1: Memecah masalah → Dekomposisi
│  Q2: Mencari kesamaan → Pattern Recognition
│  Q3: Memperbaiki dugaan → Debugging
  ▼
🏆 CASE SOLVED! — CT Skill Breakdown + Skor Akhir
│  Animasi konfeti, badge "Pattern Detective" / "Algorithm Tracer"
│  Tombol: [Kirim Laporan ke Guru] → flush ke Supabase
  ▼
📊 SELESAI — Kembali ke Hub atau Lihat Dashboard (jika guru)
```

### 6.2 Journey Guru (Dashboard)

```
Login (Supabase Auth, role: teacher)
  ▼
Dashboard Kelas
├─ Ringkasan: % selesai, rata-rata skor, rata-rata hints
├─ Tabel Siswa: Nama | Kelas | Absen | M1 | M2 | Air Benar | Reasoning | Status
├─ Heatmap Kesalahan Umum (mis. "60% salah mengidentifikasi Gelas F")
├─ Grafik CT Skill per kelas (radar chart)
├─ Detail per siswa: attempts, hint usage, debugging_attempts, trace_history
└─ Export: [CSV] [JSON] [PDF Laporan]
```

---

## 7. Spesifikasi Layar (Screen-by-Screen)

### 7.1 Layar 1 — Mission Briefing

*   **URL:** `/briefing`
*   **Komponen:** Full-screen hero, ilustrasi lab berantakan (Canva AI), dialog Pak Taro (avatar + bubble), tombol CTA besar (min 48px, P0).
*   **Aksi:** Klik `[MULAI INVESTIGASI]` → `/onboarding`
*   **Aksesibilitas:** Semua teks visual, audio opsional, tombol besar, kontras AA.

### 7.2 Layar 2 — Onboarding

*   **URL:** `/onboarding`
*   **Port V4:** `VECTGameApp.create_onboarding_screen()` → React Hook Form
*   **Fields:**
    *   `Nama Lengkap` — `Input` (required, min 3 char)
    *   `Kelas` — `Select` (VIII-A, VIII-B, VIII-C, VIII-D) — dari `ttk.Combobox` V4
    *   `No. Presensi` — `Input` type number (required, 1–40)
*   **Validasi:** Zod schema, error inline, `toast` jika kosong (pengganti `messagebox.showwarning`).
*   **Persist:** Simpan ke `localStorage` + Supabase `students` (upsert by name+class+absen).
*   **Aksi:** `[Masuk Lab →]` → `/hub`

### 7.3 Layar 3 — Hub Menu

*   **URL:** `/hub`
*   **Port V4:** `show_module_hub()` → React cards
*   **Komponen:**
    *   Header: `Halo, {name} ({class})` (dari `student_info`)
    *   Progress Ring (SVG, Tailwind `stroke-*`)
    *   Card Module 1: icon 🍪, judul, deskripsi, badge `Selesai 100%` atau `Mulai`
    *   Card Module 2: icon 🌱, judul, deskripsi, badge
    *   Tombol `[Selesai & Kirim Laporan]` → flush + `/result` (dari `submit_telemetry`)
*   **State:** Zustand `useProgressStore` — baca dari Supabase + IndexedDB pending.

### 7.4 Layar 4 — Module 1: Mesin Pembentuk Adonan

*   **URL:** `/module/1` dan `/module/1/trace`
*   **Layout:** Split — kiri: pipeline visual, kanan: kontrol & history
*   **Pipeline Visual:**
    *   `START` → `Gate 1` → `Gate 2` → `Gate 3` → `KELUAR`
    *   Setiap gate: `IF {src} THEN {dst}` dengan warna Tailwind (`bg-amber-100` dst.)
    *   Adonan (shape) animasi `motion.div` bergerak tiap gate
*   **Kontrol:**
    *   Pilih `Start Shape` (Square/Triangle/Circle) — segmented control
    *   Tombol `[Jalankan Pipeline]` → panggil `tracePipeline()` → tampilkan `history` sebagai chips
    *   Feedback: `Hasil: Circle — Akurasi 100%` (dari `messagebox.showinfo` V4)
*   **Scoring:** `100` jika `result === expected`, `50` jika 1 gate benar, `0` jika salah semua (sesuai V4 `mod1_score`).
*   **Persist:** `module1_pipelines` row + `sessions.score`.

### 7.5 Layar 5 — Module 2: Kenali DNA Pupuk (Pre-lab)

*   **URL:** `/module/2/intro`
*   **Dari projek.docx §6:** 6 kartu efek (Kelopak berlapis, Daun, Tangkai bergelombang, Putih, Hitam, Air).
*   **Interaksi:** Drag kartu ke bunga → bunga berubah (Framer Motion morph). Bukan penilaian utama, hanya *mental model building*.
*   **Tombol:** `[Lanjut ke Eksperimen →]`

### 7.6 Layar 6 — Module 2: Eksperimen 1–3

*   **URL:** `/module/2/experiment/:id` (1,2,3)
*   **Layout:** Lab bench — kiri: 6 gelas (A–F) selectable, tengah: tanaman uji, kanan: hasil
*   **Flow per eksperimen:**
    1.  Pilih 3 gelas (mis. A+B+C) — checkbox besar, Tailwind `peer-checked`
    2.  Klik `[JALANKAN EKSPERIMEN]` → animasi `A─┐ B─┼─→ 🌱 → ✨ → 🌸`
    3.  Hasil muncul: bunga dengan fitur (daun, kelopak, tangkai, warna)
    4.  Pertanyaan (projek.docx §8): *“Apa saja perubahan yang terjadi?”* — 6 checkbox fitur
    5.  Simpan jawaban checklist → `experiment_answers` JSON
*   **Validasi:** Minimal 1 fitur dicentang sebelum lanjut.

### 7.7 Layar 7 — Module 2: Pattern Board (Evidence Board)

*   **URL:** `/module/2/board`
*   **Dari projek.docx §9:** Visual graph detektif, bukan spreadsheet.
*   **Komponen:**
    *   Node: `🧴 A` di atas, `EXP 1/2/3` di tengah, `🌸 fitur` di bawah
    *   Siswa tarik garis SVG (mouse/touch) menghubungkan `Gelas → Eksperimen → Ciri`
    *   Garis benar: `stroke-emerald-500`, salah: `stroke-amber-400` + tooltip hint
*   **Tujuan:** Membantu *pattern recognition* sebelum drag-drop final.

### 7.8 Layar 8 — Module 2: Drag & Drop Utama (Sort the Evidence)

*   **URL:** `/module/2/assign`
*   **Dari projek.docx §10:** Area bawah: 6 gelas draggable; kanan: 6 fitur droppable.
*   **Interaksi (@dnd-kit):**
    *   Drag `🧴 A` → drop ke `⚪ Kelopak putih` atau `💧 Air`
    *   Jika benar (sesuai `GLASS_PROPERTIES`): `✨ Pattern Found!` + `+1 Pattern Recognition`
    *   Jika salah: `🔎 Hipotesismu belum cocok dengan semua bukti. Cek eksperimen lain?` (tidak pernah `SALAH!` keras)
*   **State:** `assignments: Record<Glass, Feature>` — persist ke Zustand + IndexedDB.
*   **Tombol:** `[Simpan Hipotesis]` → validasi semua 6 gelas ter-assign.

### 7.9 Layar 9 — Module 2: Final Verification

*   **URL:** `/module/2/verify`
*   **Dari projek.docx §18:** Tombol `[UJI SEMUA HIPOTESIS]` → sistem jalankan 3 eksperimen otomatis, bandingkan `predictedFeatures` vs `actualFeatures`.
*   **Tampilan:**

```
Eksperimen 1: A+B+C → 🌸 MATCH ✓
Eksperimen 2: A+D+E → 🌸 MATCH ✓
Eksperimen 3: C+D+F → 🌸 MATCH ✓
Jika 3/3 MATCH → 🏆 CASE SOLVED!
Jika ada ✗ → highlight gelas yang kontradiktif + saran hint
```

*   **Scoring:** `water_identified = (assigned[A]==Air || assigned[F]==Air)` → `mod2_score 100/0` (V4) + bonus `feature_accuracy` untuk CT Skill.

### 7.10 Layar 10 — Refleksi CT

*   **URL:** `/reflect`
*   **Dari projek.docx §19 + V4 reasoning:**
    *   Q1: *Ketika kamu memecah masalah...* → Dekomposisi
    *   Q2: *Ketika mencari kesamaan...* → Pattern Recognition
    *   Q3: *Ketika memperbaiki dugaan...* → Debugging
    *   Q4 (esai): *"Jelaskan dengan kata-katamu bagaimana kamu menemukan 2 gelas air"*
*   **Komponen:** RadioGroup Tailwind + Textarea (wajib isi min 20 char).
*   **Aksi:** `[Kirim & Lihat Hasil]` → `STATE_TELEMETRY_SYNC` → `/result`

### 7.11 Layar 11 — Result & CT Skill Breakdown

*   **URL:** `/result`
*   **Komponen:**
    *   Skor gabungan + badge
    *   Radar chart CT Skills (Pattern, Algorithm, Debugging, Abstraction)
    *   Ringkasan: M1 `100%`, M2 `100%`, Air `YES`, Attempts `3`, Hints `1`
    *   Tombol `[Kembali ke Hub]` dan `[Lihat Dashboard]` (jika role guru)

### 7.12 Layar 12 — Teacher Dashboard

*   **URL:** `/dashboard` (protected, RLS: `role == teacher`)
*   **Komponen:**
    *   Filter: Kelas, Tanggal, Status
    *   KPI cards: Completion %, Avg Score, Avg Hints, Avg Duration
    *   Table: sama kolom V4 CSV + tambahan `attempts`, `hints`, `ct_skills` (dari projek.docx §20)
    *   Charts: Bar (skor per siswa), Heatmap (kesalahan per gelas), Radar (CT skill kelas)
    *   Export: `[Download CSV]` (kompatibel V4 `student_activity_log.csv`) + `[JSON]` + `[PDF]`
    *   Realtime: `supabase.channel('sessions').on('postgres_changes', ...)` untuk live update

---

## 8. Game Engine — Aturan & Logika Inti

### 8.1 Module1DoughEngine (TypeScript Port V4)

```typescript
// src/engine/rules/doughEngine.ts
export type Shape = "Square" | "Triangle" | "Circle";
export type Rule = [Shape, Shape];

export const SHAPES: Shape[] = ["Square", "Triangle", "Circle"];

export function applyGate(input: Shape, rule: Rule): Shape {
  const [src, dst] = rule;
  return input === src ? dst : input;
}

export function tracePipeline(start: Shape, pipeline: Rule[]) {
  let cur = start;
  const history: Shape[] = [cur];
  for (const rule of pipeline) {
    cur = applyGate(cur, rule);
    history.push(cur);
  }
  return { result: cur, history };
}

// Contoh V4: tracePipeline("Square", [["Square","Triangle"],["Triangle","Circle"]])
// → { result: "Circle", history: ["Square","Triangle","Circle"] }
```

### 8.2 Module2FertilizerEngine (TypeScript Port V4)

```typescript
// src/engine/rules/fertilizerEngine.ts
export const GLASS_PROPERTIES: Record<string, string> = {
  A: "Air Biasa (Tanpa Efek)",
  B: "Menumbuhkan Daun",
  C: "Kelopak Berlapis & Putih",
  D: "Tangkai Bergelombang",
  E: "Tengah Bunga Hitam",
  F: "Air Biasa (Tanpa Efek)",
};

export function evaluateMixture(glasses: string[]): string[] {
  const features = new Set<string>();
  for (const g of glasses) {
    const prop = GLASS_PROPERTIES[g.toUpperCase()] ?? "";
    if (prop && !prop.includes("Air")) features.add(prop);
  }
  return [...features];
}

export function isWaterCorrect(assignments: Record<string, string>): boolean {
  // V4: water_identified = ans in ["A","F"] — diperluas: cek assignment ke "Air"
  const aIsWater = assignments["A"]?.includes("Air");
  const fIsWater = assignments["F"]?.includes("Air");
  return !!(aIsWater || fIsWater); // minimal 1 benar; ideal 2 benar untuk skor penuh
}

export function verifyAll(
  assignments: Record<string, string>,
  experiments: { glasses: string[]; expectedFeatures: string[] }[]
): { expId: number; match: boolean; expected: string[]; got: string[] }[] {
  return experiments.map((exp, i) => {
    const got = evaluateMixture(exp.glasses.map(g => assignments[g] ?? g));
    // Sederhanakan: bandingkan set features (urutan tidak penting)
    const match = exp.expectedFeatures.length === got.length
      && exp.expectedFeatures.every(f => got.includes(f));
    return { expId: i+1, match, expected: exp.expectedFeatures, got };
  });
}
```

### 8.3 Validation Rules

| Input | Rule |
|---|---|
| `name` | required, min 3, max 60, regex `^[A-Za-z\s'.-]+$` |
| `class` | enum `VIII-A..D` |
| `absen` | integer 1–40 |
| `assignments` | 6 keys A–F, each value in enum fitur |
| `reasoning` | required, min 20 char, max 500, `replace("\n"," ")` (V4 behavior) |
| `reflection` | Q1–3 required, Q4 min 10 char |

---

## 9. Data Model & Supabase Schema

### 9.1 ERD Singkat

```
students (1) ──< sessions (1) ──< module1_traces
                        │
                        └─< module2_answers
                        └─< reflections
students (1) ──< ct_skills (1 row per student, upsert)
```

### 9.2 SQL Migration (Supabase)

```sql
-- Enable UUID
create extension if not exists "uuid-ossp";

-- 1. students
create table students (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class text not null check (class in ('VIII-A','VIII-B','VIII-C','VIII-D')),
  absen integer not null check (absen between 1 and 40),
  created_at timestamptz default now(),
  unique (name, class, absen)
);

-- 2. sessions (pengganti student_activity_log.csv V4)
create table sessions (
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
  final_score integer generated always as (
    greatest(0, least(100, (mod1_score * 0.4 + mod2_score * 0.6)::int - hints_used*10))
  ) stored
);
create index idx_sessions_student on sessions(student_id);
create index idx_sessions_status on sessions(status);

-- 3. module1_traces
create table module1_traces (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  start_shape text not null,
  pipeline jsonb not null,          -- [["Square","Triangle"], ...]
  history jsonb not null,           -- ["Square","Triangle","Circle"]
  result_shape text not null,
  created_at timestamptz default now()
);

-- 4. module2_answers
create table module2_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  assignments jsonb not null,       -- {"A":"Air Biasa", "B":"Menumbuhkan Daun", ...}
  experiment_answers jsonb not null,-- [{"exp":1,"checked":["Daun","Kelopak"]}, ...]
  verified boolean not null default false,
  verify_details jsonb,             -- hasil verifyAll()
  created_at timestamptz default now()
);

-- 5. reflections
create table reflections (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  q1 text not null, q2 text not null, q3 text not null,
  q4_essay text,
  score integer not null default 0, -- 0–100 berdasarkan kunci
  created_at timestamptz default now()
);

-- 6. ct_skills (agregat per siswa)
create table ct_skills (
  student_id uuid primary key references students(id) on delete cascade,
  pattern_recognition integer not null default 0,
  algorithmic_thinking integer not null default 0,
  debugging integer not null default 0,
  abstraction integer not null default 0,
  decomposition integer not null default 0,
  updated_at timestamptz default now()
);

-- 7. teacher view (opsional: materialized)
create view teacher_overview as
select
  s.name, s.class, s.absen,
  sess.mod1_score, sess.mod2_score, sess.water_correct,
  sess.reasoning, sess.status, sess.attempts, sess.hints_used,
  sess.final_score, sess.start_time, sess.finish_time
from students s join sessions sess on sess.student_id = s.id
order by s.class, s.absen;
```

### 9.3 Row Level Security (RLS)

```sql
alter table students enable row level security;
alter table sessions enable row level security;
-- Siswa hanya bisa insert/select miliknya (berdasarkan anon key + name/class/absen match)
-- Guru (role teacher) bisa select all — via Supabase Auth + custom claim
create policy "Allow anon insert students" on students for insert with check (true);
create policy "Allow anon insert sessions" on sessions for insert with check (true);
create policy "Allow anon select own" on sessions for select using (true); -- MVP: open read, tighten di MVP2
-- TODO MVP2: JWT role-based RLS
```

### 9.4 Kompatibilitas CSV V4

Endpoint `GET /api/export/csv` menghasilkan header identik V4:

```
Timestamp,Student_Name,Class,Attendance_Num,Module_1_Score,Module_2_Matrix_Score,Water_Glass_Correct,Reasoning_Text,Status
2026-09-07 10:00:00,Budi Santoso,VIII-A,12,100%,100%,YES,"Saya cek pola...",COMPLETED
```

Tambahan kolom V5 (opsional, di belakang): `Attempts,Hints,Final_Score,CT_Pattern,CT_Algorithm`

---

## 10. Telemetry, Analytics & Teacher Dashboard

### 10.1 Event Telemetry (di-port dari `TelemetryLogger.log_session` V4)

| Event | Payload | Trigger |
|---|---|---|
| `session_start` | `student_id, timestamp` | Onboarding submit |
| `module1_trace` | `start_shape, pipeline, result, history, score` | Klik Jalankan Pipeline |
| `experiment_run` | `exp_id, selected_glasses, checked_features` | Klik Jalankan Eksperimen |
| `board_interaction` | `from_glass, to_feature, duration` | Drag & Drop |
| `hint_requested` | `level (1/2/3), context` | Klik Hint |
| `verification_run` | `assignments, verify_details, match_all` | Klik Uji Hipotesis |
| `reflection_submit` | `q1..q4, score` | Submit Refleksi |
| `session_complete` | `mod1_score, mod2_score, water_correct, reasoning, final_score` | Kirim Laporan |

Semua event: `IndexedDB → (online) Supabase insert → (offline) queue + retry`.

### 10.2 Dashboard Guru — Widgets

1.  **KPI Cards:** Completion %, Avg Final Score, Avg Hints, Avg Duration
2.  **Tabel Siswa:** Sort & filter, klik row → detail modal (trace history, assignments, reasoning)
3.  **Heatmap Kesalahan:** Grid 6 gelas × 5 fitur, warna intensitas kesalahan
4.  **Radar CT Skills:** Per kelas, 5 dimensi (Pattern, Algorithm, Debugging, Abstraction, Decomposition)
5.  **Timeline:** Sparkline attempts per sesi
6.  **Export:** CSV (V4-compatible), JSON, PDF (untuk rapor)

### 10.3 Realtime

```typescript
// Dashboard subscribes
supabase.channel('sessions-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, payload => {
    refreshKPIs(); // update tanpa reload
  }).subscribe();
```

---

## 11. Scoring Algorithm & CT Skill Rubrik

### 11.1 Skor Modul

**Module 1 (V4 logic dipertahankan):**

```
if result === expected → 100
else if history contains expected intermediate → 50
else → 0
```

**Module 2 (V4 + projek.docx):**

```
water_correct_bonus = (A==Air && F==Air) ? 40 : (A==Air || F==Air) ? 20 : 0
feature_accuracy = (correct_assignments / 6) * 60   // B,C,D,E harus tepat
mod2_score = water_correct_bonus + feature_accuracy  // 0–100
// Contoh: A benar, F salah, 4/4 fitur lain benar → 20 + 60 = 80
```

### 11.2 Skor Akhir

```
final_score = clamp(0..100, round(mod1_score*0.4 + mod2_score*0.6) - hints_used*10)
// hints_used*10 max penalty 30 (sesuai projek.docx: hint cost)
// attempts & debugging tidak mengurangi skor, hanya dicatat untuk rubrik
```

### 11.3 CT Skill Breakdown (projek.docx §16-17)

| Skill | Sumber Data | Rumus |
|---|---|---|
| **Pattern Recognition** | `experiment_answers` + `assignments` | `+1` per eksperimen checklist benar, `+2` jika semua 6 gelas benar tanpa hint |
| **Algorithmic Thinking** | `module1_traces` | `100` jika pipeline benar, `50` jika 1 gate benar |
| **Debugging** | `hints_used` inverse + `debugging_attempts` | `100 - hints_used*20 + min(debugging_attempts*5, 20)` |
| **Abstraction** | `reflection` Q4 | Rubrik guru / auto-score keyword ("pola", "kondisi", "jika-maka") |
| **Decomposition** | `reflection` Q1 + alur board | `+1` jika Q1 benar (Dekomposisi) |

Tampilkan sebagai radar chart di `/result` dan dashboard.

---

## 12. Hint System (3 Tingkat) & Debugging

### 12.1 Desain (projek.docx §15)

| Level | Jenis | Contoh | Cost |
|---|---|---|---|
| **Hint 1** | Pertanyaan | "Coba lihat gelas yang muncul pada dua eksperimen berbeda." | -10% max |
| **Hint 2** | Arah | "Bandingkan Eksperimen 1 dan Eksperimen 3 — gelas C muncul di keduanya." | -10% |
| **Hint 3** | Visual | Sorot `C → EXP1 & EXP3` dengan `ring-2 ring-amber-400` + panah SVG | -10% |

*   Tombol `[💡 Minta Petunjuk]` → modal pilih level, konfirmasi cost.
*   Maksimal 3 hints per sesi (total -30%).
*   Hint tidak pernah membuka jawaban langsung (prinsip projek.docx).

### 12.2 Feedback Edukatif (projek.docx §17)

*   Jika benar: `🎉 PATTERN DETECTED! Kamu menemukan hubungan C ↔ Kelopak. Skill: Pattern Recognition +1`
*   Jika salah (drag salah): `🔍 Hipotesismu belum cocok dengan semua bukti. Cek: Apakah gelas ini muncul di eksperimen lain?` (bukan `❌ SALAH!`)
*   Jika verifikasi gagal: Highlight gelas kontradiktif + tawarkan Hint 2.

### 12.3 Debugging sebagai Skill

Setiap `verification_run` yang `match==false` → `debugging_attempts +1`. Siswa didorong iterasi:

```
PETUNJUK → HIPOTESIS → COBA → HASIL → "Eh kenapa?" → PETUNJUK BARU → HIPOTESIS BARU
```

Curiosity loop dipertahankan (projek.docx §14) via `🔐 FILE TERAKHIR TERKUNCI` — unlock jika `correct_assignments >=4`.

---

## 13. Design System — Tailwind CSS

### 13.1 Token

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: "#1a365d",   // V4 bg #1a365d
        accent: "#2b6cb0",    // V4 greeting
        surface: "#ffffff",
        muted: "#edf2f7",
        success: "#38a169",
        warning: "#d69e2e",
        danger: "#e53e3e",
      },
      fontFamily: { sans: ["Inter", "Helvetica", "Arial", "sans-serif"] },
      borderRadius: { card: "1rem", pill: "999px" },
    }
  }
}
```

### 13.2 Komponen Primitif

*   `Button` — `bg-primary text-white rounded-card px-6 py-3 min-h-[48px] hover:bg-accent` (P0: tombol besar)
*   `Card` — `bg-surface rounded-card shadow-md p-6 border border-muted`
*   `Badge` — `bg-accent/10 text-accent rounded-pill px-3 py-1 text-sm`
*   `Input/Select` — `border-2 border-muted focus:border-accent focus:ring-2`
*   `Draggable Glass` — `bg-surface border-2 border-dashed p-4 cursor-grab active:cursor-grabbing`
*   `Droppable Feature` — `bg-muted border-2 border-transparent data-[over]:border-accent`

### 13.3 Aksesibilitas (P0/P1)

*   Kontras AA (primary #1a365d on white = 12.6:1 ✓)
*   Fokus ring visible (`focus-visible:ring-2`)
*   Semua drag-drop juga bisa via keyboard (Enter → pilih → Tab → drop)
*   Teks instruksi singkat, tidak bergantung audio (P0)
*   Dark mode: `dark:bg-slate-900 dark:text-slate-100` (P1)

### 13.4 Ikon & Ilustrasi

*   Ikon: Lucide (`FlaskConical`, `Flower2`, `Beaker`, `Lightbulb`, `Search`, `Check`, `X`)
*   Ilustrasi: Canva AI (lihat §19) — export SVG, optimize via `svgo`, lazy-load.

---

## 14. Offline-First, PWA & Performance

### 14.1 PWA Setup

```js
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'VECT CT LAB',
    short_name: 'CT LAB',
    theme_color: '#1a365d',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [{ src: 'pwa-192.png', sizes: '192x192', type: 'image/png' }]
  },
  workbox: {
    runtimeCaching: [
      { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/, handler: 'NetworkFirst', options: { networkTimeoutSeconds: 3, cacheName: 'supabase-cache' } }
    ]
  }
})
```

### 14.2 Offline Queue

```typescript
// src/engine/sync/offlineQueue.ts
// Saat offline: tulis ke IndexedDB 'pending_writes'
// Saat online (navigator.onLine + supabase reachable): flush FIFO
// Indikator UI: dot hijau (online) / kuning (menyinkronkan) / merah (offline, tersimpan lokal)
```

### 14.3 Performance Budget

| Metric | Target | Cara Capai |
|---|---|---|
| First Contentful Paint | < 1.5s | Vite code-splitting per route, preload briefing |
| JS Bundle (gz) | < 180 kB | Tree-shake Lucide, dynamic import Framer Motion |
| Image | < 500 kB total | AVIF/WebP, Canva AI export 800px max, lazy |
| Lighthouse | Perf >90, A11y >95 | Tailwind a11y, semantic HTML |

---

## 15. Keamanan & Privacy

*   **Auth:** Supabase Auth anon untuk siswa (tidak perlu email), JWT untuk guru. MVP 1: anon key + RLS open insert; MVP 2: role-based RLS ketat.
*   **RLS:** `students` & `sessions` hanya insert anon, select dibatasi (guru full, siswa own via `localStorage` id).
*   **Data Siswa:** Hanya `name, class, absen` — tidak ada NIK/email. Sesuai prinsip data minimization.
*   **Reasoning Text:** Sanitasi `replace("\n"," ")` (V4) + `DOMPurify` sebelum render di dashboard (hindari XSS).
*   **Env:** `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` di Vercel env, tidak commit.

---

## 16. Deployment — Vercel

### 16.1 Setup

```
Vercel Project: vect-ct-lab
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
Env Vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
Domain: vect-ct-lab.vercel.app (custom: ctlab.sekolah.sch.id)
```

### 16.2 CI/CD

*   `main` → production deploy
*   PR → preview deploy (Vercel bot comment URL)
*   `vercel --prod` untuk manual

### 16.3 Edge & Analytics

*   Vercel Analytics + Speed Insights aktif
*   Edge Function `/api/export/csv` untuk streaming CSV (jika data besar)

---

## 17. MVP Roadmap (3 Fase)

### MVP 1 — Core Loop (4–6 minggu) — **WAJIB untuk PJJ Darurat**

```
Mission Briefing → Onboarding → Hub → Module 1 (Trace) → Module 2 (Eksperimen+DragDrop+Verify) → Reflection → Result → Supabase Sync
```

*   2 Content Packs (Pupuk + Adonan) — hardcode JSON
*   Scoring sederhana + water_correct
*   Dashboard guru basic (tabel + CSV export V4-compatible)
*   PWA installable, IndexedDB queue dasar
*   Target: 1 skenario, 1 sesi, 30–45 menit — bisa dipakai 1 kelas uji coba

### MVP 2 — Enhanced Pedagogy (6–8 minggu)

*   Hint Engine 3 level + cost
*   Evidence Board graph interaktif
*   CT Skill radar + rubrik reflection
*   Teacher analytics: heatmap, KPI cards, realtime
*   Offline sync robust + progress recovery ("Lanjut Sesi Terakhir")
*   Animasi & Canva AI assets final
*   Accessibility audit + dark mode

### MVP 3 — Full CT LAB Framework (8–12 minggu)

*   Scenario Generator — guru buat Content Pack via UI (tanpa coding)
*   3 scenario baru: Robot Lalu Lintas, Detektif Data, Pengantar Paket
*   AI-generated scenarios (LLM prompt → experiments.json)
*   Leaderboard opsional (P2, non-prioritas di kondisi bencana — sesuai projek.docx §21)
*   Multi-bahasa, avatar, voice instruction (P1)
*   Dashboard advanced: tren, prediksi, rekomendasi intervensi

---

## 18. Acceptance Criteria

### 18.1 Learning

- [ ] Siswa memahami pattern recognition (bisa mencocokkan 6 gelas ≥4 benar)
- [ ] Siswa dapat membandingkan bukti antar eksperimen (checklist fitur benar ≥2/3)
- [ ] Siswa dapat membuat & menguji hipotesis (drag & drop + verifikasi)
- [ ] Siswa memahami debugging (iterasi setelah verifikasi gagal, `debugging_attempts` tercatat)
- [ ] Siswa dapat menjelaskan proses (reasoning ≥20 char + reflection Q1–3 benar ≥2)

### 18.2 Interaction

- [ ] Drag & drop berjalan di desktop & mobile (touch + mouse + keyboard)
- [ ] Feedback langsung edukatif (tidak pernah "SALAH!" keras, selalu scaffold)
- [ ] Hint 3 level berfungsi, cost -10% per hint, max -30%
- [ ] Kesalahan tidak langsung membuka jawaban (harus verifikasi dulu)
- [ ] Progress autosave (IndexedDB + Supabase), bisa lanjut jika koneksi terputus

### 18.3 Assessment & Telemetry

- [ ] Setiap percobaan tercatat (`attempts`, `module1_traces.history`)
- [ ] Penggunaan hint tercatat (`hints_used`)
- [ ] Skor dihasilkan (`mod1_score`, `mod2_score`, `final_score`)
- [ ] Indikator CT dihasilkan (5 skill, radar chart)
- [ ] Reasoning text tersimpan & tampil di dashboard (sanitasi XSS)

### 18.4 Teacher

- [ ] Guru dapat melihat siapa selesai (`status == completed`)
- [ ] Guru dapat melihat skor per siswa (tabel sortable)
- [ ] Guru dapat melihat CT skill per siswa & per kelas (radar)
- [ ] Guru dapat melihat kesalahan umum (heatmap gelas×fitur)
- [ ] Guru dapat export CSV (header V4 kompatibel) + JSON + PDF
- [ ] Dashboard realtime (tanpa reload saat siswa submit)

### 18.5 Non-Functional (P0 Wajib — Hujan Abu)

- [ ] Mobile friendly, tombol ≥48px, teks instruksi singkat
- [ ] Berjalan di browser tanpa download aplikasi
- [ ] Ringan (JS <180 kB gz, FCP <1.5s)
- [ ] Autosave + progress recovery
- [ ] Audio opsional, informasi penting selalu visual
- [ ] PWA cache, bisa dibuka offline setelah kunjungan pertama
- [ ] Lighthouse Perf >90, A11y >95

---

## 19. Appendix — Prompt Canva AI & Referensi Bebras

### 19.1 Prompt Canva AI untuk Aset (dari projek.docx §26)

| Aset | Prompt Canva AI |
|---|---|
| **Pak Taro** | "Indonesian male scientist in lab coat, friendly cartoon style, age 45, holding clipboard, volcano ash background, flat illustration" |
| **Laboratorium** | "Messy science lab interior, beakers A-F on bench, flower experiment, warm lighting, isometric cartoon, 800px" |
| **Bunga Uji** | "White flower with 5 variable parts: layered petals, leaf, wavy stem, white color, black center — modular SVG, flat" |
| **Gelas A–F** | "6 glass beakers labeled A-F, transparent with liquid, clean vector icon, consistent size" |
| **Mesin Adonan** | "Conveyor machine with 3 gates, shapes Square Triangle Circle transforming, diagram style, arrow flow" |
| **Evidence Board** | "Detective cork board with string connecting beakers to experiments to flower traits, top-down view" |
| **Background** | "Volcano ash sky, soft muted palette #1a365d #edf2f7, subtle texture, non-distracting" |

Export: SVG untuk ikon/mesin, PNG 800px untuk hero, AVIF untuk PWA.

### 19.2 Wireframe Checklist (8 Screen — projek.docx §26)

1. Screen 01 — Mission Briefing
2. Screen 02 — Onboarding
3. Screen 03 — Hub Menu
4. Screen 04 — Module 1 Trace
5. Screen 05 — Module 2 Intro (DNA Pupuk)
6. Screen 06 — Module 2 Experiment + Checklist
7. Screen 07 — Evidence Board + Drag & Drop
8. Screen 08 — Verification + Result + Reflection

### 19.3 Referensi Bebras & CT

*   Bebras Computational Thinking — Pattern Recognition & Algorithmic Thinking (Kelas VIII)
*   V4 `Module1DoughEngine` & `Module2FertilizerEngine` — sumber aturan transformasi & glass properties
*   projek.docx — framing "Detektif Laboratorium", curiosity loop, debugging natural

### 19.4 File Mapping V4 → V5

| V4 (Python/Tkinter) | V5 (Vite/React/Supabase) |
|---|---|
| `TelemetryLogger` + `student_activity_log.csv` | `supabase.from('sessions').insert()` + IndexedDB queue + `/api/export/csv` |
| `VECTGameApp(tk.Tk)` + `clear_screen()` | `React Router` + `Zustand` stores + `App.tsx` layout |
| `Module1DoughEngine` | `src/engine/rules/doughEngine.ts` |
| `Module2FertilizerEngine` | `src/engine/rules/fertilizerEngine.ts` |
| `messagebox.showinfo/warning` | `toast` (sonner) + inline validation |
| `PyInstaller <15MB` | `Vite build <180kB gz` + Vercel deploy |
| `tkinter` UI | `Tailwind CSS` + `@dnd-kit` + `Framer Motion` |

---

## Change Log

| Versi | Tanggal | Perubahan |
|---|---|---|
| 4.0.0 | 2026-09-07 | Python Tkinter prototype, 2 modul, CSV telemetry |
| **5.0.0** | **2026-09-07** | **Hybrid: Port ke Vite+React+Tailwind+Supabase+Vercel. Gabung pedagogi projek.docx (CT LAB, evidence board, hint 3 level, reflection, dashboard) dengan kesederhanaan V4 (2 modul, state machine linear, scoring). PWA offline, RLS, export CSV kompatibel.** |

---

> **Catatan Implementasi untuk Developer/AI Agent:** Dokumen ini adalah *single source of truth*. Mulai dari **MVP 1** (§17) — jangan melompat ke MVP 3. Setiap screen di §7 harus diimplementasi sebagai route terpisah dengan validasi Zod. Engine di §8 harus 100% unit-tested (Vitest) sebelum menyentuh UI. Dashboard guru di §10 adalah fitur P0 untuk PJJ — jangan ditunda.

*End of PRD V5 — 7 September 2026*
