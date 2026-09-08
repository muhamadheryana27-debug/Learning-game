/**
 * Unified Sync Engine — Phase 9+10
 * Single IndexedDB-backed queue with retry, backoff, and online listener.
 */
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "vect-ct-lab";
const DB_VERSION = 2;
const QUEUE_STORE = "sync_queue";

// ── Types ──────────────────────────────────────────────────────────────
export type SyncJobType =
  | "register_student"
  | "start_session"
  | "save_event"
  | "save_module_result"
  | "complete_session"
  | "module_activity"
  | "google_report";

export type SyncJobStatus = "pending" | "syncing" | "failed" | "completed";

export type SyncJob = {
  id?: number;
  type: SyncJobType;
  sessionId: string;
  studentId: string;
  payload: unknown;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  status: SyncJobStatus;
  lastError?: string;
  nextRetryAt?: string;
};

export type SyncListener = (status: SyncStatus) => void;

export type SyncStatus = {
  pending: number;
  syncing: number;
  failed: number;
  lastSyncAt: string | null;
  isOnline: boolean;
};

// ── DB ─────────────────────────────────────────────────────────────────
let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(QUEUE_STORE)) {
          const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
          store.createIndex("status", "status");
          store.createIndex("type", "type");
          store.createIndex("nextRetryAt", "nextRetryAt");
        }
      },
    });
  }
  return dbPromise;
}

// ── Enqueue ────────────────────────────────────────────────────────────
export async function enqueue(
  type: SyncJobType,
  sessionId: string,
  studentId: string,
  payload: unknown,
): Promise<number> {
  const db = await getDB();
  const job: Omit<SyncJob, "id"> = {
    type,
    sessionId,
    studentId,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 5,
    status: "pending",
  };
  const key = await db.add(QUEUE_STORE, job);
  return Number(key);
}

// ── Query ──────────────────────────────────────────────────────────────
export async function getPendingJobs(): Promise<SyncJob[]> {
  const db = await getDB();
  const all = await db.getAll(QUEUE_STORE);
  return all.filter((j) => j.status === "pending" || j.status === "failed");
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const db = await getDB();
  const all = await db.getAll(QUEUE_STORE);
  const pending = all.filter((j) => j.status === "pending").length;
  const syncing = all.filter((j) => j.status === "syncing").length;
  const failed = all.filter((j) => j.status === "failed").length;
  const completed = all.filter((j) => j.status === "completed");
  const lastSyncAt = completed.length > 0
    ? completed.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].createdAt
    : null;
  return { pending, syncing, failed, lastSyncAt, isOnline: navigator.onLine };
}

export async function getJobCount(): Promise<number> {
  const db = await getDB();
  return db.count(QUEUE_STORE);
}

// ── Update ─────────────────────────────────────────────────────────────
async function updateJob(job: SyncJob): Promise<void> {
  const db = await getDB();
  await db.put(QUEUE_STORE, job);
}

async function deleteJob(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(QUEUE_STORE, id);
}

// ── Backoff ────────────────────────────────────────────────────────────
function computeBackoffMs(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, retryCount), 30000);
}

// ── Flush ──────────────────────────────────────────────────────────────
export type FlushHandler = (job: SyncJob) => Promise<boolean>;

/**
 * Flush pending jobs through the handler.
 * On success: delete job.
 * On failure: increment retry, set backoff, mark failed if max retries exceeded.
 */
export async function flushQueue(handler: FlushHandler): Promise<number> {
  const db = await getDB();
  const jobs = await db.getAll(QUEUE_STORE);
  const pending = jobs
    .filter((j) => j.status === "pending" || j.status === "failed")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let flushed = 0;
  for (const job of pending) {
    // Check if backoff hasn't elapsed yet
    if (job.nextRetryAt && new Date(job.nextRetryAt) > new Date()) {
      continue;
    }

    // Mark as syncing
    job.status = "syncing";
    await updateJob(job);

    try {
      const ok = await handler(job);
      if (ok) {
        await deleteJob(job.id!);
        flushed++;
      } else {
        await markFailed(job, "Handler returned false");
      }
    } catch (err) {
      await markFailed(job, err instanceof Error ? err.message : "Unknown error");
    }
  }
  return flushed;
}

async function markFailed(job: SyncJob, error: string): Promise<void> {
  job.retryCount++;
  job.lastError = error;
  if (job.retryCount >= job.maxRetries) {
    job.status = "failed";
    job.nextRetryAt = undefined;
  } else {
    job.status = "pending";
    job.nextRetryAt = new Date(Date.now() + computeBackoffMs(job.retryCount)).toISOString();
  }
  await updateJob(job);
}

// ── Online Listener ────────────────────────────────────────────────────
let autoSyncHandler: (() => void) | null = null;
let statusListeners: Set<SyncListener> = new Set();

export function onSyncStatusChange(listener: SyncListener): () => void {
  statusListeners.add(listener);
  return () => { statusListeners.delete(listener); };
}

async function notifyListeners(): Promise<void> {
  const status = await getSyncStatus();
  statusListeners.forEach((l) => l(status));
}

/**
 * Initialize auto-sync: listen for online events, flush on reconnect.
 * Call once at app startup.
 */
export function initAutoSync(flusher: FlushHandler): () => void {
  if (autoSyncHandler) return () => {};

  const handler = async () => {
    await notifyListeners();
    if (navigator.onLine) {
      const count = await flushQueue(flusher);
      if (count > 0) await notifyListeners();
    }
  };

  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);

  // Try once on init if online
  if (navigator.onLine) {
    void handler();
  }

  autoSyncHandler = () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
    autoSyncHandler = null;
  };

  return autoSyncHandler;
}

// ── Clear ──────────────────────────────────────────────────────────────
export async function clearCompletedJobs(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll(QUEUE_STORE);
  const completed = all.filter((j) => j.status === "completed");
  for (const job of completed) {
    await db.delete(QUEUE_STORE, job.id!);
  }
  return completed.length;
}

export async function clearAllJobs(): Promise<void> {
  const db = await getDB();
  await db.clear(QUEUE_STORE);
}
