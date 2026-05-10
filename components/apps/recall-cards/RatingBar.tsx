'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const RATINGS = [
  { value: 1, label: 'Blank', color: 'hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400' },
  { value: 2, label: 'Wrong', color: 'hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-400' },
  { value: 3, label: 'Hard', color: 'hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-400' },
  { value: 4, label: 'Good', color: 'hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400' },
  { value: 5, label: 'Easy', color: 'hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400' },
] as const;

interface Props {
  onRate: (rating: number) => void;
}

export function RatingBar({ onRate }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 5) onRate(n);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRate]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground text-center">
        How well did you know this?
        <span className="ml-2 opacity-50">(or press 1–5)</span>
      </p>
      <div className="grid grid-cols-5 gap-2">
        {RATINGS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onRate(value)}
            className={cn(
              'flex flex-col items-center gap-1 py-3 rounded-xl border border-border',
              'bg-card text-muted-foreground transition-all duration-150',
              color
            )}
          >
            <span className="text-base font-bold">{value}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
