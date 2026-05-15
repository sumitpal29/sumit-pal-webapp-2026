// Parses a thought's raw text into renderable segments.
// Supports **bold** spans and auto-linked https?:// URLs.

export type Segment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'link'; value: string; href: string };

const URL_RE = /https?:\/\/[^\s)>\]"']+/g;
const BOLD_RE = /\*\*(.+?)\*\*/g;

export function parseSegments(text: string): Segment[] {
  // Build a flat list of token ranges: bold matches and url matches.
  type Range = { start: number; end: number; seg: Segment };
  const ranges: Range[] = [];

  for (const m of text.matchAll(BOLD_RE)) {
    ranges.push({ start: m.index!, end: m.index! + m[0].length, seg: { type: 'bold', value: m[1] } });
  }
  for (const m of text.matchAll(URL_RE)) {
    // Skip if already inside a bold range
    const overlaps = ranges.some((r) => m.index! >= r.start && m.index! < r.end);
    if (!overlaps) {
      ranges.push({ start: m.index!, end: m.index! + m[0].length, seg: { type: 'link', value: m[0], href: m[0] } });
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;

  for (const { start, end, seg } of ranges) {
    if (start > cursor) segments.push({ type: 'text', value: text.slice(cursor, start) });
    segments.push(seg);
    cursor = end;
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) });

  return segments.length ? segments : [{ type: 'text', value: text }];
}
