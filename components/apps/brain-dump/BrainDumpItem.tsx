'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Tag as TagIcon } from 'lucide-react';
import type { Thought, Tag } from '@/lib/brain-dump/types';
import { parseSegments } from '@/lib/brain-dump/text-render';
import { TagBadge } from './TagBadge';
import { TagPicker } from './TagPicker';

interface Props {
  thought: Thought;
  tagMap: Record<string, Tag>;
  allTags: Tag[];
  onDone: () => void;
  onDelete: () => void;
  onUpdate: (text: string, tagIds: string[]) => void;
  pinned?: boolean;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {parseSegments(text).map((seg, i) => {
        if (seg.type === 'bold') return <strong key={i}>{seg.value}</strong>;
        if (seg.type === 'link')
          return (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {seg.value}
            </a>
          );
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

export function BrainDumpItem({ thought, tagMap, allTags, onDone, onDelete, onUpdate, pinned }: Props) {
  const [editingText, setEditingText] = useState(false);
  const [editText, setEditText] = useState(thought.text);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState(thought.tags);
  const [fading, setFading] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Keep local tag state in sync if parent updates thought
  useEffect(() => {
    setSelectedTagIds(thought.tags);
    setEditText(thought.text);
  }, [thought.tags, thought.text]);

  useEffect(() => {
    if (editingText) editRef.current?.focus();
  }, [editingText]);

  // Close tag picker on outside click
  useEffect(() => {
    if (!tagPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setTagPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagPickerOpen]);

  const commitTextEdit = useCallback(() => {
    setEditingText(false);
    const trimmed = editText.trim();
    if (trimmed && trimmed !== thought.text) {
      onUpdate(trimmed, selectedTagIds);
    }
  }, [editText, thought.text, selectedTagIds, onUpdate]);

  const handleTagChange = (newTagIds: string[]) => {
    setSelectedTagIds(newTagIds);
    onUpdate(thought.text, newTagIds);
  };

  const handleDone = () => {
    setFading(true);
    setTimeout(onDone, 400);
  };

  const thoughtTags = selectedTagIds.map((id) => tagMap[id]).filter(Boolean);
  const isUrgent = selectedTagIds.includes('q1-urgent');

  return (
    <div
      className={`group relative flex gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
        fading ? 'opacity-0 scale-95' : 'opacity-100'
      } ${
        pinned || isUrgent
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-border bg-card hover:border-primary/25'
      }`}
    >
      {/* Done checkbox */}
      <button
        onClick={handleDone}
        className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          isUrgent
            ? 'border-red-400/60 hover:bg-red-400/20'
            : 'border-muted-foreground/30 hover:border-primary/60'
        }`}
        aria-label="Mark done"
      >
        <Check size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {editingText ? (
          <textarea
            ref={editRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setEditText(thought.text); setEditingText(false); }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTextEdit(); }
            }}
            rows={2}
            className="w-full resize-none bg-transparent text-sm text-foreground focus:outline-none"
          />
        ) : (
          <p
            onClick={() => setEditingText(true)}
            className="text-sm text-foreground leading-relaxed cursor-text whitespace-pre-wrap break-words"
          >
            <RichText text={thought.text} />
          </p>
        )}

        {/* Tags row + timestamp */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap items-center gap-1">
            {thoughtTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="xs" />
            ))}
            <button
              onClick={() => setTagPickerOpen((v) => !v)}
              className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium transition-colors
                opacity-0 group-hover:opacity-100
                ${tagPickerOpen ? 'opacity-100 border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'}
              `}
              aria-label="Edit tags"
            >
              <TagIcon size={9} />
              {thoughtTags.length === 0 ? 'tag' : ''}
            </button>
          </div>
          <time
            dateTime={new Date(thought.createdAt).toISOString()}
            title={new Date(thought.createdAt).toLocaleString()}
            className="text-[10px] text-muted-foreground/60 shrink-0"
          >
            {formatRelativeTime(thought.createdAt)}
          </time>
        </div>

        {/* Inline tag picker */}
        {tagPickerOpen && (
          <div ref={pickerRef}>
            <TagPicker
              tags={allTags}
              selectedTagIds={selectedTagIds}
              onChange={handleTagChange}
            />
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        aria-label="Delete"
      >
        <X size={13} />
      </button>
    </div>
  );
}
