import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "island-first-offline";
const DB_VERSION = 1;

interface OfflineDB {
  quizData: {
    key: string;
    value: {
      quizId: string;
      data: unknown;
      cachedAt: number;
    };
  };
  pendingAnswers: {
    key: number;
    value: {
      attemptId: string;
      questionId: string;
      selectedAnswerIndex: number;
      selectedAnswerIndexes?: number[];
      queuedAt: number;
    };
    indexes: { byAttempt: string };
  };
  pendingCompletions: {
    key: number;
    value: {
      attemptId: string;
      timeSpent: number;
      queuedAt: number;
    };
  };
  quizBundles: {
    key: string;
    value: {
      cacheKey: string;
      data: unknown;
      cachedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("quizData")) {
          db.createObjectStore("quizData", { keyPath: "quizId" });
        }
        if (!db.objectStoreNames.contains("pendingAnswers")) {
          const store = db.createObjectStore("pendingAnswers", {
            autoIncrement: true,
          });
          store.createIndex("byAttempt", "attemptId");
        }
        if (!db.objectStoreNames.contains("pendingCompletions")) {
          db.createObjectStore("pendingCompletions", { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("quizBundles")) {
          db.createObjectStore("quizBundles", { keyPath: "cacheKey" });
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheQuizForOffline(
  quizId: string,
  data: unknown
): Promise<void> {
  const db = await getDB();
  await db.put("quizData", { quizId, data, cachedAt: Date.now() });
}

export async function getOfflineQuiz(quizId: string): Promise<unknown | null> {
  const db = await getDB();
  const entry = await db.get("quizData", quizId);
  if (!entry) return null;
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - entry.cachedAt > ONE_WEEK) {
    await db.delete("quizData", quizId);
    return null;
  }
  return entry.data;
}

export async function cacheQuizBundles(
  cacheKey: string,
  data: unknown
): Promise<void> {
  const db = await getDB();
  await db.put("quizBundles", { cacheKey, data, cachedAt: Date.now() });
}

export async function getOfflineQuizBundles(
  cacheKey: string
): Promise<unknown | null> {
  const db = await getDB();
  const entry = await db.get("quizBundles", cacheKey);
  if (!entry) return null;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (Date.now() - entry.cachedAt > ONE_DAY) {
    await db.delete("quizBundles", cacheKey);
    return null;
  }
  return entry.data;
}

export async function queueAnswer(
  attemptId: string,
  questionId: string,
  selectedAnswerIndex: number,
  selectedAnswerIndexes?: number[]
): Promise<void> {
  const db = await getDB();
  await db.add("pendingAnswers", {
    attemptId,
    questionId,
    selectedAnswerIndex,
    selectedAnswerIndexes,
    queuedAt: Date.now(),
  });
}

export async function queueCompletion(
  attemptId: string,
  timeSpent: number
): Promise<void> {
  const db = await getDB();
  await db.add("pendingCompletions", { attemptId, timeSpent, queuedAt: Date.now() });
}

export interface PendingAnswer {
  key: number;
  attemptId: string;
  questionId: string;
  selectedAnswerIndex: number;
  selectedAnswerIndexes?: number[];
}

export interface PendingCompletion {
  key: number;
  attemptId: string;
  timeSpent: number;
}

export async function getPendingAnswers(): Promise<PendingAnswer[]> {
  const db = await getDB();
  const tx = db.transaction("pendingAnswers", "readonly");
  const store = tx.objectStore("pendingAnswers");
  let cursor = await store.openCursor();
  const results: PendingAnswer[] = [];
  while (cursor) {
    results.push({ key: cursor.key as number, ...cursor.value });
    cursor = await cursor.continue();
  }
  return results;
}

export async function getPendingCompletions(): Promise<PendingCompletion[]> {
  const db = await getDB();
  const tx = db.transaction("pendingCompletions", "readonly");
  const store = tx.objectStore("pendingCompletions");
  let cursor = await store.openCursor();
  const results: PendingCompletion[] = [];
  while (cursor) {
    results.push({ key: cursor.key as number, ...cursor.value });
    cursor = await cursor.continue();
  }
  return results;
}

export async function removePendingAnswer(key: number): Promise<void> {
  const db = await getDB();
  await db.delete("pendingAnswers", key);
}

export async function removePendingCompletion(key: number): Promise<void> {
  const db = await getDB();
  await db.delete("pendingCompletions", key);
}

export async function hasPendingSync(): Promise<boolean> {
  const answers = await getPendingAnswers();
  const completions = await getPendingCompletions();
  return answers.length > 0 || completions.length > 0;
}
