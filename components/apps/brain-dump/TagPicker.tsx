'use client';

import { Plus } from 'lucide-react';
import type { Tag } from '@/lib/brain-dump/types';
import { TagBadge } from './TagBadge';

// The four system quadrant tag IDs — mutually exclusive within a thought.
export const QUADRANT_IDS = new Set(['q1-urgent', 'q2-scheduled', 'q3-delegate', 'q4-later']);

interface Props {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (newTagIds: string[]) => void;
  onManageTags?: () => void;
}

export function TagPicker({ tags, selectedTagIds, onChange, onManageTags }: Props) {
  const quadrantTags = tags.filter((t) => QUADRANT_IDS.has(t.id))
    .sort((a, b) => a.priority - b.priority);
  const customTags = tags.filter((t) => !QUADRANT_IDS.has(t.id))
    .sort((a, b) => a.label.localeCompare(b.label));

  const toggleQuadrant = (id: string) => {
    // Radio: selecting the active one deselects it; selecting another replaces it.
    const withoutQuadrants = selectedTagIds.filter((t) => !QUADRANT_IDS.has(t));
    if (selectedTagIds.includes(id)) {
      onChange(withoutQuadrants);
    } else {
      onChange([id, ...withoutQuadrants]);
    }
  };

  const toggleCustom = (id: string) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((t) => t !== id)
        : [...selectedTagIds, id]
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-border bg-card">
      {/* Quadrant — radio */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Priority
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quadrantTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="xs"
              active={selectedTagIds.includes(tag.id)}
              onClick={() => toggleQuadrant(tag.id)}
            />
          ))}
        </div>
      </div>

      {/* Custom — multi-select */}
      {customTags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Labels
          </span>
          <div className="flex flex-wrap gap-1.5">
            {customTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                size="xs"
                active={selectedTagIds.includes(tag.id)}
                onClick={() => toggleCustom(tag.id)}
              />
            ))}
          </div>
        </div>
      )}

      {onManageTags && (
        <button
          onClick={onManageTags}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <Plus size={11} />
          Manage tags
        </button>
      )}
    </div>
  );
}
