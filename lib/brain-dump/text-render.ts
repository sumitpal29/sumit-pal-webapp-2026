// Parses raw text into renderable segments / blocks.
// Used by brain-dump (parseSegments) and sticky notes (parseBlocks).

// ── Inline types ─────────────────────────────────────────────────────────────

export type Segment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strike'; value: string }
  | { type: 'link'; value: string; href: string };

// ── Block types (sticky notes) ────────────────────────────────────────────────

export type Block =
  | { type: 'h1' | 'h2' | 'h3'; inlines: Segment[] }
  | { type: 'bullet'; inlines: Segment[] }
  | { type: 'hr' }
  | { type: 'paragraph'; inlines: Segment[] };

// ── Inline parser ─────────────────────────────────────────────────────────────

type Range = { start: number; end: number; seg: Segment; priority: number };

const INLINE_PATTERNS: Array<{
  re: RegExp;
  priority: number;
  make: (m: RegExpMatchArray) => Segment;
}> = [
  // Inline code — highest priority so inner syntax is not parsed
  { re: /`([^`]+)`/g, priority: 0, make: m => ({ type: 'code', value: m[1] }) },
  // Bold before italic so ** isn't treated as two *
  { re: /\*\*(.+?)\*\*/g, priority: 1, make: m => ({ type: 'bold', value: m[1] }) },
  // Italic: *text* or _text_  (the (?!\*) guards prevent matching inside **)
  { re: /\*(?!\*)(.+?)(?<!\*)\*/g, priority: 2, make: m => ({ type: 'italic', value: m[1] }) },
  { re: /_([^_]+)_/g, priority: 2, make: m => ({ type: 'italic', value: m[1] }) },
  // Strikethrough
  { re: /~~(.+?)~~/g, priority: 3, make: m => ({ type: 'strike', value: m[1] }) },
  // URLs
  { re: /https?:\/\/[^\s)>\]"']+/g, priority: 4, make: m => ({ type: 'link', value: m[0], href: m[0] }) },
];

function parseInlines(text: string): Segment[] {
  const ranges: Range[] = [];

  for (const { re, priority, make } of INLINE_PATTERNS) {
    for (const m of text.matchAll(re)) {
      ranges.push({ start: m.index!, end: m.index! + m[0].length, seg: make(m), priority });
    }
  }

  // Sort by position; ties broken by priority (lower = higher priority)
  ranges.sort((a, b) => a.start - b.start || a.priority - b.priority);

  // Drop ranges that overlap an already-accepted range
  const accepted: Range[] = [];
  let maxEnd = 0;
  for (const r of ranges) {
    if (r.start >= maxEnd) {
      accepted.push(r);
      maxEnd = r.end;
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;
  for (const { start, end, seg } of accepted) {
    if (start > cursor) segments.push({ type: 'text', value: text.slice(cursor, start) });
    segments.push(seg);
    cursor = end;
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) });

  return segments.length ? segments : [{ type: 'text', value: text }];
}

// ── Block parser (for sticky notes) ──────────────────────────────────────────

const HEADING_RE = /^(#{1,3})\s+(.+)$/;
const BULLET_RE = /^[-*]\s+(.+)$/;
const HR_RE = /^-{3,}$/;

export function parseBlocks(text: string): Block[] {
  return text.split('\n').map((line): Block => {
    const hm = line.match(HEADING_RE);
    if (hm) {
      const level = Math.min(hm[1].length, 3) as 1 | 2 | 3;
      return { type: `h${level}` as 'h1' | 'h2' | 'h3', inlines: parseInlines(hm[2]) };
    }
    if (HR_RE.test(line.trim())) return { type: 'hr' };
    const bm = line.match(BULLET_RE);
    if (bm) return { type: 'bullet', inlines: parseInlines(bm[1]) };
    return { type: 'paragraph', inlines: parseInlines(line) };
  });
}

// ── Legacy export (brain-dump) — kept for backward compat ────────────────────

export function parseSegments(text: string): Segment[] {
  return parseInlines(text);
}
