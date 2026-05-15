'use client';

import { useRouter } from 'next/navigation';
import { Trophy, RotateCcw, Tags, History } from 'lucide-react';
import type { SessionRecord } from '@/lib/recall-cards/types';

interface Props {
  record: SessionRecord;
}

const RATING_LABELS: Record<number, string> = { 1: 'Blank', 2: 'Wrong', 3: 'Hard', 4: 'Good', 5: 'Easy' };
const RATING_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

export function SessionSummary({ record }: Props) {
  const router = useRouter();
  const tagParam = record.tags.join(',');
  const durationMin = Math.max(1, Math.round(record.durationSeconds / 60));

  const ratingEntries = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: record.ratingBreakdown[r] ?? 0,
  }));
  const maxCount = Math.max(1, ...ratingEntries.map((e) => e.count));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="text-center">
        <Trophy size={36} className="mx-auto text-yellow-500 mb-3" />
        <h2 className="text-xl font-bold text-foreground">Session complete</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {durationMin} min · {record.tags.join(', ')}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Cards" value={record.cardsReviewed} />
        <Stat label="Avg rating" value={record.avgRating.toFixed(1)} />
        <Stat
          label="To revisit"
          value={(record.ratingBreakdown[1] ?? 0) + (record.ratingBreakdown[2] ?? 0)}
        />
      </div>

      {/* Rating distribution */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground">Rating breakdown</p>
        {ratingEntries.map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-12 shrink-0">
              {rating} · {RATING_LABELS[rating]}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${RATING_COLORS[rating]}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-4 text-right">{count}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push(`/apps/recall-cards/session?tags=${tagParam}`)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCcw size={14} />
          Study again
        </button>
        <button
          onClick={() => router.push('/apps/recall-cards')}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Tags size={14} />
          Change topics
        </button>
        <button
          onClick={() => router.push('/apps/recall-cards/history')}
          className="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <History size={12} />
          View history
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
