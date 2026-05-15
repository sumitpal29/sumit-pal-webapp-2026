'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { toast } from 'sonner';

import { TimerRing }     from '@/components/apps/pomodoro/TimerRing';
import { ModeDotsBar }   from '@/components/apps/pomodoro/ModeDotsBar';
import { TimerControls } from '@/components/apps/pomodoro/TimerControls';
import { TaskList }      from '@/components/apps/pomodoro/TaskList';
import { StatsBar }      from '@/components/apps/pomodoro/StatsBar';
import { SettingsPanel } from '@/components/apps/pomodoro/SettingsPanel';

import {
  loadSession, saveSession,
  loadHistory, addToHistory,
  loadPrefs, savePrefs,
} from '@/lib/pomodoro/storage';
import {
  advanceMode, fastForward, getModeDuration,
  makeDefaultSession, calcStreak, calcTodayStats, todayKey,
} from '@/lib/pomodoro/utils';
import { playChime, playTick } from '@/lib/pomodoro/sounds';
import type { ActiveSession, PomodoroPrefs, PomodoroRecord, SessionTask } from '@/lib/pomodoro/types';

// ─────────────────────────────────────────────────────────────────────────────

export default function PomodoroPage() {
  const [hydrated, setHydrated] = useState(false);
  const [prefs,    setPrefs]    = useState<PomodoroPrefs | null>(null);
  const [session,  setSession]  = useState<ActiveSession | null>(null);

  // Stable refs for inside setInterval / event handlers
  const prefsRef    = useRef<PomodoroPrefs | null>(null);
  const sessionRef  = useRef<ActiveSession | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskInputRef = useRef<HTMLInputElement | null>(null);
  // Side-effect queue for timer completions (runs after setState, avoids setState-inside-setState)
  const sideEffectRef = useRef<(() => void) | null>(null);

  prefsRef.current   = prefs;
  sessionRef.current = session;

  // ── bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const p = loadPrefs();
    const saved = loadSession();

    let s: ActiveSession;
    if (saved) {
      // Fast-forward if we were running while the tab was hidden / reloaded
      if (saved.status === 'running') {
        const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
        s = fastForward(saved, p, elapsed);
        s = { ...s, startedAt: Date.now() }; // reset anchor
      } else {
        s = saved;
      }
    } else {
      s = makeDefaultSession(p);
    }

    setPrefs(p);
    setSession(s);
    setHydrated(true);
  }, []);

  // ── persist on every session change ───────────────────────────────────────
  useEffect(() => {
    if (hydrated && session) saveSession(session);
  }, [session, hydrated]);

  // ── start / stop the 1-second interval ────────────────────────────────────
  const startInterval = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const p = prefsRef.current;
      if (!p) return;

      setSession(prev => {
        if (!prev || prev.status !== 'running') return prev;

        // Tick sound
        if (prev.mode === 'focus' && p.tickEnabled) {
          playTick(p.soundVolume * 0.25);
        }

        if (prev.secondsLeft > 1) {
          return { ...prev, secondsLeft: prev.secondsLeft - 1, startedAt: Date.now() };
        }

        // ── timer hit 0 ──────────────────────────────────────────────────────
        const wasMode  = prev.mode;
        const wasTasks = prev.tasks;
        const wasDuration = getModeDuration(prev.mode, p);
        const next = advanceMode(prev, p);

        // Schedule side effects to run after the setState flushes
        sideEffectRef.current = () => {
          if (p.soundEnabled) playChime(p.soundVolume);

          if (wasMode === 'focus') {
            const record: PomodoroRecord = {
              id          : crypto.randomUUID(),
              date        : todayKey(),
              completedAt : Date.now(),
              focusSeconds: wasDuration,
              taskSnapshot: wasTasks.map(t => ({ label: t.label, done: t.done })),
            };
            addToHistory(record);

            const modeLabel = next.mode === 'long-break' ? 'Long break' : 'Short break';
            toast.success(`Pomodoro complete! 🍅 ${modeLabel} starting${p.autoStartBreak ? '…' : '.'}`, {
              duration: 4000,
            });
          } else {
            toast(`${next.mode === 'focus' ? 'Focus time' : 'Break'} ${p.autoStartFocus ? 'starting…' : 'up!'}`, {
              duration: 3000,
            });
          }
        };

        return next;
      });

      // Flush side effects
      if (sideEffectRef.current) {
        const fn = sideEffectRef.current;
        sideEffectRef.current = null;
        fn();
      }
    }, 1000);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-manage interval based on session status
  useEffect(() => {
    if (!session) return;
    if (session.status === 'running') {
      startInterval();
    } else {
      stopInterval();
    }
  }, [session?.status, startInterval, stopInterval]);

  // Cleanup on unmount
  useEffect(() => () => stopInterval(), [stopInterval]);

  // ── keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlayPause(); break;
        case 'KeyN' : skipToNext();   break;
        case 'KeyR' : resetTimer();   break;
        case 'KeyT' : e.preventDefault(); taskInputRef.current?.focus(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── actions ───────────────────────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status   : prev.status === 'running' ? 'paused' : 'running',
        startedAt: Date.now(),
      };
    });
  }, []);

  const skipToNext = useCallback(() => {
    const p = prefsRef.current;
    if (!p) return;
    setSession(prev => {
      if (!prev) return prev;
      const next = advanceMode({ ...prev, secondsLeft: 0 }, p);
      return { ...next, status: 'idle' };
    });
  }, []);

  const resetTimer = useCallback(() => {
    const p = prefsRef.current;
    if (!p) return;
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, status: 'idle', secondsLeft: getModeDuration(prev.mode, p), startedAt: Date.now() };
    });
  }, []);

  const updatePrefs = useCallback((updates: Partial<PomodoroPrefs>) => {
    setPrefs(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      savePrefs(next);
      return next;
    });
  }, []);

  // Task actions
  const addTask = useCallback((label: string) => {
    const task: SessionTask = {
      id: crypto.randomUUID(), label,
      estimatedPomodoros: 1, completedPomodoros: 0, done: false,
    };
    setSession(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setSession(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== id) } : prev);
  }, []);

  const bumpEstimate = useCallback((id: string) => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === id ? { ...t, estimatedPomodoros: (t.estimatedPomodoros % 8) + 1 } : t
        ),
      };
    });
  }, []);

  // ── derived stats ─────────────────────────────────────────────────────────
  const history   = hydrated ? loadHistory()                    : [];
  const streak    = hydrated ? calcStreak(history)              : 0;
  const todayStats = hydrated ? calcTodayStats(history, session) : { pomodoros: 0, focusSeconds: 0 };

  // ── render skeleton while hydrating ──────────────────────────────────────
  if (!hydrated || !session || !prefs) {
    return (
      <main className="max-w-5xl mx-auto px-10 py-10 flex flex-col gap-8">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-12 items-start">
          <div className="flex flex-col items-center gap-6 w-80 shrink-0">
            <div className="rounded-full bg-muted animate-pulse" style={{ width: 272, height: 272 }} />
            <div className="flex justify-center gap-6">
              {[36, 60, 36].map((s, i) => (
                <div key={i} className="rounded-full bg-muted animate-pulse" style={{ width: s, height: s }} />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-3 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const totalDuration = getModeDuration(session.mode, prefs);

  return (
    <main className="max-w-5xl mx-auto px-10 py-10 flex flex-col gap-10">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pomodoro</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">stay in the zone</p>
        </div>
        <div className="flex items-center gap-1">
          <SettingsPanel prefs={prefs} onUpdate={updatePrefs} />
          <Link href="/apps/pomodoro/history">
            <button
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="History"
            >
              <History size={16} strokeWidth={1.8} />
            </button>
          </Link>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex gap-12 items-start">

        {/* ── Left: timer panel ── */}
        <div className="flex flex-col items-center gap-7 w-80 shrink-0">
          <ModeDotsBar completed={session.pomodorosThisCycle} total={prefs.longBreakInterval} />

          <TimerRing
            secondsLeft={session.secondsLeft}
            totalDuration={totalDuration}
            mode={session.mode}
            status={session.status}
          />

          <TimerControls
            status={session.status}
            onPlayPause={togglePlayPause}
            onSkip={skipToNext}
            onReset={resetTimer}
          />

          {/* Stats — sits below controls on the left */}
          <div className="w-full pt-2 border-t border-border">
            <StatsBar
              pomodoros={todayStats.pomodoros}
              focusSeconds={todayStats.focusSeconds}
              streak={streak}
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border self-stretch shrink-0" />

        {/* ── Right: task panel ── */}
        <div className="flex-1 min-w-0 pt-1">
          <TaskList
            tasks={session.tasks}
            inputRef={taskInputRef}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onBumpEstimate={bumpEstimate}
          />
        </div>

      </div>
    </main>
  );
}
