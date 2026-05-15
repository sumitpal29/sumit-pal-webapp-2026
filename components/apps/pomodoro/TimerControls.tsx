'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import type { TimerStatus } from '@/lib/pomodoro/types';

interface Props {
  status     : TimerStatus;
  onPlayPause: () => void;
  onSkip     : () => void;
  onReset    : () => void;
}

const iconBtn =
  'flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors focus:outline-none';

export function TimerControls({ status, onPlayPause, onSkip, onReset }: Props) {
  const isRunning = status === 'running';

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Reset */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={onReset}
        className={iconBtn}
        style={{ width: 36, height: 36 }}
        title="Reset (R)"
        aria-label="Reset timer"
      >
        <RotateCcw size={17} strokeWidth={1.8} />
      </motion.button>

      {/* Play / Pause — primary button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        onClick={onPlayPause}
        className="flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 focus:outline-none"
        style={{ width: 60, height: 60 }}
        title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
        aria-label={isRunning ? 'Pause' : 'Start'}
      >
        <motion.div
          key={isRunning ? 'pause' : 'play'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {isRunning ? <Pause size={22} strokeWidth={2} /> : <Play size={22} strokeWidth={2} className="ml-0.5" />}
        </motion.div>
      </motion.button>

      {/* Skip */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={onSkip}
        className={iconBtn}
        style={{ width: 36, height: 36 }}
        title="Skip (N)"
        aria-label="Skip to next interval"
      >
        <SkipForward size={17} strokeWidth={1.8} />
      </motion.button>
    </div>
  );
}
