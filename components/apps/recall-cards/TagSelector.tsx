'use client';

import { cn } from '@/lib/utils';
import type { TagMap } from '@/lib/recall-cards/types';

interface Props {
  tagMap: TagMap;
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagSelector({ tagMap, selected, onToggle }: Props) {
  const suggested = getSuggestions(tagMap, selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(tagMap).map(([key, entry]) => {
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-150',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
            >
              {entry.label}
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded',
                  isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                )}
              >
                {entry.cardCount}
              </span>
            </button>
          );
        })}
      </div>

      {suggested.length > 0 && selected.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Also try:</span>
          {suggested.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              + {tagMap[tag]?.label ?? tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getSuggestions(tagMap: TagMap, selected: string[]): string[] {
  if (selected.length === 0) return [];
  const suggestions = new Set<string>();
  for (const tag of selected) {
    for (const rel of tagMap[tag]?.related ?? []) {
      if (!selected.includes(rel) && tagMap[rel]) suggestions.add(rel);
    }
  }
  return Array.from(suggestions).slice(0, 4);
}
