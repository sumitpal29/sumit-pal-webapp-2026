import type { Thought, Tag, TagMap } from './types';
import { SEED_TAGS } from './seed-tags';
import { tagColor } from './tag-color';

const KEYS = {
  thoughts: 'brain-dump-v1-thoughts',
  tags: 'brain-dump-v1-tags',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

// ── Tags ─────────────────────────────────────────────────────────────────────

function seedTagsIfEmpty(tags: Tag[]): Tag[] {
  if (tags.length > 0) return tags;
  write(KEYS.tags, SEED_TAGS);
  return SEED_TAGS;
}

export function getTags(): Tag[] {
  const tags = read<Tag[]>(KEYS.tags, []);
  return seedTagsIfEmpty(tags);
}

export function getTagMap(): TagMap {
  return Object.fromEntries(getTags().map((t) => [t.id, t]));
}

export function createTag(label: string): Tag {
  const tag: Tag = {
    id: crypto.randomUUID(),
    label: label.trim(),
    color: tagColor(label.trim()),
    system: false,
    priority: 100,
  };
  const tags = getTags();
  write(KEYS.tags, [...tags, tag]);
  return tag;
}

export function updateTag(id: string, label: string): void {
  const tags = getTags().map((t) =>
    t.id === id ? { ...t, label: label.trim(), color: tagColor(label.trim()) } : t
  );
  write(KEYS.tags, tags);
}

export function deleteTag(id: string): void {
  const tags = getTags().filter((t) => t.id !== id);
  write(KEYS.tags, tags);
  // Remove this tag from all thoughts
  const thoughts = getThoughts().map((th) => ({
    ...th,
    tags: th.tags.filter((tid) => tid !== id),
  }));
  write(KEYS.thoughts, thoughts);
}

// ── Thoughts ─────────────────────────────────────────────────────────────────

export function getThoughts(): Thought[] {
  return read<Thought[]>(KEYS.thoughts, []);
}

export function addThought(text: string, tagIds: string[]): Thought {
  const thought: Thought = {
    id: crypto.randomUUID(),
    text: text.trim(),
    tags: tagIds,
    status: 'open',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const thoughts = getThoughts();
  write(KEYS.thoughts, [thought, ...thoughts]);
  return thought;
}

export function updateThought(id: string, patch: Partial<Pick<Thought, 'text' | 'tags' | 'status'>>): void {
  const thoughts = getThoughts().map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
  );
  write(KEYS.thoughts, thoughts);
}

export function deleteThought(id: string): void {
  write(KEYS.thoughts, getThoughts().filter((t) => t.id !== id));
}

export function clearDoneThoughts(): void {
  write(KEYS.thoughts, getThoughts().filter((t) => t.status !== 'done'));
}
