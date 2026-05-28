import type { StickyNoteData } from './types';

export const MIN_SIZE = 150;
export const MAX_SIZE = 340;
const DEFAULT_SIZE = 200;

// ── Fonts ─────────────────────────────────────────────────────────────────────

export const STICKY_FONTS = [
  { id: 'default',   label: 'Default',   family: 'inherit',                           googleUrl: null },
  { id: 'playwrite', label: 'Playwrite',  family: '"Playwrite AU TAS", cursive',        googleUrl: 'https://fonts.googleapis.com/css2?family=Playwrite+AU+TAS:wght@100..400&display=swap' },
  { id: 'lavishly',  label: 'Lavishly',   family: '"Lavishly Yours", cursive',          googleUrl: 'https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap' },
  { id: 'festive',   label: 'Festive',    family: '"Festive", cursive',                 googleUrl: 'https://fonts.googleapis.com/css2?family=Festive&display=swap' },
  { id: 'fascinate', label: 'Fascinate',  family: '"Fascinate Inline", cursive',        googleUrl: 'https://fonts.googleapis.com/css2?family=Fascinate+Inline&display=swap' },
  { id: 'bitcount',  label: 'Bitcount',   family: '"Bitcount Grid Single", system-ui',  googleUrl: 'https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&display=swap' },
] as const;

export type FontId = (typeof STICKY_FONTS)[number]['id'];

export const STICKY_FONT_SIZES = [11, 12, 13, 14, 16, 18] as const;
export const DEFAULT_FONT_SIZE = 13;

/** Lazily injects a Google Fonts stylesheet the first time a font is needed. Idempotent. */
export function loadStickyFont(fontId: string): void {
  if (typeof document === 'undefined') return;
  const font = STICKY_FONTS.find((f) => f.id === fontId);
  if (!font?.googleUrl) return;
  if (document.querySelector(`link[data-sticky-font="${fontId}"]`)) return;

  for (const [href, co] of [
    ['https://fonts.googleapis.com', false],
    ['https://fonts.gstatic.com',    true],
  ] as [string, boolean][]) {
    if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      const pc = document.createElement('link');
      pc.rel = 'preconnect';
      pc.href = href;
      if (co) pc.crossOrigin = 'anonymous';
      document.head.appendChild(pc);
    }
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.googleUrl;
  link.dataset.stickyFont = fontId;
  document.head.appendChild(link);
}

/** Preloads all sticky fonts (call on palette open so previews render correctly). */
export function loadAllStickyFonts(): void {
  for (const font of STICKY_FONTS) {
    if (font.googleUrl) loadStickyFont(font.id);
  }
}

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
