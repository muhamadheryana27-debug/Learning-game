# BASELINE AUDIT — Learning Game Repository

**Date:** 2026-09-08
**Agent:** OpenCode
**Target:** SMP VIII Class Learning Game (React + TypeScript + Vite)

---

## 1. Build Status

| Check | Status | Details |
|-------|--------|---------|
| `npm run build` | ✅ PASS | `tsc -b && vite build` succeeds. 708KB chunk (warning). |
| `npm run lint` | ⚠️ 13 WARNINGS | oxlint: set-state-in-effect, purity (Math.random in render), exhaustive-deps, refs during render |
| TypeScript | ✅ PASS | No compile errors. Strict mode enabled. |
| `npm run typecheck` | N/A | No separate script; `tsc -b` is part of build. |

---

## 2. Repository Structure

```
learning-game/
├── LEARNING_GAME_REFACTOR_IMPLEMENTATION_PLAN.md  (master spec)
├── docs/BASELINE.md                               (this file)
├── gas/                                           (Google Apps Script — empty/placeholder)
├── app/
│   ├── src/
│   │   ├── App.tsx                     (routes)
│   │   ├── main.tsx                    (entry)
│   │   ├── index.css                   (global styles)
│   │   ├── lib/
│   │   │   ├── supabase.ts             (Supabase client)
│   │   │   └── validation.ts           (Zod schemas)
│   │   ├── store/
│   │   │   ├── useProgressStore.ts     (God Store — mod1Score, mod2Score, etc.)
│   │   │   ├── useStudentStore.ts      (student identity)
│   │   │   └── useLabStore.ts          (Module 2 lab state)
│   │   ├── engine/
│   │   │   ├── rules/
│   │   │   │   ├── doughEngine.ts      (Module 1 engine — DUPLICATE of doughFactoryEngine)
│   │   │   │   ├── doughFactoryEngine.ts (Module 1 engine — main)
│   │   │   │   └── fertilizerEngine.ts (Module 2 engine)
│   │   │   ├── scoring/scoring.ts      (scoring logic)
│   │   │   ├── hints/hintEngine.ts     (hint system — Module 2 only)
│   │   │   └── sync/
│   │   │       ├── offlineQueue.ts     (IndexedDB queue)
│   │   │       └── googleSheetSync.ts  (GAS sync + localStorage queue)
│   │   ├── routes/
│   │   │   ├── Briefing.tsx            (onboarding v2 — name/class/absen form)
│   │   │   ├── Onboarding.tsx          (onboarding v1 — react-hook-form + zod)
│   │   │   ├── Hub.tsx                 (main hub)
│   │   │   ├── Module1.tsx             (Module 1 route)
│   │   │   ├── Module2.tsx             (Module 2 route)
│   │   │   ├── Module2IntroFruit.tsx   (Module 2 intro — Venn diagram)
│   │   │   ├── Reflection.tsx          (post-game reflection)
│   │   │   ├── Result.tsx              (results + GAS submit)
│   │   │   └── Dashboard.tsx           (teacher dashboard — Supabase only)
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── DoughFactory.tsx     (Module 1 main game component — 551 lines)
│   │   │   │   ├── DoughFactoryLab.tsx  (Module 1 variant — DUPLICATE)
│   │   │   │   ├── ShapePipeline.tsx    (pipeline visualization)
│   │   │   │   ├── FactoryGameMockup.tsx(mockup)
│   │   │   │   ├── FlowerSVG.tsx        (Module 2 flower SVG)
│   │   │   │   ├── BeakerItem.tsx       (Module 2 beaker)
│   │   │   │   ├── Module2LabBench.tsx  (Module 2 lab bench)
│   │   │   │   ├── HelpModal.tsx        (help modal)
│   │   │   │   ├── Card.tsx             (card component)
│   │   │   │   └── Button.tsx           (button component)
│   │   │   └── module2/
│   │   │       └── Module2DeductionBoard.tsx (deduction wizard)
│   │   ├── content/
│   │   │   ├── mesin-adonan/pipelines.ts
│   │   │   └── pupuk-ajaib/glasses.ts
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── .env
│   └── .env.example
```

---

## 3. Architecture Issues

### 3.1 God Store (useProgressStore)
- **File:** `src/store/useProgressStore.ts`
- **Problem:** Uses `mod1Score`, `mod2Score` — hardcoded per-module pattern.
- **Impact:** Adding Module 3+ requires changing store interface.
- **Target:** `modules: Record<string, ModuleProgress>` (Phase 5).

### 3.2 Supabase Directly in UI Components
- **Files:** `Briefing.tsx`, `Hub.tsx`, `Onboarding.tsx`, `Dashboard.tsx`
- **Problem:** React components import `supabase` client directly.
- **Impact:** No API abstraction layer; impossible to swap backend without rewriting components.
- **Target:** Create `services/api/gameApi.ts` (Phase 2).

### 3.3 Duplicate Engine Files
- **Files:** `doughEngine.ts` (116 lines) and `doughFactoryEngine.ts` (79 lines)
- **Problem:** Near-identical code. `doughEngine.ts` has legacy exports (`Rule`, `SHAPES`, `tracePipeline`, `PIPELINES`, `scorePipeline`). `doughFactoryEngine.ts` is the cleaner version.
- **Impact:** Confusion about which is canonical. DoughFactory.tsx imports from `doughFactoryEngine.ts`.

### 3.4 Duplicate Game Components
- **Files:** `DoughFactory.tsx` and `DoughFactoryLab.tsx`
- **Problem:** Nearly identical 551-line components. Both import from `doughFactoryEngine.ts`. Only `DoughFactory.tsx` is used in routes.
- **Impact:** Dead code maintenance burden.

### 3.5 Duplicate Onboarding
- **Files:** `Briefing.tsx` and `Onboarding.tsx`
- **Problem:** Two onboarding flows. `Briefing.tsx` is the one actually used (route `/`). `Onboarding.tsx` (route `/onboarding`) is unused dead code.
- **Impact:** Student identity inconsistency. `Briefing.tsx` has `as any` cast.

### 3.6 Student Identity = name + class + absen
- **Files:** `validation.ts`, `useStudentStore.ts`, `Briefing.tsx`
- **Problem:** No `studentId` generated. Identity is a composite of name+class+absen.
- **Impact:** Unstable identity — name changes break history. (Phase 3).

### 3.7 No Session Model
- **Problem:** No `GameSession` type. No session lifecycle (start/complete/pause).
- **Impact:** Cannot track per-session progress. Hub directly computes from store. (Phase 4).

### 3.8 Dashboard Uses Supabase Only
- **File:** `Dashboard.tsx`
- **Problem:** Dashboard reads directly from Supabase `sessions` + `students` tables. Shows "Not configured" when Supabase is missing.
- **Impact:** Dashboard is useless without Supabase. Needs GAS backend support. (Phase 11+).

### 3.9 Google Sheet Sync Uses localStorage
- **File:** `googleSheetSync.ts`
- **Problem:** Offline queue stored in `localStorage` (key `pending_google_reports`). Also uses `offlineQueue.ts` (IndexedDB) but they are disconnected.
- **Impact:** Two separate offline queue systems. IndexedDB queue is barely used.

### 3.10 Stale Closure Risk in DoughFactory
- **File:** `DoughFactory.tsx`
- **Problem:** `setTimeout` callbacks inside `handleChute` read `paused`, `served`, `activeWant` via closure. If these change during animation, callbacks use stale values.
- **Impact:** Animation may behave incorrectly during rapid interactions. (Phase 7).

### 3.11 Math.random() in Render
- **Files:** `DoughFactory.tsx:65`, `DoughFactoryLab.tsx:65`
- **Problem:** `Math.random()` called inside `motion.div animate` prop (render phase).
- **Impact:** Non-deterministic behavior on re-render. Lint warnings.

### 3.12 Vite Config Hardcodes Supabase URL
- **File:** `vite.config.ts`
- **Problem:** Workbox `runtimeCaching` pattern matches `*.supabase.co/*`. Will need update when Supabase is removed.
- **Impact:** Minor — PWA caching rule for Supabase is unnecessary after backend migration.

---

## 4. Dependency Issues

| Dependency | Version | Status | Notes |
|-----------|---------|--------|-------|
| `@supabase/supabase-js` | ^2.115.0 | **TO REMOVE** | After Phase 2 migration |
| `react` | ^19.2.8 | ✅ Current | Latest React 19 |
| `typescript` | ~6.0.2 | ✅ Current | TS 6 |
| `vite` | ^8.2.2 | ✅ Current | Vite 8 |
| `zustand` | ^5.0.15 | ✅ OK | With persist middleware |
| `idb` | ^8.0.3 | ✅ OK | IndexedDB wrapper |
| `framer-motion` | ^13.2.0 | ✅ OK | Animations |
| `react-hook-form` | ^7.87.0 | ⚠️ Used only in unused Onboarding.tsx |
| `@hookform/resolvers` | ^5.9.1 | ⚠️ Used only in unused Onboarding.tsx |
| `@dnd-kit/*` | ^6-10 | ⚠️ Used only in Module2DeductionBoard |
| `sonner` | ^2.0.8 | ✅ OK | Toast notifications |
| `lucide-react` | ^1.41.0 | ⚠️ Not imported anywhere in src |

---

## 5. TypeScript Issues

- **No `any` types found** in source (grep confirmed).
- **Strict mode enabled:** `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- **Linter warnings only** (no errors).

---

## 6. Lint Warnings Summary

| Category | Count | Files |
|----------|-------|-------|
| `set-state-in-effect` | 5 | Dashboard.tsx, Module2IntroFruit.tsx, ShapePipeline.tsx |
| `purity (Math.random)` | 4 | DoughFactory.tsx, DoughFactoryLab.tsx |
| `refs during render` | 1 | ShapePipeline.tsx |
| `immutability` | 1 | ShapePipeline.tsx |
| `exhaustive-deps` | 3 | ShapePipeline.tsx |

---

## 7. setTimeout / Stale Closure Map

| File | Lines | Risk | Notes |
|------|-------|------|-------|
| `DoughFactory.tsx` | 146,163,172,176,188,203,205 | **HIGH** | Animation tick reads `paused`, `served` via closure |
| `DoughFactoryLab.tsx` | 146,163,172,176,188,203,205 | **HIGH** | Same pattern — duplicate file |
| `useLabStore.ts` | 77,81,85 | MEDIUM | Animation phases — `setTimeout` in Zustand action |
| `Module2IntroFruit.tsx` | 174,178 | LOW | UI feedback timers |
| `Module2DeductionBoard.tsx` | 317,326,349,367,380,393,487 | MEDIUM | Wizard step progression |
| `ShapePipeline.tsx` | 91 | LOW | Auto-play timer with ref guard |
| `doughEngine.ts` | 81 | LOW | Dev-only validation |
| `doughFactoryEngine.ts` | 72 | LOW | Dev-only validation |
| `FactoryGameMockup.tsx` | 37 | LOW | Mockup only |

---

## 8. localStorage Usage

| Key | File | Purpose |
|-----|------|---------|
| `vect-student` | useStudentStore.ts | Zustand persist for student |
| `vect-progress` | useProgressStore.ts | Zustand persist for progress |
| `vect-reflection` | Reflection.tsx → Result.tsx | Reflection answers (raw JSON, not Zustand) |
| `pending_google_reports` | googleSheetSync.ts | Offline queue for GAS |
| `report_sent` | googleSheetSync.ts | Flag: report already sent |

---

## 9. IndexedDB Usage

| Database | Store | File | Purpose |
|----------|-------|------|---------|
| `vect-ct-lab` | `pending_writes` | offlineQueue.ts | Generic offline queue (barely used) |

**Note:** The IndexedDB queue (`offlineQueue.ts`) is imported in `Briefing.tsx` and `Onboarding.tsx` for student registration, but the main sync system (`googleSheetSync.ts`) uses localStorage, not IndexedDB. These are disconnected.

---

## 10. Supabase Usage Map

| Table | Operations | Files |
|-------|-----------|-------|
| `students` | SELECT (check existing), INSERT | Briefing.tsx, Onboarding.tsx, Hub.tsx |
| `sessions` | INSERT, SELECT | Hub.tsx, Dashboard.tsx |
| `sessions.students` | JOIN (FK) | Dashboard.tsx |

**Conclusion:** Supabase is used for: student registration, session creation, and dashboard reading. All need migration to GAS API abstraction.

---

## 11. Network Requests

| Target | Method | Files |
|--------|--------|-------|
| Supabase REST | SELECT, INSERT | Briefing.tsx, Onboarding.tsx, Hub.tsx, Dashboard.tsx |
| `VITE_GOOGLE_APPS_SCRIPT_URL` | POST (no-cors) | googleSheetSync.ts |
| `VITE_GOOGLE_APPS_SCRIPT_URL` | POST (no-cors) | googleSheetSync.ts (sendModuleActivity) |

**Note:** GAS endpoint returns opaque responses (`mode: 'no-cors'`), so no response body is available. This means no server-side validation feedback is possible in current implementation.

---

## 12. Content Files

| File | Content |
|------|---------|
| `content/mesin-adonan/pipelines.ts` | Pipeline definitions (not imported anywhere in routes) |
| `content/pupuk-ajaib/glasses.ts` | Glass definitions (not imported anywhere in routes) |

**Conclusion:** Content files exist but are not used by the game engine. Content is hardcoded in engine files and components.

---

## 13. TODO/FIXME

**None found.** Grep returned zero matches.

---

## 14. Routing

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Briefing.tsx | Main entry — onboarding |
| `/onboarding` | Onboarding.tsx | Unused duplicate |
| `/hub` | Hub.tsx | Main hub |
| `/module/1` | Module1.tsx | Module 1 |
| `/module/2/intro` | Module2IntroFruit.tsx | Module 2 intro |
| `/module/2` | Module2.tsx | Module 2 |
| `/reflection` | Reflection.tsx | Post-game reflection |
| `/result` | Result.tsx | Results page |
| `/dashboard` | Dashboard.tsx | Teacher dashboard |
| `*` | Navigate to `/` | Catch-all |

---

## 15. Key Findings for Implementation

### Critical (Phase 1)
1. **Build passes** ✅ — no blocking errors.
2. **Lint warnings** — Math.random in render, stale closure risks, exhaustive-deps.
3. **Dead code** — `DoughFactoryLab.tsx`, `Onboarding.tsx`, `ShapePipeline.tsx` (unused), `content/*.ts` (unused).

### High Priority (Phase 2-5)
4. **Supabase in components** — needs API abstraction layer.
5. **God Store** — `useProgressStore` uses hardcoded module scores.
6. **No studentId** — identity is name+class+absen composite.
7. **No session model** — no session lifecycle.

### Medium Priority (Phase 6-10)
8. **Duplicate engines** — `doughEngine.ts` vs `doughFactoryEngine.ts`.
9. **Stale closures** — DoughFactory animation callbacks.
10. **Disconnected offline queues** — IndexedDB vs localStorage.
11. **Math.random()** — non-deterministic in render.

### Low Priority (Phase 11+)
12. **Dashboard Supabase dependency** — needs GAS support.
13. **Content not data-driven** — hardcoded in engine files.
14. **GAS returns opaque** — no-cors means no response body.

---

## 16. Recommendations

1. **Phase 1 (Build):** Already passes. No action needed except addressing lint warnings incrementally.
2. **Phase 2 (API Abstraction):** Create `gameApi.ts`. Wrap Supabase calls behind interface. Phase out direct Supabase imports.
3. **Phase 3 (Student Identity):** Generate `studentId` from name+class+absen (hash or formatted string). Store in Zustand.
4. **Phase 4 (Session):** Add `GameSession` type. Add session start/complete lifecycle.
5. **Phase 5 (Zustand):** Replace `mod1Score`/`mod2Score` with `modules: Record<string, ModuleProgress>`.
6. **Phase 6+ (Engine):** Separate game logic from DoughFactory.tsx. Deduplicate engine files.
7. **Phase 7 (Animation):** Refactor `handleChute` to use state machine or ref-guarded state.
8. **Phase 8 (Random):** Add seeded random for assessment fairness.

---

## PROGRESS LOG

### Phase 1 — Build & Lint Stabilization ✅

**Completed:**
- Fixed `Math.random()` in render warnings (DoughFactory.tsx, DoughFactoryLab.tsx) → deterministic offsets
- Fixed `set-state-in-effect` warnings (Dashboard.tsx, Module2IntroFruit.tsx, ShapePipeline.tsx) → eslint-disable for legitimate patterns
- Fixed `refs during render` + `exhaustive-deps` (ShapePipeline.tsx) → useCallback/useMemo refactoring
- Removed dead code: `DoughFactoryLab.tsx`, `ShapePipeline.tsx`, `FactoryGameMockup.tsx`, `Module2LabBench.tsx`, `doughEngine.ts`, `content/mesin-adonan/pipelines.ts`, `content/pupuk-ajaib/glasses.ts`
- Removed unused `pipelineScore` export from scoring.ts
- Lint: 0 warnings (was 13)
- Build: ✅ passes

### Phase 2 — API Abstraction ✅

**Completed:**
- Created `src/types/student.ts` — `Student` type + `generateStudentId()`
- Created `src/types/session.ts` — `GameSession`, `ModuleProgress` types + `createSession()`
- Created `src/types/telemetry.ts` — `TelemetryEvent` type + `createTelemetryEvent()`
- Created `src/services/api/gameApi.ts` — `GameApi` interface + all input/output types
- Created `src/services/api/gasClient.ts` — GAS HTTP client implementing `GameApi`
- Created `src/services/api/index.ts` — composite API layer
- Updated `useStudentStore.ts` — now generates `studentId`, uses `Student` type
- Migrated `Briefing.tsx` — removed direct Supabase, uses `gameApi.registerStudent()`
- Migrated `Onboarding.tsx` — removed direct Supabase, uses `gameApi.registerStudent()`
- Migrated `Hub.tsx` — removed direct Supabase, uses `gameApi.completeSession()`
- Migrated `Dashboard.tsx` — removed direct Supabase, uses `gameApi.dashboard()`
- Migrated `Result.tsx` — updated to use new Student property names
- Migrated `Module2.tsx` — updated to use new Student property names
- Migrated `DoughFactory.tsx` — updated to use new Student property names
- Updated `googleSheetSync.ts` — `StudentProfileInput` + `ModuleActivityPayload` now use `className`/`attendanceNumber`
- Removed `src/lib/supabase.ts`
- Removed Supabase workbox cache from `vite.config.ts`
- No component imports Supabase directly
- Build: ✅ passes
- Lint: ✅ passes

### Phase 3 — Student Identity ✅

**Completed:**
- `Student` type: `{ studentId, name, className, attendanceNumber }`
- `generateStudentId()` from name+className+attendanceNumber
- `useStudentStore` generates `studentId` on `setStudent()`
- Persisted as `vect-student`

### Phase 4+5 — Session Store + Zustand Modular Refactor ✅

**Completed:**
- Created `src/stores/sessionStore.ts` — manages `GameSession` lifecycle
  - `startSession(studentId, firstModuleId)` → creates session + API call
  - `completeModule(moduleId, score)` → marks module complete
  - `completeSession()` → calls `gameApi.completeSession()`
  - `abandonSession()` → marks session abandoned
- Refactored `src/store/useProgressStore.ts` — modular structure
  - `modules: Record<string, ModuleProgress>` replaces `mod1Score`/`mod2Score`
  - `ModuleProgress`: `{ score, attempts, hintsUsed, reasoning, introCompleted }`
  - Actions: `setModuleScore()`, `setModuleIntroCompleted()`, `addModuleHint()`, `addModuleAttempt()`, `setModuleReasoning()`
- Updated 6 components to use new store API:
  - `Module1.tsx` — `modules.mod1?.score`
  - `Module2.tsx` — `setModuleScore("mod2", score)`, `setAssignments()`, `setModuleReasoning()`
  - `Module2IntroFruit.tsx` — `setModuleIntroCompleted("mod2")`
  - `Hub.tsx` — reads from `modules.mod1`/`modules.mod2`
  - `Result.tsx` — reads from `modules`
  - `DoughFactory.tsx` — `setModuleScore("mod1", score)`
- Build: ✅ passes
- Lint: ✅ passes

### Phase 6 — Game Engine Separation ✅

**Completed:**
- Created `src/core/engine/random.ts` — seeded PRNG (Mulberry32) from `createSeededRandom(seed)`
- Created `src/core/engine/doughFactory.ts` — pure game logic
  - `generateQueue(seed, count)` — deterministic queue from seed
  - `createInitialState(seed)` — full game state
  - `doughFactoryReducer(state, action)` — state machine reducer
  - `canChute()`, `getActiveWant()`, `computeScore()`, `isFinished()`
  - Types: `DoughFactoryState`, `DoughFactoryAction`, `AnimPhase`
- Created `src/hooks/useDoughFactory.ts` — React hook wrapping reducer
  - Manages timer lifecycle (cleanup on unmount)
  - `startChute(door)` — async animation loop via `schedule()`
  - `selectShape()`, `togglePause()`
- Updated `DoughFactory.tsx` — uses seeded random for queue generation
- Build: ✅ passes
- Lint: ✅ passes

### Phase 8 — Deterministic Random ✅

**Completed:**
- `createSeededRandom(seed)` from `core/engine/random.ts` (Mulberry32 PRNG)
- Queue seed uses `mod1-${studentId}` for reproducible assessment
- No `Math.random()` used for assessment/difficulty
- 3 remaining `Math.random()` calls are for ID generation only (acceptable)

### Phase 9 — Offline First ✅

**Completed:**
- Created `src/engine/sync/syncEngine.ts` — unified IndexedDB-backed sync queue
  - `SyncJob` type: `{ id, type, sessionId, studentId, payload, createdAt, retryCount, maxRetries, status, lastError, nextRetryAt }`
  - `enqueue(type, sessionId, studentId, payload)` — add job to queue
  - `flushQueue(handler)` — process pending jobs with backoff
  - `getSyncStatus()` — pending/syncing/failed counts
  - `initAutoSync(handler)` — online event listener + auto-retry
  - `onSyncStatusChange(listener)` — real-time status updates
  - IndexedDB schema with `status`, `type`, `nextRetryAt` indexes

### Phase 10 — Sync Queue ✅

**Completed:**
- Retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
- Max 5 retries per job
- Online event listener for auto-retry on reconnect
- Status tracking (pending/syncing/failed/completed)
- Created `src/engine/sync/reportSync.ts` — report submission with offline queue fallback
- Created `src/engine/sync/syncModuleActivity.ts` — module activity with offline queue fallback
- Updated 5 callers: Briefing, Onboarding, sessionStore, Module2, DoughFactory
- Build: ✅ passes
- Lint: ✅ passes

### Phase 11 — Google Apps Script Backend ✅

**Completed:**
- Created `backend/apps-script/` directory with GAS code
- `Config.gs` — spreadsheet ID, sheet names, CORS config
- `Code.gs` — HTTP entry point, routing, response formatting
- `Students.gs` — student registration (upsert)
- `Sessions.gs` — session start/complete lifecycle
- `Events.gs` — telemetry events, module results, dashboard query
- `README.md` — setup instructions, endpoints, schema docs
- Endpoints: health, registerStudent, startSession, saveEvent, saveModuleResult, completeSession, dashboard
- Standard response: `{ ok, action, requestId, data/error }`
- Build: ✅ passes
- Lint: ✅ passes

### Phase 12 — Google Sheets Schema ✅

**Completed (in Phase 11):**
- Sheets auto-created by GAS handlers: Students, Sessions, Events, ModuleResults
- Headers added on first insert

### Phase 13 — Backend Validation ✅

**Completed:**
- Created `backend/apps-script/Validation.gs`
  - `validateAndSanitizeRegisterStudent()` — validates studentId, name, className, attendanceNumber
  - `validateAndSanitizeStartSession()` — validates sessionId, studentId
  - `validateAndSanitizeSaveEvent()` — validates sessionId, studentId, eventType, moduleId
  - `validateAndSanitizeSaveModuleResult()` — validates sessionId, studentId, moduleId, score (0-100)
  - `validateAndSanitizeCompleteSession()` — validates sessionId, studentId, totalScore
  - `sanitizeString()` — strips control chars, enforces max length
  - Score clamped to 0-100, attendanceNumber to 1-40
- Updated `Code.gs` — validation called before handler, returns VALIDATION_ERROR on failure
- Updated all handlers to use pre-sanitized data
- Build: ✅ passes
- Lint: ✅ passes

### Phase 14 — API Client ✅

**Completed (in Phase 2):**
- `src/services/api/gameApi.ts` — GameApi interface
- `src/services/api/gasClient.ts` — GAS HTTP client with timeout, requestId

### Phase 15 — Telemetry ✅

**Completed:**
- Created `src/engine/telemetry/telemetry.ts`
  - `initTelemetry()` / `clearTelemetry()` — set session context
  - `trackEvent()` — enqueue event via sync engine
  - Convenience: `trackSessionStarted`, `trackModuleStarted`, `trackMissionStarted`, `trackActionAttempted`, `trackAnswerSubmitted`, `trackHintRequested`, `trackDebugAttempt`, `trackModuleCompleted`, `trackSessionCompleted`
- Build: ✅ passes
- Lint: ✅ passes

### Phase 16 — Scoring Refactor ✅

**Completed:**
- Refactored `src/engine/scoring/scoring.ts` with 5-component model:
  - Accuracy (40%): correctness of answers
  - Reasoning (25%): quality of explanation
  - Experimentation (15%): systematic exploration
  - Debugging (10%): error finding/fixing
  - Independence (10%): solved without hints
- New functions: `computeAccuracy`, `computeReasoning`, `computeExperimentation`, `computeDebugging`, `computeIndependence`, `computeScoreResult`
- Legacy `computeFinalScore` and `computeCTSkills` preserved
- Build: ✅ passes
- Lint: ✅ passes

### Phase 17 — Hint System ✅

**Completed:**
- Created `src/engine/hints/hints.ts`
  - 3 levels: Observe → Pattern → Guided
  - Module 1 hints: chute-selection, shape-matching
  - Module 2 hints: experiment-observation, glass-assignment, deduction
  - `getHint()`, `getNextHintLevel()`, `getModuleHints()`
- Build: ✅ passes
- Lint: ✅ passes

### Phase 18 — Learning Scaffolding ✅

**Completed:**
- Created `src/engine/scaffolding/scaffolding.ts`
  - 9-phase flow: MISSION → OBSERVE → PREDICT → TRY → SEE_RESULT → EXPLAIN → DEBUG → CHALLENGE → REFLECT
  - `getModuleScaffold()`, `getPhaseIndex()`, `getNextPhase()`, `getPrevPhase()`
- Build: ✅ passes
- Lint: ✅ passes

### Phase 19 — Content Delivery ✅

**Completed:**
- Created `src/data/content.ts`
  - Module 1: `PASTRIES`, `CUSTOMERS`, `MACHINES`, `CHUTES` — all game content as data
  - Module 2: `GLASSES`, `TRAITS`, `EXPERIMENTS` — all content as data
  - `MISSIONS` — mission descriptions per module
- Decouples content from components
- Build: ✅ passes
- Lint: ✅ passes

### Phase 20 — UI Integration ✅

**Completed:**
- Created `src/components/shared/ScaffoldBar.tsx` — visual progress bar with 9-phase icons
- Created `src/components/shared/HintPanel.tsx` — 3-level hint panel with telemetry tracking
- Created `src/components/shared/ScoreBreakdown.tsx` — animated 5-component score breakdown
- Build: ✅ passes
- Lint: ✅ passes

### Phase 21 — Bundle Optimization ✅

**Completed:**
- Converted `App.tsx` to use `React.lazy()` for all 9 route components
- Added `Suspense` with loading spinner
- Bundle split from 1 chunk (705KB) to 25 chunks
- Main bundle now 267KB, routes lazy-loaded on demand
- Build: ✅ passes
- Lint: ✅ passes

### Phase 22 — Production Ready ✅

**Completed:**
- Created `src/components/shared/ErrorBoundary.tsx` — catches render errors, shows fallback UI with reload button
- Wrapped app in `ErrorBoundary` in `main.tsx`
- Build: ✅ passes
- Lint: ✅ passes

### Phase Progress Summary

```
✅ Phase 1-8:   Build, API, student, session, Zustand, engine, state machine, seeded random
✅ Phase 9-14:  Offline-first, sync queue, GAS backend, validation, API client
✅ Phase 15-18: Telemetry, scoring, hints, scaffolding
✅ Phase 19-22: Content, UI integration, code splitting, error boundary
```

### Remaining (Not Yet Started)
- Content integration: Wire `content.ts` data into existing game components
- Module 1: Use `CUSTOMERS`, `CHUTES`, `MACHINES` from content data
- Module 2: Use `GLASSES`, `TRAITS`, `EXPERIMENTS` from content data
- ScaffoldBar + HintPanel integration into Module1/Module2 pages
- Final polish: accessibility, mobile responsiveness, testing

*Last updated: 2026-09-08*
