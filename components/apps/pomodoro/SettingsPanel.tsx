'use client';

import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { PomodoroPrefs } from '@/lib/pomodoro/types';

interface Props {
  prefs   : PomodoroPrefs;
  onUpdate: (updates: Partial<PomodoroPrefs>) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function MinSlider({
  seconds,
  min, max,
  onChange,
}: { seconds: number; min: number; max: number; onChange: (s: number) => void }) {
  const mins = Math.round(seconds / 60);
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Slider
        min={min} max={max} step={1}
        value={[mins]}
        onValueChange={([v]) => onChange(v * 60)}
        className="flex-1"
      />
      <span className="text-[11px] font-mono text-muted-foreground w-8 text-right shrink-0">
        {mins}m
      </span>
    </div>
  );
}

export function SettingsPanel({ prefs, onUpdate }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none"
          title="Settings"
        >
          <Settings size={16} strokeWidth={1.8} />
        </button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-72 p-5 rounded-2xl shadow-xl space-y-5">

        {/* Durations */}
        <section className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Durations</p>
          <Row label="Focus">
            <MinSlider seconds={prefs.focusDuration} min={5} max={90}
              onChange={s => onUpdate({ focusDuration: s })} />
          </Row>
          <Row label="Short break">
            <MinSlider seconds={prefs.shortBreakDuration} min={1} max={30}
              onChange={s => onUpdate({ shortBreakDuration: s })} />
          </Row>
          <Row label="Long break">
            <MinSlider seconds={prefs.longBreakDuration} min={5} max={60}
              onChange={s => onUpdate({ longBreakDuration: s })} />
          </Row>
          <Row label="Long break every">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Slider min={2} max={8} step={1}
                value={[prefs.longBreakInterval]}
                onValueChange={([v]) => onUpdate({ longBreakInterval: v })}
                className="flex-1" />
              <span className="text-[11px] font-mono text-muted-foreground w-8 text-right shrink-0">
                ×{prefs.longBreakInterval}
              </span>
            </div>
          </Row>
        </section>

        <div className="h-px bg-border" />

        {/* Behaviour */}
        <section className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Behaviour</p>
          <Row label="Auto-start breaks">
            <Switch checked={prefs.autoStartBreak}
              onCheckedChange={v => onUpdate({ autoStartBreak: v })} />
          </Row>
          <Row label="Auto-start focus">
            <Switch checked={prefs.autoStartFocus}
              onCheckedChange={v => onUpdate({ autoStartFocus: v })} />
          </Row>
        </section>

        <div className="h-px bg-border" />

        {/* Sound */}
        <section className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Sound</p>
          <Row label="Sound">
            <Switch checked={prefs.soundEnabled}
              onCheckedChange={v => onUpdate({ soundEnabled: v })} />
          </Row>
          {prefs.soundEnabled && (
            <Row label="Volume">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Slider min={0} max={1} step={0.05}
                  value={[prefs.soundVolume]}
                  onValueChange={([v]) => onUpdate({ soundVolume: v })}
                  className="flex-1" />
                <span className="text-[11px] font-mono text-muted-foreground w-8 text-right shrink-0">
                  {Math.round(prefs.soundVolume * 100)}%
                </span>
              </div>
            </Row>
          )}
          <Row label="Tick during focus">
            <Switch checked={prefs.tickEnabled}
              onCheckedChange={v => onUpdate({ tickEnabled: v })} />
          </Row>
        </section>

        <div className="h-px bg-border" />

        {/* Keyboard shortcuts */}
        <section className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Shortcuts</p>
          {[
            ['Space', 'Play / Pause'],
            ['N',     'Skip interval'],
            ['R',     'Reset timer'],
            ['T',     'Focus task input'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{desc}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-foreground border border-border">{key}</kbd>
            </div>
          ))}
        </section>

      </PopoverContent>
    </Popover>
  );
}
