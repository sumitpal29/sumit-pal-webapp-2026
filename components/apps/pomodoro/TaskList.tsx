'use client';

import { useState, useRef, type RefObject } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { SessionTask } from '@/lib/pomodoro/types';

interface Props {
  tasks          : SessionTask[];
  inputRef?      : RefObject<HTMLInputElement | null>;
  onAdd          : (label: string) => void;
  onToggle       : (id: string) => void;
  onDelete       : (id: string) => void;
  onBumpEstimate : (id: string) => void;
}

export function TaskList({ tasks, inputRef, onAdd, onToggle, onDelete, onBumpEstimate }: Props) {
  const [draft, setDraft] = useState('');
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  const commit = () => {
    const label = draft.trim();
    if (label) { onAdd(label); setDraft(''); }
  };

  const activeIdx = tasks.findIndex(t => !t.done);

  // Sort: undone tasks first, done tasks at bottom
  const sorted = [
    ...tasks.filter(t => !t.done),
    ...tasks.filter(t =>  t.done),
  ];

  return (
    <div className="flex flex-col gap-1">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground/60">
          Tasks
        </span>
        <div className="flex-1 h-px bg-border" />
        {tasks.length > 0 && (
          <span className="text-[10px] font-mono text-muted-foreground/50">
            {tasks.filter(t => t.done).length}/{tasks.length}
          </span>
        )}
      </div>

      {/* Task rows */}
      <AnimatePresence initial={false}>
        {sorted.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isActive={tasks.indexOf(task) === activeIdx}
            onToggle={() => onToggle(task.id)}
            onDelete={() => onDelete(task.id)}
            onBump={() => onBumpEstimate(task.id)}
          />
        ))}
      </AnimatePresence>

      {/* Add task input */}
      <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl border border-dashed border-border/60 hover:border-border transition-colors focus-within:border-primary/40 focus-within:bg-muted/30">
        <Plus size={14} className="text-muted-foreground/50 shrink-0" />
        <input
          ref={ref}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') setDraft('');
          }}
          placeholder="What are you working on?  ↵"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
      </div>
    </div>
  );
}
