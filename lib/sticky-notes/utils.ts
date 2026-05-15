import type { StickyNoteData } from './types';

export const MIN_SIZE = 150;
export const MAX_SIZE = 340;
const DEFAULT_SIZE = 200;

export const STICKY_COLORS = [
  { id: 'yellow', bg: '#FEF9C3', header: '#FDE047', text: '#713f12' },
  { id: 'pink',   bg: '#FCE7F3', header: '#F9A8D4', text: '#831843' },
  { id: 'blue',   bg: '#DBEAFE', header: '#93C5FD', text: '#1e3a5f' },
  { id: 'green',  bg: '#DCFCE7', header: '#86EFAC', text: '#14532d' },
  { id: 'purple', bg: '#F3E8FF', header: '#C084FC', text: '#581c87' },
  { id: 'peach',  bg: '#FFEDD5', header: '#FDBA74', text: '#7c2d12' },
] as const;

export type ColorId = (typeof STICKY_COLORS)[number]['id'];

export function createNote(opts: { x: number; y: number; colorId: string }): StickyNoteData {
  return {
    id: crypto.randomUUID(),
    content: '',
    colorId: opts.colorId,
    x: opts.x,
    y: opts.y,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    fixedAngle: 0,
    zIndex: 1,
    createdAt: Date.now(),
  };
}

interface Rect { x: number; y: number; width: number; height: number }

function overlaps(a: Rect, b: Rect, gap = 10): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

export function resolvePosition(
  target: Rect,
  others: Rect[],
  boardW: number,
  boardH: number
): { x: number; y: number } {
  let x = Math.max(0, Math.min(target.x, boardW - target.width));
  let y = Math.max(0, Math.min(target.y, boardH - target.height));
  const GAP = 10;

  for (let attempt = 0; attempt < 40; attempt++) {
    const hit = others.find((o) => overlaps({ x, y, width: target.width, height: target.height }, o, GAP));
    if (!hit) break;

    const pushRight = hit.x + hit.width + GAP - x;
    const pushLeft  = x + target.width + GAP - hit.x;
    const pushDown  = hit.y + hit.height + GAP - y;
    const pushUp    = y + target.height + GAP - hit.y;
    const min = Math.min(pushRight, pushLeft, pushDown, pushUp);

    if (min === pushRight) x += pushRight;
    else if (min === pushLeft) x -= pushLeft;
    else if (min === pushDown) y += pushDown;
    else y -= pushUp;

    x = Math.max(0, Math.min(x, boardW - target.width));
    y = Math.max(0, Math.min(y, boardH - target.height));
  }

  return { x, y };
}
