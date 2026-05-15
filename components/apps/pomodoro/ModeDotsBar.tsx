'use client';

import { motion } from 'framer-motion';

interface Props {
  /** How many pomodoros completed in the current cycle (0-based) */
  completed: number;
  /** Total pomodoros before a long break */
  total    : number;
}

export function ModeDotsBar({ completed, total }: Props) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${completed} of ${total} pomodoros`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundColor: i < completed ? 'var(--primary)' : 'var(--border)',
            scale           : i < completed ? 1.15 : 1,
          }}
          transition={{ duration: 0.35 }}
          className="rounded-full"
          style={{ width: 8, height: 8 }}
        />
      ))}
    </div>
  );
}
