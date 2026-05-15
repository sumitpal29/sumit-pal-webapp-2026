import type { ActiveSession, PomodoroRecord, PomodoroPrefs } from './types';

const KEYS = {
  session : 'pomodoro-v1-session',
  history : 'pomodoro-v1-history',
  prefs   : 'pomodoro-v1-prefs',
} as const;

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── session ───────────────────────────────────────────────────────────────────

export function loadSession(): ActiveSession | null {
  return read<ActiveSession>(KEYS.session);
}

export function saveSession(session: ActiveSession): void {
  write(KEYS.session, session);
}

export function clearSession(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.session);
}

// ── history ───────────────────────────────────────────────────────────────────

export function loadHistory(): PomodoroRecord[] {
  return read<PomodoroRecord[]>(KEYS.history) ?? [];
}

export function addToHistory(record: PomodoroRecord): void {
  const history = loadHistory();
  write(KEYS.history, [record, ...history].slice(0, 365)); // keep ~1 year
}

// ── prefs ─────────────────────────────────────────────────────────────────────

const DEFAULT_PREFS: PomodoroPrefs = {
  focusDuration      : 1500,
  shortBreakDuration : 300,
  longBreakDuration  : 900,
  longBreakInterval  : 4,
  autoStartBreak     : false,
  autoStartFocus     : false,
  soundEnabled       : true,
  soundVolume        : 0.6,
  tickEnabled        : false,
};

export function loadPrefs(): PomodoroPrefs {
  const saved = read<Partial<PomodoroPrefs>>(KEYS.prefs);
  return { ...DEFAULT_PREFS, ...saved };
}

export function savePrefs(prefs: PomodoroPrefs): void {
  write(KEYS.prefs, prefs);
}
