'use client';

import { formatFocusTime } from '@/lib/pomodoro/utils';

interface Props {
  pomodoros   : number;
  focusSeconds: number;
  streak      : number;
}

export function StatsBar({ pomodoros, focusSeconds, streak }: Props) {
  return (
    <div className="w-full flex flex-col gap-3">
      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/60">
        Today
      </span>
      <div className="flex items-center justify-between">
        <Stat icon="🍅" value={String(pomodoros)} label="done" />
        <Stat icon="⏱" value={focusSeconds > 0 ? formatFocusTime(focusSeconds) : '—'} label="focused" />
        <Stat icon="🔥" value={streak > 0 ? `${streak}d` : '—'} label="streak" />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-xs">
        <span>{icon}</span>
        <span className="font-mono font-semibold text-foreground">{value}</span>
      </div>
      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">{label}</span>
    </div>
  );
}
