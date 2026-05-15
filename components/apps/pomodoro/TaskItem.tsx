'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { SessionTask } from '@/lib/pomodoro/types';

interface Props {
  task    : SessionTask;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onBump  : () => void;   // increment estimatedPomodoros
}

export function TaskItem({ task, isActive, onToggle, onDelete, onBump }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: task.done ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.25 } }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
        isActive && !task.done
          ? 'bg-primary/10 border border-primary/25'
          : 'hover:bg-muted/60'
      }`}
    >
      {/* Circle toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded-full border-2 transition-all focus:outline-none"
        style={{
          width          : 18,
          height         : 18,
          borderColor    : task.done ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--border)',
          backgroundColor: task.done ? 'var(--primary)' : 'transparent',
        }}
        aria-label={task.done ? 'Mark undone' : 'Mark done'}
      >
        {task.done && (
          <svg viewBox="0 0 10 10" fill="none" className="w-full h-full p-0.5">
            <path d="M2 5l2.5 2.5L8 3" stroke="var(--primary-foreground)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Label */}
      <span
        className={`flex-1 text-sm leading-snug ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
      >
        {task.label}
      </span>

      {/* Pomodoro estimate pill — click to cycle */}
      <button
        type="button"
        onClick={onBump}
        className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono transition-colors hover:bg-primary/15 focus:outline-none"
        style={{ color: 'var(--muted-foreground)' }}
        title="Click to adjust estimate"
      >
        <span>🍅</span>
        <span>{task.estimatedPomodoros}</span>
      </button>

      {/* Delete — hover only */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            type="button"
            onClick={onDelete}
            className="shrink-0 p-0.5 rounded text-muted-foreground/60 hover:text-destructive transition-colors focus:outline-none"
            aria-label="Delete task"
          >
            <X size={13} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
