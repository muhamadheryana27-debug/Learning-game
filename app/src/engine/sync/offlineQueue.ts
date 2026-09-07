import { openDB } from "idb";

const DB_NAME = "vect-ct-lab";
const STORE = "pending_writes";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

export type PendingWrite = {
  id?: number;
  table: string;
  payload: unknown;
  createdAt: string;
};

export async function enqueue(table: string, payload: unknown) {
  const db = await getDB();
  await db.add(STORE, { table, payload, createdAt: new Date().toISOString() } as PendingWrite);
}

export async function getQueue(): Promise<PendingWrite[]> {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function clearQueue() {
  const db = await getDB();
  await db.clear(STORE);
}

export async function flushQueue(
  handler: (item: PendingWrite) => Promise<boolean>,
): Promise<number> {
  const items = await getQueue();
  let flushed = 0;
  for (const item of items) {
    const ok = await handler(item);
    if (ok) {
      const db = await getDB();
      await db.delete(STORE, item.id!);
      flushed++;
    } else {
      break; // stop on first failure (offline again)
    }
  }
  return flushed;
}
