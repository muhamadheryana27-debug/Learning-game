# Learning-game — Refactor & Improvement Execution Plan

## 0. Tujuan Dokumen

Dokumen ini adalah **master implementation specification** untuk agent AI (OpenCode/Codex) dalam memperbaiki, melakukan debug, refactor, dan mengembangkan repository:

- Repository: `muhamadheryana27-debug/Learning-game`
- Target pengguna: siswa SMP kelas VIII
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- State: Zustand
- Offline storage: IndexedDB
- Backend target: Google Apps Script Web App
- Data store: Google Sheets
- Deployment frontend: Vercel atau static hosting yang kompatibel

> **PRINSIP UTAMA:** jangan menambal bug secara acak. Stabilkan fondasi, pisahkan domain logic dari UI, buat API boundary yang jelas, kemudian baru memperkuat pedagogical UX dan gamification.

---

# 1. Misi Utama Agent

Agent harus mengubah proyek dari prototype game yang bercampur antara UI, game logic, state, dan backend menjadi aplikasi pembelajaran yang:

1. dapat di-build tanpa error,
2. dapat dimainkan tanpa backend,
3. dapat menyimpan progress secara offline,
4. dapat melakukan sinkronisasi ke Google Apps Script,
5. tidak bergantung pada Supabase,
6. memiliki session siswa yang konsisten,
7. memiliki game engine yang terpisah dari UI,
8. memiliki telemetry pembelajaran,
9. memiliki scoring yang mengukur proses berpikir,
10. memiliki scaffolding pembelajaran yang jelas,
11. mudah menambahkan modul baru tanpa mengubah banyak kode,
12. mudah dianalisis guru melalui dashboard.

---

# 2. Aturan Eksekusi Agent

## WAJIB

- Baca repository terlebih dahulu sebelum mengubah kode.
- Jangan menghapus fitur yang masih berfungsi tanpa alasan.
- Jangan mengganti stack frontend.
- Jangan menambahkan dependency baru jika dependency yang tersedia sudah mencukupi.
- Jangan mengubah game rules tanpa mendokumentasikan perubahan.
- Jangan memasukkan credential/API key ke source code.
- Jangan menyimpan secret GAS token di frontend jika tidak benar-benar diperlukan.
- Jalankan typecheck/build/lint setelah setiap fase besar.
- Pertahankan kompatibilitas mobile.
- Pertahankan aksesibilitas dasar.
- Semua perubahan harus modular.
- Semua data yang dikirim ke backend harus memiliki `sessionId`, `studentId`, `moduleId`, dan timestamp jika relevan.
- Backend failure tidak boleh membuat game gagal dimainkan.

## DILARANG

- Jangan membuat React menulis langsung ke Google Sheets.
- Jangan mencampur kode Google Apps Script ke komponen React.
- Jangan membuat setiap modul mempunyai pola state global yang berbeda.
- Jangan membuat `useProgressStore` menjadi God Store.
- Jangan menggunakan score sebagai satu-satunya data assessment.
- Jangan mengandalkan `name + class + absen` sebagai primary key.
- Jangan menggunakan random yang tidak reproducible untuk assessment.
- Jangan menghapus IndexedDB/offline queue.
- Jangan memaksa siswa login dengan sistem autentikasi kompleks untuk MVP.

---

# 3. Arsitektur Target

Gunakan arsitektur berikut:

```text
                    React + Vite
                         |
                    Application
                         |
             +-----------+-----------+
             |                       |
         Game Engine              UI Layer
             |                       |
      Rules / Scoring /         Components
      Validation / Hints        Animations
             |
         Zustand Stores
             |
       Session Manager
             |
       Sync / Repository
          /        \
     IndexedDB     GAS API
                     |
             Google Apps Script
                     |
                Google Sheets
```

## Separation of Concerns

### UI

Bertanggung jawab untuk:

- rendering,
- input pengguna,
- animation,
- feedback visual,
- navigation.

### Game Engine

Bertanggung jawab untuk:

- rules,
- state transition,
- validation,
- scoring,
- hint logic,
- challenge generation.

### Session Manager

Bertanggung jawab untuk:

- session lifecycle,
- student identity,
- module progress,
- completion status.

### Sync Layer

Bertanggung jawab untuk:

- offline queue,
- retry,
- online/offline detection,
- sending data ke GAS.

### GAS

Bertanggung jawab untuk:

- validasi payload,
- append/update data,
- dashboard data,
- health check.

### Google Sheets

Hanya sebagai data store sederhana.

---

# 4. Struktur Folder Target

Refactor secara bertahap menuju:

```text
app/
└── src/
    ├── app/
    │   ├── App.tsx
    │   └── routes.tsx
    │
    ├── core/
    │   ├── engine/
    │   │   ├── types.ts
    │   │   ├── validation.ts
    │   │   ├── scoring.ts
    │   │   ├── hints.ts
    │   │   └── random.ts
    │   │
    │   ├── session/
    │   │   ├── sessionManager.ts
    │   │   └── sessionTypes.ts
    │   │
    │   └── telemetry/
    │       ├── eventTypes.ts
    │       └── telemetry.ts
    │
    ├── content/
    │   ├── module-1/
    │   │   ├── content.ts
    │   │   └── rules.ts
    │   ├── module-2/
    │   │   ├── content.ts
    │   │   └── rules.ts
    │   └── index.ts
    │
    ├── features/
    │   ├── onboarding/
    │   ├── hub/
    │   ├── module1/
    │   ├── module2/
    │   ├── reflection/
    │   └── result/
    │
    ├── components/
    │   ├── ui/
    │   ├── game/
    │   ├── feedback/
    │   └── layout/
    │
    ├── stores/
    │   ├── studentStore.ts
    │   ├── gameStore.ts
    │   ├── sessionStore.ts
    │   └── syncStore.ts
    │
    ├── services/
    │   ├── api/
    │   │   ├── gasClient.ts
    │   │   └── gameApi.ts
    │   └── storage/
    │       ├── indexedDb.ts
    │       └── localStorage.ts
    │
    ├── types/
    │   ├── student.ts
    │   ├── session.ts
    │   ├── module.ts
    │   └── telemetry.ts
    │
    └── lib/
```

Agent tidak harus memindahkan semua file sekaligus. Gunakan incremental refactor.

---

# 5. PHASE 0 — Audit dan Baseline

Sebelum mengubah kode:

1. inspect seluruh source,
2. inspect `package.json`,
3. inspect Vite config,
4. inspect Tailwind config,
5. inspect routing,
6. inspect stores,
7. inspect game engine,
8. inspect offline queue,
9. inspect Supabase code,
10. cari semua `supabase`,
11. cari semua `setTimeout`,
12. cari semua direct network request,
13. cari semua `localStorage`,
14. cari semua IndexedDB usage,
15. cari TODO/FIXME,
16. cari TypeScript `any`,
17. jalankan:
   - `npm install`
   - `npm run typecheck` jika tersedia
   - `npm run lint` jika tersedia
   - `npm run build`
18. dokumentasikan semua error.

Buat file:

```text
docs/BASELINE.md
```

Isi:

- build status,
- lint status,
- runtime issues,
- architecture issues,
- known bugs,
- dependency issues,
- backend status.

**Jangan memperbaiki banyak hal pada fase audit.**

---

# 6. PHASE 1 — Stabilkan Build

Target:

```text
npm run build
```

harus berhasil.

Target tambahan:

```text
npm run lint
```

harus berhasil jika script tersedia.

Jika belum ada typecheck script, tambahkan script yang sesuai tanpa merusak konfigurasi.

Prioritas error:

1. compile error,
2. TypeScript error,
3. import error,
4. runtime crash,
5. state bug,
6. visual bug.

---

# 7. PHASE 2 — Hapus Ketergantungan Supabase dari Application Layer

Saat ini sebagian kode menggunakan Supabase untuk siswa/session.

Refactor sehingga komponen React tidak lagi mengimpor:

```ts
supabase
```

Secara langsung.

Buat:

```text
src/services/api/gameApi.ts
```

Contoh interface:

```ts
export interface GameApi {
  health(): Promise<HealthResult>;
  registerStudent(input: RegisterStudentInput): Promise<ApiResult>;
  startSession(input: StartSessionInput): Promise<ApiResult>;
  saveEvent(input: SaveEventInput): Promise<ApiResult>;
  saveModuleResult(input: SaveModuleResultInput): Promise<ApiResult>;
  completeSession(input: CompleteSessionInput): Promise<ApiResult>;
}
```

Komponen hanya memanggil:

```ts
gameApi.startSession(...)
```

bukan:

```ts
supabase.from(...)
```

Setelah semua penggunaan dipindahkan, hapus Supabase dari application runtime.

Hapus dependency Supabase hanya setelah seluruh code path tidak lagi menggunakannya.

---

# 8. PHASE 3 — Student Identity

Jangan gunakan:

```text
name + class + absen
```

sebagai primary key.

Gunakan:

```ts
type Student = {
  studentId: string;
  name: string;
  className: string;
  attendanceNumber: number;
};
```

`studentId` harus stabil selama session.

Untuk MVP sekolah, format yang dapat diterima:

```text
VIII-A-012
```

Tetapi implementasi harus memungkinkan UUID jika diperlukan nanti.

Onboarding:

```text
Nama
Kelas
No. Absen
```

Kemudian sistem membuat:

```text
studentId
```

dan menyimpannya.

Jangan meminta password siswa pada MVP.

---

# 9. PHASE 4 — Session Model

Gunakan model:

```ts
type GameSession = {
  sessionId: string;
  studentId: string;

  startedAt: string;
  updatedAt: string;
  completedAt?: string;

  currentModuleId: string;
  status:
    | "active"
    | "completed"
    | "abandoned";

  totalScore: number;

  modules: Record<string, ModuleProgress>;
};
```

Module progress:

```ts
type ModuleProgress = {
  moduleId: string;
  status: "locked" | "available" | "in_progress" | "completed";

  score: number;
  attempts: number;
  hintsUsed: number;

  startedAt?: string;
  completedAt?: string;

  mastery?: number;
};
```

---

# 10. PHASE 5 — Refactor Zustand

Jangan menggunakan pola:

```text
mod1Score
mod2Score
mod3Score
mod4Score
```

Gunakan:

```ts
modules: Record<string, ModuleProgress>
```

Contoh:

```ts
modules["algorithm-lab"]
modules["pattern-lab"]
modules["debug-lab"]
```

Store harus menyediakan action generik:

```ts
startModule(moduleId)
updateModuleProgress(moduleId, patch)
completeModule(moduleId, result)
setCurrentModule(moduleId)
resetSession()
```

---

# 11. PHASE 6 — Game Engine

Game logic harus keluar dari component.

Untuk Module 1:

```text
DoughFactory.tsx
```

jangan lagi menangani seluruh:

- routing,
- rules,
- scoring,
- queue generation,
- validation,
- telemetry.

Buat:

```text
core/engine/
```

Minimal:

```ts
traceRoute(...)
validateResult(...)
calculateScore(...)
generateHint(...)
```

UI menerima hasil:

```ts
const result = engine.play(action);
```

kemudian menampilkan animasi.

---

# 12. PHASE 7 — Hindari Stale Closure pada Animation

Game saat ini menggunakan beberapa `setTimeout` dan callback yang membaca state React.

Refactor animation flow menjadi state machine sederhana:

```text
IDLE
 ↓
SELECTED
 ↓
RUNNING
 ↓
GATE_PROCESSING
 ↓
RESULT
 ↓
SUCCESS / FAILURE
 ↓
NEXT_CUSTOMER
```

Gunakan satu sumber kebenaran untuk game state.

Jika pause diperlukan:

```text
RUNNING <-> PAUSED
```

Jangan mengandalkan callback timer yang menangkap nilai state lama.

Gunakan `useRef` atau reducer/state machine jika memang diperlukan.

---

# 13. PHASE 8 — Deterministic Random

Untuk game assessment:

Jangan:

```ts
Math.random()
```

untuk menentukan seluruh kesulitan.

Gunakan seeded random:

```ts
createSeededRandom(seed)
```

Seed dapat berasal dari:

```text
sessionId + moduleId
```

Tujuan:

- pengalaman tetap variatif,
- difficulty dapat dikontrol,
- hasil dapat direproduksi,
- debugging lebih mudah,
- fairness assessment lebih baik.

---

# 14. PHASE 9 — Offline First

Pertahankan IndexedDB.

Target:

```text
User Action
    ↓
Update UI
    ↓
Update Zustand
    ↓
Persist IndexedDB
    ↓
Create Sync Job
    ↓
Try GAS
    ↓
Success → delete job
Failure → keep job
```

Game tidak boleh menunggu network.

---

# 15. PHASE 10 — Sync Queue

Gunakan struktur:

```ts
type SyncJob = {
  id: string;

  type:
    | "REGISTER_STUDENT"
    | "START_SESSION"
    | "SAVE_EVENT"
    | "SAVE_MODULE_RESULT"
    | "COMPLETE_SESSION";

  sessionId: string;
  studentId: string;

  payload: unknown;

  createdAt: string;

  retryCount: number;

  status: "pending" | "syncing" | "failed";
};
```

Tambahkan:

- retry limit,
- exponential backoff sederhana,
- online event listener,
- manual "Sync Now",
- sync status UI.

Jangan menghapus job jika server belum mengonfirmasi keberhasilan.

---

# 16. PHASE 11 — Google Apps Script Backend

Buat folder terpisah:

```text
backend/
└── apps-script/
    ├── Code.gs
    ├── Config.gs
    ├── Students.gs
    ├── Sessions.gs
    ├── Events.gs
    └── README.md
```

Endpoint:

```text
?action=health
?action=registerStudent
?action=startSession
?action=saveEvent
?action=saveModuleResult
?action=completeSession
?action=dashboard
```

Response standar:

```json
{
  "ok": true,
  "action": "saveEvent",
  "requestId": "REQ-123",
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "action": "saveEvent",
  "requestId": "REQ-123",
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "..."
  }
}
```

Semua request harus memiliki `requestId`.

---

# 17. PHASE 12 — Google Sheets Schema

Gunakan satu spreadsheet.

Sheet:

```text
Students
Sessions
Events
ModuleResults
Config
```

## Students

```text
student_id
name
class
attendance_number
created_at
updated_at
```

## Sessions

```text
session_id
student_id
started_at
updated_at
completed_at
status
total_score
```

## Events

```text
event_id
session_id
student_id
module_id
step_id
event_type
payload_json
timestamp
```

## ModuleResults

```text
result_id
session_id
student_id
module_id
score
attempts
hints_used
time_spent
mastery
completed_at
```

Jangan menyimpan object kompleks langsung ke banyak kolom. Gunakan JSON untuk payload event.

---

# 18. PHASE 13 — GAS Security & Validation

Validasi server:

- action valid,
- payload memiliki requestId,
- sessionId valid,
- studentId ada,
- moduleId valid,
- tipe data benar.

Jangan percaya data score dari client secara penuh.

Jika memungkinkan, GAS menghitung atau memverifikasi score berdasarkan:

```text
moduleId
actions
attempts
hints
```

Untuk MVP, minimal lakukan sanity check.

---

# 19. PHASE 14 — API Client

Buat:

```text
services/api/gasClient.ts
```

Fitur:

- base URL dari environment,
- timeout,
- JSON parsing,
- standard error,
- requestId,
- retry terbatas,
- health check.

Environment:

```env
VITE_GAS_API_URL=
```

Jangan commit secret.

---

# 20. PHASE 15 — Telemetry Pembelajaran

Jangan hanya menyimpan score.

Event minimal:

```text
SESSION_STARTED
MODULE_STARTED
MISSION_STARTED
ACTION_ATTEMPTED
ANSWER_SUBMITTED
ANSWER_CORRECT
ANSWER_WRONG
HINT_REQUESTED
DEBUG_ATTEMPT
DEBUG_SUCCESS
MODULE_COMPLETED
SESSION_COMPLETED
```

Payload contoh:

```json
{
  "eventType": "DEBUG_ATTEMPT",
  "moduleId": "algorithm-lab",
  "stepId": "debug-01",
  "attempt": 2,
  "correct": true,
  "hintLevel": 1,
  "timeSpent": 42
}
```

---

# 21. PHASE 16 — Scoring

Jangan gunakan:

```text
correct = 100
wrong = 0
```

Gunakan komponen:

```text
Accuracy          40%
Reasoning         25%
Experimentation   15%
Debugging         10%
Independence      10%
```

Implementasikan generic scoring engine:

```ts
calculateScore({
  accuracy,
  reasoning,
  experimentation,
  debugging,
  independence
});
```

Score akhir tetap 0–100.

---

# 22. PHASE 17 — Hint System

Gunakan tiga level:

### Hint 1 — Observe

Memberikan petunjuk observasi.

### Hint 2 — Pattern

Mengarahkan siswa mencari pola.

### Hint 3 — Guided

Memberikan petunjuk hampir menuju solusi tetapi tidak memberikan jawaban langsung.

Contoh Module 1:

```text
H1:
"Lihat apa yang terjadi setelah adonan melewati Gate 2."

H2:
"Gate hanya bekerja pada bentuk tertentu."

H3:
"Perhatikan perubahan bentuk Brownie ketika melewati Gate 2."
```

Hint harus tercatat sebagai telemetry.

---

# 23. PHASE 18 — Scaffolding Pembelajaran

Setiap modul WAJIB memiliki struktur:

```text
MISSION
↓
OBSERVE
↓
PREDICT
↓
TRY
↓
SEE RESULT
↓
EXPLAIN
↓
DEBUG
↓
CHALLENGE
↓
REFLECT
```

Jangan langsung memberikan teori panjang.

Prinsip:

> Experience first → concept second → practice → challenge → reflection.

---

# 24. Module 1 — Algorithm Lab

## Tema

**🍪 Mesin Pembentuk Adonan**

## Misi

> "Pabrik kue sedang kacau. Pelanggan memiliki pesanan berbeda. Temukan jalur yang tepat agar adonan berubah menjadi bentuk yang mereka inginkan."

### Step 1 — Observe

Siswa mengamati:

```text
Adonan → Gate → hasil
```

Pertanyaan:

> "Apa yang berubah?"

### Step 2 — Predict

Siswa memprediksi hasil sebelum mencoba.

### Step 3 — Try

Siswa memilih:

- bentuk awal,
- pintu,
- jalur.

### Step 4 — See Result

Animasi memperlihatkan perjalanan adonan.

### Step 5 — Explain

Siswa menjawab:

> "Mengapa hasilnya berubah?"

Kenalkan konsep:

```text
KONDISI
TINDAKAN
URUTAN
```

### Step 6 — Debug

Berikan jalur salah.

Siswa mencari gate yang menyebabkan kesalahan.

### Step 7 — Challenge

Tanpa hint.

Target berbeda dari contoh.

### Step 8 — Reflection

Pilihan:

```text
Saya belajar dengan:
☐ mencoba
☐ melihat pola
☐ memperbaiki kesalahan
☐ membaca petunjuk
```

---

# 25. Module 2 — Pattern Recognition Lab

## Tema

**🕵️ Detektif Pola**

Narasi:

> "Catatan eksperimen laboratorium tertukar. Temukan pola dari bukti yang tersisa."

### Step 1 — Observe Evidence

Siswa melihat beberapa eksperimen.

### Step 2 — Compare

Bandingkan:

- input,
- proses,
- output.

### Step 3 — Find Pattern

Siswa mengelompokkan bukti.

### Step 4 — Predict

Berikan kasus baru.

Siswa memprediksi hasil.

### Step 5 — Explain

Siswa menjelaskan pola.

### Step 6 — Debug

Berikan satu klasifikasi yang salah.

Siswa mencari kesalahan.

### Step 7 — Final Boss

Kasus baru tanpa contoh.

---

# 26. Module 3 — Debugging Lab

Jika modul ini belum ada, siapkan arsitektur untuk modul tersebut.

Tema:

**🐛 Bug Hunter**

Siswa melihat:

```text
Program/algoritma
↓
hasil tidak sesuai
```

Tugas:

```text
Find → Explain → Fix → Test
```

Tahapan:

```text
Observe bug
↓
Predict cause
↓
Find faulty step
↓
Fix
↓
Run again
↓
Explain
```

---

# 27. Module Content sebagai Data

Jangan hard-code seluruh teks pembelajaran di component.

Gunakan:

```ts
type Mission = {
  id: string;
  title: string;
  narrative: string;

  learningObjective: string[];

  steps: MissionStep[];

  challenge: Challenge;
};
```

Contoh:

```ts
const module1 = {
  id: "algorithm-lab",
  title: "Mesin Pembentuk Adonan",
  ...
};
```

Dengan demikian content dapat dikembangkan tanpa mengubah engine.

---

# 28. Difficulty Progression

Setiap modul minimal memiliki:

```text
Level 1 — Guided
Level 2 — Semi Guided
Level 3 — Independent
Level 4 — Challenge
```

### Level 1

Banyak feedback.

### Level 2

Hint berkurang.

### Level 3

Siswa memilih strategi sendiri.

### Level 4

Tidak ada bantuan.

---

# 29. Feedback Design

Jangan:

```text
❌ SALAH
```

Gunakan:

```text
🤔 Belum tepat.
Coba perhatikan perubahan setelah Gate 2.
```

Jika benar:

```text
🎉 Tepat!

Kamu menemukan bahwa Gate hanya bekerja
ketika kondisi tertentu terpenuhi.

Itulah ide dasar dari IF / kondisi.
```

Feedback harus menjelaskan **mengapa**, bukan sekadar status.

---

# 30. Final Boss

Setiap modul harus mempunyai satu challenge akhir.

Karakteristik:

- tidak sama dengan contoh,
- tidak langsung memberikan hint,
- dapat diselesaikan dengan konsep yang dipelajari,
- memiliki feedback,
- menghasilkan mastery score.

Contoh:

```text
🏆 FINAL MISSION

Pelanggan meminta:
🍩 Donut

Kamu memiliki:
🟫 Brownie

Temukan jalur yang tepat.

Tidak ada contoh.
```

---

# 31. Dashboard Guru

Dashboard tidak hanya menampilkan:

```text
nilai
```

Tetapi:

```text
Jumlah siswa
Selesai
Sedang belajar
Belum mulai

Mastery:
Algorithm
Pattern Recognition
Debugging
Decomposition
```

Tambahkan tabel:

```text
Nama
Kelas
M1
M2
M3
Mastery
Hint
Attempts
Status
```

Guru dapat melihat:

> siapa yang mendapat nilai rendah karena konsep belum dikuasai vs karena terlalu banyak trial-error.

---

# 32. Analitik yang Direkomendasikan

Dashboard minimal menghitung:

```text
completion rate
average score
average attempts
average hints
average time
mastery per module
common error
```

Tambahkan kategori:

```text
Needs Support
Developing
Proficient
Advanced
```

Jangan gunakan label yang terasa menghakimi siswa.

---

# 33. UX untuk Siswa SMP

Gunakan prinsip:

### Satu layar = satu tujuan.

Jangan menampilkan terlalu banyak teks.

Gunakan:

```text
🎯 Misi
🧠 Tantangan
🔍 Petunjuk
▶ Coba
💡 Hint
🐛 Debug
🏆 Final Boss
```

### Bahasa

Gunakan Bahasa Indonesia yang:

- sederhana,
- pendek,
- aktif,
- tidak terlalu formal.

Hindari paragraf teori panjang.

---

# 34. Gamification

Gunakan:

```text
XP
Badge
Level
Mission
Final Boss
Achievement
```

Tetapi jangan membuat kompetisi yang mempermalukan siswa.

Contoh badge:

```text
🔍 Pattern Finder
🐛 Bug Hunter
🧠 Logic Master
🧪 Experimenter
🏆 Independent Thinker
```

---

# 35. Accessibility

WAJIB:

- keyboard accessible,
- button memiliki label jelas,
- warna bukan satu-satunya indikator benar/salah,
- kontras cukup,
- ukuran touch target nyaman,
- animasi dapat dikurangi,
- feedback tidak hanya melalui toast.

Jika `prefers-reduced-motion` aktif, kurangi animasi.

---

# 36. Mobile First

Target utama siswa kemungkinan menggunakan smartphone.

Pastikan:

```text
320px+
```

tetap usable.

Hindari:

- game canvas terlalu lebar,
- button kecil,
- tabel dashboard siswa,
- teks terlalu kecil.

Dashboard guru boleh lebih desktop-oriented.

---

# 37. Error Handling

Setiap network error harus menghasilkan:

```text
🟢 Tersimpan di perangkat
```

bukan:

```text
❌ Server Error
```

Jika offline:

```text
📴 Offline
Progress tetap aman.
Akan disinkronkan ketika koneksi kembali.
```

Jika sync gagal:

```text
⚠ Belum tersinkron
[ Coba Sinkronkan ]
```

---

# 38. Testing

Minimal buat unit test untuk:

### Game Engine

```text
traceRoute
validateResult
calculateScore
hintSystem
seededRandom
```

### Session

```text
startSession
completeModule
completeSession
```

### Sync

```text
enqueue
flush
retry
failure
```

Tidak perlu mengejar 100% coverage.

Prioritaskan domain logic.

---

# 39. Acceptance Criteria

Proyek dianggap berhasil jika:

## Build

```text
npm run build
```

berhasil.

## Game

- onboarding berjalan,
- hub berjalan,
- Module 1 dapat dimainkan,
- pause/resume tidak merusak game,
- score konsisten,
- module completion konsisten.

## Offline

- matikan internet,
- siswa tetap dapat bermain,
- progress tersimpan,
- queue bertambah,
- nyalakan internet,
- queue tersinkron.

## Backend

- GAS health endpoint berhasil,
- student tersimpan,
- session tersimpan,
- event tersimpan,
- module result tersimpan,
- session completion tersimpan.

## Dashboard

- data siswa muncul,
- skor modul muncul,
- status session muncul,
- export bekerja.

---

# 40. Definition of Done

Jangan menyatakan task selesai hanya karena code compile.

Task selesai jika:

```text
[ ] Build pass
[ ] Typecheck pass
[ ] Lint pass
[ ] Runtime tested
[ ] Mobile tested
[ ] Offline tested
[ ] Backend tested
[ ] Error state tested
[ ] Existing feature regression checked
[ ] Documentation updated
```

---

# 41. Urutan Implementasi FINAL

Agent harus mengikuti urutan ini:

```text
PHASE 0
Audit
  ↓
PHASE 1
Build & runtime stabilization
  ↓
PHASE 2
API abstraction
  ↓
PHASE 3
Student identity
  ↓
PHASE 4
Session model
  ↓
PHASE 5
Zustand refactor
  ↓
PHASE 6
Game engine/UI separation
  ↓
PHASE 7
Animation/state machine stabilization
  ↓
PHASE 8
Deterministic random
  ↓
PHASE 9
Offline-first
  ↓
PHASE 10
Sync queue
  ↓
PHASE 11
Google Apps Script
  ↓
PHASE 12
Google Sheets schema
  ↓
PHASE 13
Backend validation
  ↓
PHASE 14
API client
  ↓
PHASE 15
Telemetry
  ↓
PHASE 16
Scoring
  ↓
PHASE 17
Hint system
  ↓
PHASE 18
Learning scaffolding
  ↓
PHASE 19
Module content refactor
  ↓
PHASE 20
Dashboard
  ↓
PHASE 21
Testing
  ↓
PHASE 22
Documentation
```

---

# 42. Prompt Eksekusi untuk OpenCode

Gunakan instruksi berikut sebagai system/task instruction untuk agent:

```text
Kamu adalah Senior Full Stack Engineer, Software Architect, dan EdTech Game Engineer.

Tugasmu adalah memperbaiki repository Learning-game secara bertahap berdasarkan dokumen IMPLEMENTATION_PLAN.md ini.

ATURAN:
1. Jangan melakukan rewrite total.
2. Audit code terlebih dahulu.
3. Jangan menghapus fitur yang bekerja.
4. Jangan menambahkan fitur besar sebelum fondasi stabil.
5. Gunakan incremental refactoring.
6. Pertahankan React + TypeScript + Vite.
7. Backend target adalah Google Apps Script + Google Sheets.
8. Jangan gunakan Supabase sebagai backend final.
9. Pertahankan offline-first menggunakan IndexedDB.
10. Pisahkan UI, game engine, session, telemetry, storage, dan API.
11. Jangan memasukkan secret ke source code.
12. Semua perubahan harus type-safe.
13. Setelah setiap fase, jalankan build/typecheck/lint yang tersedia.
14. Jika ada error, perbaiki sebelum lanjut.
15. Jangan mengarang API atau file yang belum diperiksa.
16. Jika ada konflik antara kode dan dokumen ini, prioritaskan:
   a. keamanan data,
   b. stabilitas aplikasi,
   c. backward compatibility,
   d. maintainability,
   e. pedagogical value.
17. Jangan mengubah game rules tanpa menjelaskan dampaknya.
18. Semua keputusan arsitektur penting harus dicatat di docs/ARCHITECTURE.md.

WORKFLOW:
- Inspect repository.
- Buat baseline.
- Identifikasi masalah.
- Buat rencana kecil.
- Implementasikan satu fase.
- Test.
- Review diff.
- Dokumentasikan.
- Baru lanjut ke fase berikutnya.

JANGAN:
- mengerjakan semua fase sekaligus,
- membuat big-bang rewrite,
- menghapus IndexedDB,
- membuat Google Sheets dipanggil langsung dari UI,
- membuat global God Store,
- menyimpan score saja tanpa telemetry.

TARGET AKHIR:
React → Game Engine → Zustand → Session/Sync → GAS → Google Sheets.

Game harus tetap dapat dimainkan ketika GAS atau internet tidak tersedia.
```

---

# 43. Output yang Harus Dihasilkan Agent

Setelah seluruh refactor selesai, repository harus memiliki:

```text
docs/
├── BASELINE.md
├── ARCHITECTURE.md
├── GAS_SETUP.md
├── DATA_SCHEMA.md
├── PEDAGOGICAL_DESIGN.md
└── TESTING.md

backend/
└── apps-script/
    ├── Code.gs
    ├── Config.gs
    ├── Students.gs
    ├── Sessions.gs
    ├── Events.gs
    └── README.md

app/src/
├── core/
├── content/
├── features/
├── components/
├── stores/
├── services/
└── types/
```

---

# 44. Prinsip Arsitektur Jangka Panjang

Tujuan akhir bukan sekadar:

> "Game Pabrik Kue."

Tujuan akhirnya adalah:

> **CT Learning Game Engine**

yang dapat menerima content pack:

```text
Algorithm Lab
Pattern Lab
Debugging Lab
Data Lab
Decomposition Lab
```

dengan engine yang sama.

Arsitektur:

```text
                CT GAME ENGINE
                      |
       +--------------+--------------+
       |              |              |
   Algorithm       Pattern        Debugging
     Pack            Pack            Pack
       |              |              |
       +--------------+--------------+
                      |
                Common Scoring
                      |
                Common Telemetry
                      |
                Common Session
                      |
                  GAS Backend
```

Dengan pendekatan ini, pengembangan berikutnya tidak perlu membuat game baru dari nol.

---

# 45. Prinsip Pedagogis Utama

Setiap fitur harus menjawab pertanyaan:

> "Apakah ini membantu siswa berpikir?"

Bukan hanya:

> "Apakah ini membuat game terlihat keren?"

Prioritas:

```text
Learning
  >
Clarity
  >
Feedback
  >
Agency
  >
Fun
  >
Visual effects
```

Game harus membuat siswa:

```text
mengamati
↓
memprediksi
↓
mencoba
↓
gagal
↓
menganalisis
↓
memperbaiki
↓
mencoba lagi
↓
memahami
```

Karena proses tersebut merupakan inti pengalaman belajar Computational Thinking.

---

# 46. Catatan Akhir untuk Agent

Jangan mengejar kesempurnaan arsitektur sebelum game dapat digunakan.

Prioritas:

```text
STABLE
→
PLAYABLE
→
OFFLINE
→
SYNCED
→
MEASURABLE
→
PEDAGOGICAL
→
SCALABLE
```

Jika menemukan masalah baru di luar dokumen ini:

1. jangan langsung melakukan perubahan besar,
2. dokumentasikan masalah,
3. tentukan dampaknya,
4. pilih solusi paling sederhana,
5. pastikan tidak merusak offline-first,
6. test,
7. dokumentasikan keputusan.

**Target akhir adalah aplikasi EdTech yang stabil, mudah dirawat, offline-first, dapat dianalisis guru, dan dapat berkembang menjadi platform game Computational Thinking modular untuk SMP.**
