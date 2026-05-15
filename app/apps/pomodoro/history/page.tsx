'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadHistory } from '@/lib/pomodoro/storage';
import { calcStreak, formatDateLabel, formatFocusTime } from '@/lib/pomodoro/utils';

// ── All-time stats ─────────────────────────────────────────────────────────

function AllTimeStats({ pomodoros, focusSeconds, streak }: { pomodoros: number; focusSeconds: number; streak: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: '🍅', value: String(pomodoros), label: 'total' },
        { icon: '⏱',  value: focusSeconds > 0 ? formatFocusTime(focusSeconds) : '—', label: 'focused' },
        { icon: '🔥',  value: streak > 0 ? `${streak}d` : '—', label: 'streak' },
      ].map(({ icon, value, label }) => (
        <div key={label} className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-card border border-border">
          <span className="text-xl">{icon}</span>
          <span className="text-xl font-bold font-mono text-foreground">{value}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Day group ──────────────────────────────────────────────────────────────

interface DayGroup {
  dateKey     : string;
  pomodoros   : number;
  focusSeconds: number;
  taskLabels  : string[];
}

export default function PomodoroHistoryPage() {
  const history = useMemo(() => loadHistory(), []);

  const { groups, allPomodoros, allFocusSeconds } = useMemo(() => {
    const map = new Map<string, DayGroup>();

    for (const rec of history) {
      let g = map.get(rec.date);
      if (!g) {
        g = { dateKey: rec.date, pomodoros: 0, focusSeconds: 0, taskLabels: [] };
        map.set(rec.date, g);
      }
      g.pomodoros    += 1;
      g.focusSeconds += rec.focusSeconds;
      for (const t of rec.taskSnapshot) {
        if (t.done && !g.taskLabels.includes(t.label)) g.taskLabels.push(t.label);
      }
    }

    const groups = [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    const allPomodoros    = history.length;
    const allFocusSeconds = history.reduce((s, r) => s + r.focusSeconds, 0);
    return { groups, allPomodoros, allFocusSeconds };
  }, [history]);

  const streak = useMemo(() => calcStreak(history), [history]);

  return (
    <main className="max-w-sm mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/apps/pomodoro">
          <button type="button"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">your focus record</p>
        </div>
      </div>

      {/* All-time stats */}
      <AllTimeStats pomodoros={allPomodoros} focusSeconds={allFocusSeconds} streak={streak} />

      {/* Day groups */}
      {groups.length === 0 ? (
        <div className="text-center py-16 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">No sessions yet.</p>
          <p className="text-xs text-muted-foreground/50">Complete a focus interval to see it here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(g => (
            <section key={g.dateKey}>
              {/* Date divider */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
                  {formatDateLabel(g.dateKey)}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground/50 whitespace-nowrap">
                  🍅 {g.pomodoros} · {formatFocusTime(g.focusSeconds)}
                </span>
              </div>

              {/* Pomodoro dots for the day */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Array.from({ length: g.pomodoros }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-full bg-primary"
                    style={{ width: 10, height: 10, opacity: 0.85 }}
                  />
                ))}
              </div>

              {/* Tasks completed that day */}
              {g.taskLabels.length > 0 && (
                <div className="flex flex-col gap-1">
                  {g.taskLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-primary">✓</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

    </main>
  );
}
