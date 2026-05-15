'use client';

import { Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface WindControlProps {
  isWindy: boolean;
  enabled: boolean;
  sensitivity: number;           // 0.25 – 2.0
  onToggle: (v: boolean) => void;
  onSensitivity: (v: number) => void;
}

const SENSITIVITY_LABELS: Record<number, string> = {
  0.25: 'barely',
  0.5: 'gentle',
  1.0: 'normal',
  1.5: 'breezy',
  2.0: 'stormy',
};

function sensitivityLabel(v: number) {
  const snapped = [0.25, 0.5, 1.0, 1.5, 2.0].reduce((prev, curr) =>
    Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
  );
  return SENSITIVITY_LABELS[snapped] ?? '';
}

export function WindControl({ isWindy, enabled, sensitivity, onToggle, onSensitivity }: WindControlProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono tracking-wider transition-colors hover:bg-muted/60 focus:outline-none"
          style={{ color: 'var(--muted-foreground)', opacity: enabled && isWindy ? 0.75 : 0.38 }}
          title="Wind settings"
        >
          <AnimatePresence mode="wait">
            {enabled && isWindy ? (
              <motion.span
                key="blowing"
                animate={{ x: [-1, 2, -1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              >
                <Wind size={12} />
              </motion.span>
            ) : (
              <Wind size={12} key="still" />
            )}
          </AnimatePresence>
          <span>wind</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-56 p-4 rounded-xl shadow-xl"
        sideOffset={6}
      >
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Wind</span>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label="Toggle wind"
            />
          </div>

          {/* Sensitivity slider — only shown when wind is on */}
          <AnimatePresence>
            {enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sensitivity</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70 w-12 text-right">
                    {sensitivityLabel(sensitivity)}
                  </span>
                </div>
                <Slider
                  min={0.25}
                  max={2.0}
                  step={0.25}
                  value={[sensitivity]}
                  onValueChange={([v]) => onSensitivity(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50">
                  <span>calm</span>
                  <span>stormy</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}
