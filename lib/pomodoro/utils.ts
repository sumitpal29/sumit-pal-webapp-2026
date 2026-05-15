import type { ActiveSession, PomodoroPrefs, PomodoroRecord, SessionTask, TimerMode } from './types';

// ── formatting ────────────────────────────────────────────────────────────────

export function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatFocusTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDateLabel(dateKey: string): string {
  const today     = todayKey();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  if (dateKey === today)     return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  return new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── history stats ─────────────────────────────────────────────────────────────

export function calcStreak(records: PomodoroRecord[]): number {
  if (records.length === 0) return 0;
  const today     = todayKey();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  const uniqueDates = [...new Set(records.map(r => r.date))].sort().reverse();
  // Streak starts only if user worked today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const curr = new Date(uniqueDates[i]     + 'T00:00:00');
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export interface TodayStats {
  pomodoros   : number;
  focusSeconds: number;
}

export function calcTodayStats(records: PomodoroRecord[], session: ActiveSession | null): TodayStats {
  const today    = todayKey();
  const recs     = records.filter(r => r.date === today);
  const pomodoros   = recs.length + (session?.pomodorosTotal ?? 0);
  const focusSeconds = recs.reduce((s, r) => s + r.focusSeconds, 0);
  return { pomodoros, focusSeconds };
}

// ── timer logic ───────────────────────────────────────────────────────────────

export function getModeDuration(mode: TimerMode, prefs: PomodoroPrefs): number {
  switch (mode) {
    case 'focus':       return prefs.focusDuration;
    case 'short-break': return prefs.shortBreakDuration;
    case 'long-break':  return prefs.longBreakDuration;
  }
}

export function getActiveTask(tasks: SessionTask[]): SessionTask | undefined {
  return tasks.find(t => !t.done);
}

/** Pure: advance mode after timer hits 0, returns next session state. */
export function advanceMode(session: ActiveSession, prefs: PomodoroPrefs): ActiveSession {
  if (session.mode === 'focus') {
    const newCycle    = session.pomodorosThisCycle + 1;
    const isLongBreak = newCycle >= prefs.longBreakInterval;
    const nextMode: TimerMode = isLongBreak ? 'long-break' : 'short-break';
    const duration    = isLongBreak ? prefs.longBreakDuration : prefs.shortBreakDuration;

    // Credit one pomodoro to the active task
    const activeIdx = session.tasks.findIndex(t => !t.done);
    const tasks = session.tasks.map((t, i) =>
      i === activeIdx ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
    );

    return {
      ...session,
      mode               : nextMode,
      secondsLeft        : duration,
      pomodorosThisCycle : isLongBreak ? 0 : newCycle,
      pomodorosTotal     : session.pomodorosTotal + 1,
      status             : prefs.autoStartBreak ? 'running' : 'idle',
      tasks,
    };
  } else {
    return {
      ...session,
      mode       : 'focus',
      secondsLeft: prefs.focusDuration,
      status     : prefs.autoStartFocus ? 'running' : 'idle',
    };
  }
}

/** Reconstruct session state after the user was away (page hidden / tab switch). */
export function fastForward(
  session : ActiveSession,
  prefs   : PomodoroPrefs,
  elapsed : number,           // seconds
): ActiveSession {
  let s = { ...session };
  let remaining = Math.floor(elapsed);

  while (remaining > 0 && s.status === 'running') {
    if (remaining < s.secondsLeft) {
      return { ...s, secondsLeft: s.secondsLeft - remaining };
    }
    remaining -= s.secondsLeft;
    s = advanceMode(s, prefs);
  }
  return s;
}

export function makeDefaultSession(prefs: PomodoroPrefs): ActiveSession {
  return {
    mode               : 'focus',
    status             : 'idle',
    secondsLeft        : prefs.focusDuration,
    pomodorosThisCycle : 0,
    pomodorosTotal     : 0,
    tasks              : [],
    startedAt          : Date.now(),
    notes              : '',
  };
}
