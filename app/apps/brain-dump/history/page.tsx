'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getThoughts, updateThought, deleteThought, getTagMap } from '@/lib/brain-dump/storage';
import type { Thought, Tag } from '@/lib/brain-dump/types';
import { HistoryList } from '@/components/apps/brain-dump/HistoryList';
import { TagFilterBar } from '@/components/apps/brain-dump/TagFilterBar';
import { getTags } from '@/lib/brain-dump/storage';

export default function BrainDumpHistoryPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const loadAll = useCallback(() => {
    setThoughts(getThoughts());
    setTags(getTags());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  const handleRestore = (id: string) => {
    updateThought(id, { status: 'open' });
    loadAll();
  };

  const handleDelete = (id: string) => {
    deleteThought(id);
    loadAll();
  };

  const filtered = thoughts.filter((t) => {
    const matchesTags = activeTagIds.length === 0 || t.tags.some((id) => activeTagIds.includes(id));
    const matchesSearch = !search || t.text.toLowerCase().includes(search.toLowerCase());
    return matchesTags && matchesSearch;
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/apps/brain-dump"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft size={13} />
            Back
          </Link>
          <h1 className="text-xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {thoughts.length > 0 && (
        <TagFilterBar
          tags={tags}
          activeTagIds={activeTagIds}
          search={search}
          onToggleTag={(id) =>
            setActiveTagIds((prev) =>
              prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
            )
          }
          onSearch={setSearch}
        />
      )}

      <HistoryList
        thoughts={filtered}
        tagMap={tagMap}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />
    </main>
  );
}
