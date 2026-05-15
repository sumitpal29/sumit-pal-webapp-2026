'use client';

import { Search } from 'lucide-react';
import type { Tag } from '@/lib/brain-dump/types';
import { TagBadge } from './TagBadge';

interface Props {
  tags: Tag[];
  activeTagIds: string[];
  search: string;
  onToggleTag: (id: string) => void;
  onSearch: (q: string) => void;
}

export function TagFilterBar({ tags, activeTagIds, search, onToggleTag, onSearch }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {tags
          .sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label))
          .map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="xs"
              active={activeTagIds.length === 0 || activeTagIds.includes(tag.id)}
              onClick={() => onToggleTag(tag.id)}
            />
          ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search thoughts…"
          className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>
    </div>
  );
}
