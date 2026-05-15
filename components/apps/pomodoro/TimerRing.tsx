'use client';

import { motion } from 'framer-motion';
import type { TimerMode } from '@/lib/pomodoro/types';
import { formatTime } from '@/lib/pomodoro/utils';

interface Props {
  secondsLeft  : number;
  totalDuration: number;
  mode         : TimerMode;
  status       : 'idle' | 'running' | 'paused';
}

const SIZE        = 272;
const CX          = SIZE / 2;
const CY          = SIZE / 2;
const RADIUS      = 112;
const STROKE_W    = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const MODE_COLORS: Record<TimerMode, string> = {
  'focus'       : '#fad312',
  'short-break' : '#87ff8b',
  'long-break'  : '#c4b5fd',
};

const MODE_LABELS: Record<TimerMode, string> = {
  'focus'       : 'focus',
  'short-break' : 'short break',
  'long-break'  : 'long break',
};

export function TimerRing({ secondsLeft, totalDuration, mode, status }: Props) {
  const progress   = totalDuration > 0 ? secondsLeft / totalDuration : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const color      = MODE_COLORS[mode];
  const isPaused   = status === 'paused';

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring */}
        <circle
          cx={CX} cy={CY} r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE_W}
          opacity={0.6}
        />

        {/* Progress arc */}
        <motion.circle
          cx={CX} cy={CY} r={RADIUS}
          fill="none"
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ rotate: -90, transformOrigin: 'center', filter: 'url(#ring-glow)' }}
          animate={{
            strokeDashoffset: dashOffset,
            stroke           : color,
            opacity          : isPaused ? 0.5 : 1,
          }}
          transition={{
            strokeDashoffset: { duration: 1, ease: 'linear' },
            stroke          : { duration: 0.5 },
            opacity         : { duration: 0.3 },
          }}
        />
      </svg>

      {/* Centre text — layered over the SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
        <motion.span
          key={mode}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="font-mono font-bold text-foreground tabular-nums"
          style={{ fontSize: 54, lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          {formatTime(secondsLeft)}
        </motion.span>
        <motion.span
          key={`label-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[12px] font-mono uppercase tracking-widest"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {MODE_LABELS[mode]}
        </motion.span>
      </div>
    </div>
  );
}
