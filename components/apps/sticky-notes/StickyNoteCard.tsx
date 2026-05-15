'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, type MotionValue, useTransform } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import type { StickyNoteData } from '@/lib/sticky-notes/types';
import { STICKY_COLORS, MIN_SIZE, MAX_SIZE } from '@/lib/sticky-notes/utils';

interface Props {
  note: StickyNoteData;
  /** Live physics angle in degrees from rAF loop — zero React re-renders */
  rotationMV: MotionValue<number>;
  onUpdate: (updates: Partial<StickyNoteData>) => void;
  onDelete: () => void;
  onFocus: () => void;
  onDrop: (x: number, y: number) => void;
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
}

const ANGLE_PRESETS = [-10, -5, 0, 5, 10] as const;

export function StickyNoteCard({ note, rotationMV, onUpdate, onDelete, onFocus, onDrop, onInteractStart, onInteractEnd }: Props) {
  const color = STICKY_COLORS.find((c) => c.id === note.colorId) ?? STICKY_COLORS[0];
  const isDraggingRef = useRef(false);
  const [pos, setPos] = useState({ x: note.x, y: note.y });
  const [paintOpen, setPaintOpen] = useState(false);

  // Sync position from parent (overlap resolution) when not mid-drag
  useEffect(() => {
    if (!isDraggingRef.current) setPos({ x: note.x, y: note.y });
  }, [note.x, note.y]);

  // Total displayed rotation = wind physics angle + user fixed tilt
  const fixedAngle = note.fixedAngle ?? 0;
  const totalRotation = useTransform(rotationMV, (v) => v + fixedAngle);

  // ── drag ──────────────────────────────────────────────────────────────────
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea')) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setPaintOpen(false);
    onFocus();
    onInteractStart?.();

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = pos.x;
    const startY = pos.y;

    const onMove = (ev: MouseEvent) =>
      setPos({ x: startX + ev.clientX - startMouseX, y: startY + ev.clientY - startMouseY });

    const onUp = (ev: MouseEvent) => {
      isDraggingRef.current = false;
      onDrop(startX + ev.clientX - startMouseX, startY + ev.clientY - startMouseY);
      onInteractEnd?.();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── resize ────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startW = note.width, startH = note.height;

    const onMove = (ev: MouseEvent) =>
      onUpdate({
        width:  Math.max(MIN_SIZE, Math.min(MAX_SIZE, startW + ev.clientX - startX)),
        height: Math.max(MIN_SIZE, Math.min(MAX_SIZE, startH + ev.clientY - startY)),
      });

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: note.width,
        height: note.height,
        zIndex: note.zIndex,
        backgroundColor: color.bg,
        transformOrigin: 'top center',
        rotate: totalRotation,
        boxShadow: '4px 8px 28px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.07)',
      }}
      className="group rounded-xl flex flex-col select-none"
      onMouseDownCapture={onFocus}
    >
      {/* Header — drag handle + hover-only icons, all contained within the same row */}
      <div
        className="h-8 flex items-center justify-between px-2 rounded-t-xl shrink-0 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: color.header }}
        onMouseDown={handleHeaderMouseDown}
      >
        {/* Paint icon — left side, hover only */}
        <button
          type="button"
          onMouseDown={(e) => { e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); setPaintOpen((o) => !o); }}
          className="p-1 rounded-md opacity-0 group-hover:opacity-75 hover:!opacity-100 transition-opacity"
          style={{ color: color.text }}
          title="Change colour & angle"
        >
          <Palette size={13} strokeWidth={2} />
        </button>

        {/* Delete icon — right side, hover only */}
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="p-1 rounded-md opacity-0 group-hover:opacity-65 hover:!opacity-100 transition-opacity"
          style={{ color: color.text }}
          title="Delete"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Content textarea */}
      <textarea
        value={note.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        onFocus={onInteractStart}
        onBlur={onInteractEnd}
        placeholder="write something…"
        spellCheck={false}
        className="flex-1 w-full px-3 pt-1.5 pb-3 bg-transparent resize-none outline-none text-sm leading-relaxed font-medium placeholder:opacity-35"
        style={{ color: color.text, caretColor: color.text }}
      />

      {/* Paint panel — floats below the header */}
      {paintOpen && (
        <div
          className="absolute left-0 top-9 z-[10000] rounded-2xl p-3 shadow-2xl border border-black/8 min-w-[168px]"
          style={{ backgroundColor: color.bg }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Colour swatches */}
          <p className="text-[10px] font-mono uppercase tracking-wider mb-2 opacity-50" style={{ color: color.text }}>
            colour
          </p>
          <div className="flex gap-2 mb-3">
            {STICKY_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onUpdate({ colorId: c.id })}
                className="w-6 h-6 rounded-full transition-transform hover:scale-125 shrink-0"
                style={{
                  backgroundColor: c.bg,
                  border: note.colorId === c.id
                    ? `2.5px solid ${c.text}`
                    : '1.5px solid rgba(0,0,0,0.14)',
                }}
                title={c.id}
              />
            ))}
          </div>

          {/* Angle presets */}
          <p className="text-[10px] font-mono uppercase tracking-wider mb-2 opacity-50" style={{ color: color.text }}>
            angle
          </p>
          <div className="flex gap-1">
            {ANGLE_PRESETS.map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onUpdate({ fixedAngle: deg })}
                className="flex-1 py-1 text-[10px] font-mono rounded-lg transition-colors"
                style={{
                  color: color.text,
                  backgroundColor:
                    fixedAngle === deg ? `rgba(0,0,0,0.14)` : 'transparent',
                }}
                title={`${deg}°`}
              >
                <span style={{ display: 'inline-block', transform: `rotate(${deg}deg)`, fontWeight: 700 }}>
                  {deg === 0 ? '—' : '|'}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-0.5">
            {ANGLE_PRESETS.map((deg) => (
              <span
                key={deg}
                className="flex-1 text-center text-[9px] font-mono opacity-45"
                style={{ color: color.text }}
              >
                {deg > 0 ? `+${deg}` : deg}°
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resize grip */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize rounded-br-xl opacity-25 hover:opacity-55 transition-opacity"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M2 10L10 2M6 10L10 6' stroke='${encodeURIComponent(color.text)}' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '4px 4px',
        }}
      />
    </motion.div>
  );
}
