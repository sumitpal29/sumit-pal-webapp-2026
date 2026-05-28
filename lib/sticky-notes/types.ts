export interface StickyNoteData {
  id: string;
  content: string;
  colorId: string;
  fontId?: string;
  fontSize?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** User-set decorative tilt in degrees (–15 … +15). Wind physics oscillates around 0 and is added on top. */
  fixedAngle: number;
  zIndex: number;
  createdAt: number;
}

// screwIndex (0–5) is derived from colorId — no need to store separately
// WindState removed: wind is now a continuous rAF physics loop, not React state
