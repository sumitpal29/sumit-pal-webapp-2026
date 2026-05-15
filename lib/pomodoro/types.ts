export type TimerMode   = 'focus' | 'short-break' | 'long-break';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface SessionTask {
  id: string;
  label: string;
  estimatedPomodoros: number;   // default 1
  completedPomodoros: number;
  done: boolean;
  brainDumpRef?: string;        // future Brain Dump integration hook
}

export interface ActiveSession {
  mode: TimerMode;
  status: TimerStatus;
  secondsLeft: number;
  pomodorosThisCycle: number;   // position within current cycle (0 … longBreakInterval-1)
  pomodorosTotal: number;       // pomodoros completed since this session object was created
  tasks: SessionTask[];
  startedAt: number;            // epoch ms
  notes: string;
}

/** One record per completed focus interval */
export interface PomodoroRecord {
  id: string;
  date: string;                 // 'YYYY-MM-DD' — for grouping in history
  completedAt: number;          // epoch ms
  focusSeconds: number;         // duration of this interval (from prefs at the time)
  taskSnapshot: { label: string; done: boolean }[];
}

export interface PomodoroPrefs {
  focusDuration: number;        // seconds  (default 1500 = 25 min)
  shortBreakDuration: number;   // seconds  (default 300  =  5 min)
  longBreakDuration: number;    // seconds  (default 900  = 15 min)
  longBreakInterval: number;    // pomodoros before long break (default 4)
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  soundVolume: number;          // 0 – 1
  tickEnabled: boolean;
}
