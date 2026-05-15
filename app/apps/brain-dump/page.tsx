'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { History, Tags } from 'lucide-react';
import { toast } from 'sonner';
import {
  getThoughts,
  addThought,
  updateThought,
  deleteThought,
  clearDoneThoughts,
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/lib/brain-dump/storage';
import type { Thought, Tag } from '@/lib/brain-dump/types';
import { BrainDumpInput } from '@/components/apps/brain-dump/BrainDumpInput';
import { PinnedSection } from '@/components/apps/brain-dump/PinnedSection';
import { BrainDumpList } from '@/components/apps/brain-dump/BrainDumpList';
import { TagFilterBar } from '@/components/apps/brain-dump/TagFilterBar';
import { TagManager } from '@/components/apps/brain-dump/TagManager';
import { ExportMenu } from '@/components/apps/brain-dump/ExportMenu';
import { Button } from '@/components/ui/button';

export default function BrainDumpPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [tagManagerOpen, setTagManagerOpen] = useState(false);

  const [hasDone, setHasDone] = useState(false);

  const loadAll = useCallback(() => {
    const all = getThoughts();
    setThoughts(all.filter((t) => t.status === 'open'));
    setHasDone(all.some((t) => t.status === 'done'));
    setTags(getTags());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  // ── Thought actions ──────────────────────────────────────────────────────

  const handleSave = (text: string, tagIds: string[]) => {
    addThought(text, tagIds);
    loadAll();
  };

  const handleDone = (id: string) => {
    updateThought(id, { status: 'done' });
    loadAll();
    toast.success('Moved to history', {
      action: { label: 'Undo', onClick: () => { updateThought(id, { status: 'open' }); loadAll(); } },
    });
  };

  const handleDelete = (id: string) => {
    deleteThought(id);
    loadAll();
    toast('Deleted');
  };

  const handleUpdate = (id: string, text: string, tagIds: string[]) => {
    updateThought(id, { text, tags: tagIds });
    loadAll();
  };

  const handleClearDone = () => {
    clearDoneThoughts();
    loadAll();
    toast.success('Cleared done items');
  };

  // ── Tag actions ──────────────────────────────────────────────────────────

  const handleCreateTag = (label: string) => {
    createTag(label);
    loadAll();
  };

  const handleRenameTag = (id: string, label: string) => {
    updateTag(id, label);
    loadAll();
  };

  const handleDeleteTag = (id: string) => {
    deleteTag(id);
    loadAll();
  };

  const toggleFilterTag = (id: string) => {
    setActiveTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // ── Filtering ────────────────────────────────────────────────────────────

  const pinned = thoughts.filter((t) => t.tags.includes('q1-urgent'));
  const rest = thoughts.filter((t) => !t.tags.includes('q1-urgent'));

  const filtered = rest.filter((t) => {
    const matchesTags = activeTagIds.length === 0 || t.tags.some((id) => activeTagIds.includes(id));
    const matchesSearch = !search || t.text.toLowerCase().includes(search.toLowerCase());
    return matchesTags && matchesSearch;
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-16 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brain Dump</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {thoughts.length} open thought{thoughts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasDone && (
            <Button variant="ghost" size="sm" onClick={handleClearDone} className="text-xs text-muted-foreground h-7 px-2">
              Clear done
            </Button>
          )}
          <ExportMenu thoughts={thoughts} tagMap={tagMap} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTagManagerOpen(true)}
            className="text-xs text-muted-foreground h-7 px-2"
          >
            <Tags size={13} />
          </Button>
          <Link
            href="/apps/brain-dump/history"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 h-7"
          >
            <History size={13} />
            History
          </Link>
        </div>
      </div>

      {/* Input */}
      <BrainDumpInput
        tags={tags}
        onSave={handleSave}
        onManageTags={() => setTagManagerOpen(true)}
      />

      {/* Pinned urgent */}
      {pinned.length > 0 && (
        <PinnedSection
          thoughts={pinned}
          tagMap={tagMap}
          allTags={tags}
          onDone={handleDone}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      {/* Filter bar */}
      {thoughts.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="h-px bg-border" />
          <TagFilterBar
            tags={tags}
            activeTagIds={activeTagIds}
            search={search}
            onToggleTag={toggleFilterTag}
            onSearch={setSearch}
          />
        </div>
      )}

      {/* Main list */}
      <BrainDumpList
        thoughts={filtered}
        tagMap={tagMap}
        allTags={tags}
        onDone={handleDone}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      {/* Empty state */}
      {thoughts.length === 0 && (
        <div className="text-center py-16 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Nothing on your mind right now.</p>
          <p className="text-xs text-muted-foreground/50">Start typing above — ↵ to save.</p>
        </div>
      )}

      <TagManager
        open={tagManagerOpen}
        onOpenChange={setTagManagerOpen}
        tags={tags}
        onCreate={handleCreateTag}
        onRename={handleRenameTag}
        onDelete={handleDeleteTag}
      />
    </main>
  );
}
