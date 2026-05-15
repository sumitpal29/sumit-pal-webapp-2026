import type {
  ProgressStore,
  ActiveSession,
  SessionHistory,
  UserPrefs,
} from './types';

const MAX_SESSIONS = 4;

const KEYS = {
  progress: 'recall-cards:progress',
  sessions: 'recall-cards:sessions',
  history: 'recall-cards:history',
  prefs: 'recall-cards:prefs',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ── Progress ────────────────────────────────────────────────────────────────

export const getProgress = (): ProgressStore =>
  read<ProgressStore>(KEYS.progress, {});

export const saveProgress = (store: ProgressStore): void =>
  write(KEYS.progress, store);

// ── Session stack (max 4, FIFO) ─────────────────────────────────────────────

export const getSessions = (): ActiveSession[] =>
  read<ActiveSession[]>(KEYS.sessions, []);

/** Find a paused session whose tag-set exactly matches. */
export const getSessionForTags = (tags: string[]): ActiveSession | null => {
  const key = [...tags].sort().join(',');
  return (
    getSessions().find((s) => [...s.tags].sort().join(',') === key) ?? null
  );
};

/**
 * Save / update a session.
 * - If a session with the same id already exists → update it in-place.
 * - Otherwise prepend to the stack; if it would exceed MAX_SESSIONS, drop the
 *   oldest (last) entry first (FIFO).
 */
export const upsertSession = (session: ActiveSession): void => {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
    write(KEYS.sessions, sessions);
  } else {
    const next = [session, ...sessions].slice(0, MAX_SESSIONS);
    write(KEYS.sessions, next);
  }
};

/** Remove a single session by id. Card progress is unaffected. */
export const removeSession = (id: string): void => {
  write(
    KEYS.sessions,
    getSessions().filter((s) => s.id !== id)
  );
};

export const clearAllSessions = (): void => remove(KEYS.sessions);

// ── History ─────────────────────────────────────────────────────────────────

export const getHistory = (): SessionHistory =>
  read<SessionHistory>(KEYS.history, { sessions: [] });

export const appendSessionToHistory = (
  record: SessionHistory['sessions'][number]
): void => {
  const history = getHistory();
  history.sessions.unshift(record);
  history.sessions = history.sessions.slice(0, 100);
  write(KEYS.history, history);
};

// ── Preferences ─────────────────────────────────────────────────────────────

const DEFAULT_PREFS: UserPrefs = { resumeSessionOnRefresh: true };

export const getPrefs = (): UserPrefs =>
  read<UserPrefs>(KEYS.prefs, DEFAULT_PREFS);

export const savePrefs = (prefs: UserPrefs): void => write(KEYS.prefs, prefs);
