import type { StickyNoteData } from './types';

const KEY = 'sticky-notes-v1';

export function loadNotes(): StickyNoteData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StickyNoteData[]) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: StickyNoteData[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(notes));
}
