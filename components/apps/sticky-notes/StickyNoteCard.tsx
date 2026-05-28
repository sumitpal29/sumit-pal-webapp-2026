'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, type MotionValue, useTransform } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import type { StickyNoteData } from '@/lib/sticky-notes/types';
import {
  STICKY_COLORS, STICKY_FONTS, STICKY_FONT_SIZES, DEFAULT_FONT_SIZE,
  loadStickyFont, loadAllStickyFonts,
  MIN_SIZE, MAX_SIZE,
} from '@/lib/sticky-notes/utils';
import { parseBlocks, type Block, type Segment } from '@/lib/brain-dump/text-render';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ── Markdown renderers ────────────────────────────────────────────────────────

function renderInline(seg: Segment, i: number, textColor: string) {
  if (seg.type === 'bold')   return <strong key={i}>{seg.value}</strong>;
  if (seg.type === 'italic') return <em key={i}>{seg.value}</em>;
  if (seg.type === 'code')   return <code key={i} className="rounded px-0.5 text-[0.8em] font-mono opacity-85" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>{seg.value}</code>;
  if (seg.type === 'strike') return <del key={i} className="opacity-60">{seg.value}</del>;
  if (seg.type === 'link')   return (
    <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer"
      onMouseDown={(e) => e.stopPropagation()}
      className="underline underline-offset-2 opacity-80 hover:opacity-100"
      style={{ color: textColor }}>
      {seg.value}
    </a>
  );
  return <span key={i}>{seg.value}</span>;
}

function renderBlock(block: Block, bi: number, textColor: string, base: number) {
  if (block.type === 'hr') return <hr key={bi} className="my-1 border-current opacity-20" />;
  const inlines = block.inlines.map((s, i) => renderInline(s, i, textColor));
  if (block.type === 'h1') return <p key={bi} style={{ fontSize: Math.round(base * 1.3), fontWeight: 700 }} className="leading-snug mb-0.5">{inlines}</p>;
  if (block.type === 'h2') return <p key={bi} style={{ fontSize: Math.round(base * 1.15), fontWeight: 700 }} className="leading-snug mb-0.5">{inlines}</p>;
  if (block.type === 'h3') return <p key={bi} style={{ fontSize: base, fontWeight: 600, opacity: 0.8 }} className="leading-snug mb-0.5">{inlines}</p>;
  if (block.type === 'bullet') return <p key={bi} className="flex gap-1.5 leading-snug"><span className="shrink-0 mt-px opacity-60">•</span><span>{inlines}</span></p>;
  return <p key={bi} className="leading-snug min-h-[1em]">{inlines}</p>;
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  note: StickyNoteData;
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
  const color      = STICKY_COLORS.find((c) => c.id === note.colorId) ?? STICKY_COLORS[0];
  const activeFont = STICKY_FONTS.find((f) => f.id === (note.fontId ?? 'default')) ?? STICKY_FONTS[0];
  const activeFontSize = note.fontSize ?? DEFAULT_FONT_SIZE;

  const isDraggingRef = useRef(false);
  const [pos, setPos] = useState({ x: note.x, y: note.y });
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync position from parent (overlap resolution) when not mid-drag
  useEffect(() => {
    if (!isDraggingRef.current) setPos({ x: note.x, y: note.y });
  }, [note.x, note.y]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  // Load the note's current font on mount (in case it was saved from a previous session)
  useEffect(() => {
    if (note.fontId) loadStickyFont(note.fontId);
  }, [note.fontId]);

  const fixedAngle   = note.fixedAngle ?? 0;
  const totalRotation = useTransform(rotationMV, (v) => v + fixedAngle);

  const enterEdit = useCallback(() => { setIsEditing(true);  onInteractStart?.(); }, [onInteractStart]);
  const exitEdit  = useCallback(() => { setIsEditing(false); onInteractEnd?.();   }, [onInteractEnd]);

  // ── drag ──────────────────────────────────────────────────────────────────
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea')) return;
    e.preventDefault();
    if (isEditing) textareaRef.current?.blur();
    isDraggingRef.current = true;
    onFocus();
    onInteractStart?.();

    const startMouseX = e.clientX, startMouseY = e.clientY;
    const startX = pos.x, startY = pos.y;

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

  // Shared content styles — applied to both textarea and view div
  const contentStyle: React.CSSProperties = {
    color: color.text,
    fontFamily: activeFont.family,
    fontSize: activeFontSize,
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
      {/* Header */}
      <div
        className="h-8 flex items-center justify-between px-2 rounded-t-xl shrink-0 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: color.header }}
        onMouseDown={handleHeaderMouseDown}
      >
        {/* Palette popover */}
        <Popover onOpenChange={(open) => { if (open) loadAllStickyFonts(); }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 rounded-md opacity-0 group-hover:opacity-75 hover:!opacity-100 transition-opacity"
              style={{ color: color.text }}
              title="Customise"
            >
              <Palette size={13} strokeWidth={2} />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-[188px] p-3 rounded-2xl border-black/8 shadow-2xl z-[99999]"
            style={{ backgroundColor: color.bg }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Colour ── */}
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2 opacity-50" style={{ color: color.text }}>colour</p>
            <div className="flex gap-2 mb-3">
              {STICKY_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdate({ colorId: c.id })}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-125 shrink-0"
                  style={{
                    backgroundColor: c.bg,
                    border: note.colorId === c.id ? `2.5px solid ${c.text}` : '1.5px solid rgba(0,0,0,0.14)',
                  }}
                />
              ))}
            </div>

            {/* ── Angle ── */}
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 opacity-50" style={{ color: color.text }}>angle</p>
            <div className="flex gap-1 mb-0.5">
              {ANGLE_PRESETS.map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onUpdate({ fixedAngle: deg })}
                  className="flex-1 py-1 text-[10px] font-mono rounded-lg transition-colors"
                  style={{ color: color.text, backgroundColor: fixedAngle === deg ? 'rgba(0,0,0,0.14)' : 'transparent' }}
                  title={`${deg}°`}
                >
                  <span style={{ display: 'inline-block', transform: `rotate(${deg}deg)`, fontWeight: 700 }}>
                    {deg === 0 ? '—' : '|'}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-1 mb-3">
              {ANGLE_PRESETS.map((deg) => (
                <span key={deg} className="flex-1 text-center text-[9px] font-mono opacity-45" style={{ color: color.text }}>
                  {deg > 0 ? `+${deg}` : deg}°
                </span>
              ))}
            </div>

            {/* ── Font ── */}
            <div className="border-t border-black/10 mb-3" />
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2 opacity-50" style={{ color: color.text }}>font</p>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {STICKY_FONTS.map((font) => {
                const active = (note.fontId ?? 'default') === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => { loadStickyFont(font.id); onUpdate({ fontId: font.id }); }}
                    className="flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors gap-0.5"
                    style={{ color: color.text, backgroundColor: active ? 'rgba(0,0,0,0.14)' : 'transparent' }}
                    title={font.label}
                  >
                    <span style={{ fontFamily: font.family, fontSize: 16, lineHeight: 1 }}>Ag</span>
                    <span style={{ fontSize: 8, opacity: 0.55, fontFamily: 'ui-monospace, monospace' }}>{font.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Size ── */}
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 opacity-50" style={{ color: color.text }}>size</p>
            <div className="flex gap-1">
              {STICKY_FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onUpdate({ fontSize: size })}
                  className="flex-1 py-1 text-[9px] font-mono rounded-lg transition-colors"
                  style={{ color: color.text, backgroundColor: activeFontSize === size ? 'rgba(0,0,0,0.14)' : 'transparent' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Delete */}
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

      {/* Content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={exitEdit}
          spellCheck={false}
          className="flex-1 w-full px-3 pt-1.5 pb-3 bg-transparent resize-none outline-none leading-relaxed font-medium"
          style={{ ...contentStyle, caretColor: color.text }}
        />
      ) : (
        <div
          onMouseDown={(e) => { e.preventDefault(); enterEdit(); }}
          className="flex-1 w-full px-3 pt-1.5 pb-3 leading-relaxed font-medium cursor-text overflow-auto"
          style={contentStyle}
        >
          {note.content ? (
            parseBlocks(note.content).map((block, bi) => renderBlock(block, bi, color.text, activeFontSize))
          ) : (
            <span className="opacity-35">write something…</span>
          )}
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
