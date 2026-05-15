'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, motionValue, type MotionValue } from 'framer-motion';
import { Plus } from 'lucide-react';
import { StickyNoteCard } from './StickyNoteCard';
import { WindControl } from './WindControl';
import { loadNotes, saveNotes } from '@/lib/sticky-notes/storage';
import { createNote, resolvePosition, STICKY_COLORS } from '@/lib/sticky-notes/utils';
import { createWindSampler } from '@/lib/sticky-notes/wind';
import {
  integrateNote,
  angleToDeg,
  createInitialPhysicsState,
  type NotePhysicsState,
} from '@/lib/sticky-notes/physics';
import type { StickyNoteData } from '@/lib/sticky-notes/types';

// ── wind modifiers (position/size/shelter) ────────────────────────────────────

function elevationFactor(noteY: number, boardH: number): number {
  if (boardH <= 0) return 1;
  return 1.35 - 0.65 * (noteY / boardH);
}

function shelterFactor(target: StickyNoteData, all: StickyNoteData[], windVelocity: number): number {
  if (windVelocity === 0) return 1;
  const windDir = windVelocity > 0 ? 1 : -1;
  const tx = target.x + target.width / 2;
  const ty = target.y + target.height / 2;
  let maxReduction = 0;
  for (const other of all) {
    if (other.id === target.id) continue;
    const ox = other.x + other.width / 2;
    const oy = other.y + other.height / 2;
    const dxUpwind = (ox - tx) * -windDir;
    if (dxUpwind < 20) continue;
    const verticalOffset = Math.abs(oy - ty);
    const coneLimit = dxUpwind * Math.tan(Math.PI / 6);
    if (verticalOffset > coneLimit + other.height / 2) continue;
    const distFactor = Math.max(0, 1 - dxUpwind / 500);
    const sizeFactor = Math.min(1, other.width / (target.width + 1));
    const reduction = 0.50 * distFactor * sizeFactor;
    if (reduction > maxReduction) maxReduction = reduction;
  }
  return 1 - maxReduction;
}

function crowdFactor(target: StickyNoteData, all: StickyNoteData[]): number {
  const tx = target.x + target.width / 2;
  const ty = target.y + target.height / 2;
  let count = 0;
  for (const other of all) {
    if (other.id === target.id) continue;
    const dx = other.x + other.width / 2 - tx;
    const dy = other.y + other.height / 2 - ty;
    if (dx * dx + dy * dy < 320 * 320) count++;
  }
  return Math.max(0.72, 1 - count * 0.07);
}

// ── component ─────────────────────────────────────────────────────────────────

const WIND_SETTINGS_KEY = 'sticky-notes-wind-v1';

function loadWindSettings() {
  try {
    const raw = localStorage.getItem(WIND_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as { enabled: boolean; sensitivity: number };
  } catch { /* ignore */ }
  return { enabled: true, sensitivity: 1.0 };
}

export function StickyBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<StickyNoteData[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Wind UI state — only changes on user interaction or when wind starts/stops
  const [isWindy, setIsWindy] = useState(false);
  const [windEnabled, setWindEnabled] = useState(true);
  const [windSensitivity, setWindSensitivity] = useState(1.0);

  // Refs that let the rAF loop read latest values without stale closures
  const notesRef          = useRef<StickyNoteData[]>([]);
  const windEnabledRef    = useRef(true);
  const windSensitivityRef= useRef(1.0);
  const isWindyRef        = useRef(false);

  // Physics + motion values — fully outside React
  const physicsRef      = useRef<Map<string, NotePhysicsState>>(new Map());
  const motionValuesRef = useRef<Map<string, MotionValue<number>>>(new Map());
  const windSamplerRef  = useRef(createWindSampler());

  notesRef.current           = notes;
  windEnabledRef.current     = windEnabled;
  windSensitivityRef.current = windSensitivity;

  // Tracks which note is currently being dragged or typed in — wind paused for it
  const interactingNoteRef = useRef<string | null>(null);

  // ── bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const settings = loadWindSettings();
    setWindEnabled(settings.enabled);
    setWindSensitivity(settings.sensitivity);
    setNotes(loadNotes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveNotes(notes);
  }, [notes, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(
        WIND_SETTINGS_KEY,
        JSON.stringify({ enabled: windEnabled, sensitivity: windSensitivity }),
      );
    }
  }, [windEnabled, windSensitivity, hydrated]);

  // ── clean up physics + motionValue for deleted notes ──────────────────────
  useEffect(() => {
    for (const id of physicsRef.current.keys()) {
      if (!notes.find((n) => n.id === id)) {
        physicsRef.current.delete(id);
        motionValuesRef.current.delete(id);
      }
    }
  }, [notes]);

  // ── rAF physics loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;
    let lastTime: number | null = null;
    const sampler = windSamplerRef.current;

    const tick = (now: number) => {
      const dt = lastTime == null ? 0.016 : Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const current   = notesRef.current;
      const enabled   = windEnabledRef.current;
      const sensitivity = windSensitivityRef.current;
      const boardH    = boardRef.current?.getBoundingClientRect().height ?? 600;
      const boardW    = boardRef.current?.getBoundingClientRect().width  ?? 1000;

      // Sample wind at the board centre to decide if it's "windy" (one call, cheap)
      const centreWind = enabled
        ? sampler.sample(boardW / 2, boardH / 2, now) * sensitivity
        : 0;
      const windyNow = Math.abs(centreWind) > 2.5;
      if (windyNow !== isWindyRef.current) {
        isWindyRef.current = windyNow;
        setIsWindy(windyNow); // only fires when state actually changes
      }

      for (const note of current) {
        const mv   = motionValuesRef.current.get(note.id);
        const phys = physicsRef.current.get(note.id);
        if (!mv || !phys) continue;

        // No wind while the user is dragging or typing on this note
        const isInteracting = interactingNoteRef.current === note.id;

        let effectiveWind = 0;
        if (enabled && !isInteracting) {
          const base    = sampler.sample(note.x + note.width / 2, note.y, now);
          const elev    = elevationFactor(note.y, boardH);
          const shelter = shelterFactor(note, current, base);
          const crowd   = crowdFactor(note, current);
          effectiveWind = base * elev * shelter * crowd * sensitivity;
        }

        const next = integrateNote(
          phys,
          { windVelocity: effectiveWind, width: note.width, height: note.height },
          dt,
        );

        physicsRef.current.set(note.id, next);
        mv.set(angleToDeg(next.angle));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []); // reads everything through refs

  // ── board actions ──────────────────────────────────────────────────────────
  const addNote = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const { width: bw, height: bh } = board.getBoundingClientRect();
    const colorId = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)].id;
    const candidate = { x: 40 + Math.random() * (bw - 280), y: 40 + Math.random() * (bh - 280), width: 200, height: 200 };
    const others = notesRef.current.map((n) => ({ x: n.x, y: n.y, width: n.width, height: n.height }));
    const { x, y } = resolvePosition(candidate, others, bw, bh);
    const maxZ = notesRef.current.reduce((m, n) => Math.max(m, n.zIndex), 0);
    setNotes((prev) => [...prev, { ...createNote({ x, y, colorId }), zIndex: maxZ + 1 }]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<StickyNoteData>) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n))), []);

  const deleteNote = useCallback((id: string) =>
    setNotes((prev) => prev.filter((n) => n.id !== id)), []);

  const bringToFront = useCallback((id: string) =>
    setNotes((prev) => {
      const maxZ = prev.reduce((m, n) => Math.max(m, n.zIndex), 0);
      return prev.map((n) => (n.id === id ? { ...n, zIndex: maxZ + 1 } : n));
    }), []);

  const handleDrop = useCallback((id: string, rawX: number, rawY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const { width: bw, height: bh } = board.getBoundingClientRect();
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target) return prev;
      const others = prev.filter((n) => n.id !== id).map((n) => ({ x: n.x, y: n.y, width: n.width, height: n.height }));
      const { x, y } = resolvePosition({ x: rawX, y: rawY, width: target.width, height: target.height }, others, bw, bh);
      return prev.map((n) => (n.id === id ? { ...n, x, y } : n));
    });
  }, []);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={boardRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, color-mix(in srgb, var(--foreground) 16%, transparent) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Wind control — sits inside the sticky apps header bar (h-14 = 3.5rem) */}
      <div className="fixed top-0 right-6 h-14 flex items-center z-[200]">
        <WindControl
          isWindy={isWindy}
          enabled={windEnabled}
          sensitivity={windSensitivity}
          onToggle={(v) => setWindEnabled(v)}
          onSensitivity={(v) => setWindSensitivity(v)}
        />
      </div>

      {/* Notes */}
      {hydrated &&
        notes.map((note) => {
          // Create physics + MV on first render for this note (lazy, idempotent)
          if (!physicsRef.current.has(note.id))
            physicsRef.current.set(note.id, createInitialPhysicsState());
          if (!motionValuesRef.current.has(note.id))
            motionValuesRef.current.set(note.id, motionValue(0));
          const mv = motionValuesRef.current.get(note.id)!;
          return (
            <StickyNoteCard
              key={note.id}
              note={note}
              rotationMV={mv}
              onUpdate={(updates) => updateNote(note.id, updates)}
              onDelete={() => deleteNote(note.id)}
              onFocus={() => bringToFront(note.id)}
              onDrop={(x, y) => handleDrop(note.id, x, y)}
              onInteractStart={() => { interactingNoteRef.current = note.id; }}
              onInteractEnd={() => { if (interactingNoteRef.current === note.id) interactingNoteRef.current = null; }}
            />
          );
        })}

      {/* Add note FAB */}
      <motion.button
        type="button"
        onClick={addNote}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        className="absolute bottom-6 right-6 z-[9999] bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg shadow-primary/25"
        title="New sticky"
      >
        <Plus size={20} strokeWidth={2.5} />
      </motion.button>

      {/* Empty state */}
      {hydrated && notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-muted-foreground/40 text-sm font-mono">
            click <span className="font-bold text-muted-foreground/60">+</span> to pin a thought
          </p>
        </div>
      )}
    </div>
  );
}
