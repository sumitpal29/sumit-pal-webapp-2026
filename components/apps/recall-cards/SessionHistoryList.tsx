'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SessionRecord } from '@/lib/recall-cards/types';

const RATING_LABELS: Record<number, string> = { 1: 'Blank', 2: 'Wrong', 3: 'Hard', 4: 'Good', 5: 'Easy' };
const RATING_COLORS: Record<number, string> = {
  1: 'text-red-400', 2: 'text-orange-400', 3: 'text-yellow-400',
  4: 'text-blue-400', 5: 'text-green-400',
};

interface Props {
  sessions: SessionRecord[];
}

export function SessionHistoryList({ sessions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        No sessions yet. Start studying to see your history here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => {
        const isOpen = expanded === session.id;
        const durationMin = Math.max(1, Math.round(session.durationSeconds / 60));
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        return (
          <div key={session.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : session.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {session.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dateStr} · {session.cardsReviewed} cards · {durationMin} min
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-base font-bold text-foreground">{session.avgRating.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">avg</p>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-3">Rating breakdown</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <div key={r} className="flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${RATING_COLORS[r]}`}>
                        {session.ratingBreakdown[r] ?? 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{RATING_LABELS[r]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
