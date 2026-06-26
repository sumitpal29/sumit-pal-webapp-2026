# Sticky Notes App — Feature & Architecture Deep-Dive

## Overview

The Sticky Notes app is a physics-driven, freeform canvas where users can create, arrange, and style digital sticky notes. It lives at `/apps/sticky-notes` and fills the full viewport below the global 56 px app header. Notes persist across sessions via `localStorage` with no backend dependency.

---

## Architecture

| Layer | Files | Responsibility |
|---|---|---|
| Page | `app/apps/sticky-notes/page.tsx` | Mounts the canvas; sets viewport height via `calc(100dvh - 3.5rem)` |
| Board | `components/apps/sticky-notes/StickyBoard.tsx` | State, physics rAF loop, wind sampling, CRUD orchestration |
| Card | `components/apps/sticky-notes/StickyNoteCard.tsx` | Per-note rendering, drag, resize, edit, customisation popover |
| Wind UI | `components/apps/sticky-notes/WindControl.tsx` | Popover toggle + sensitivity slider in the header bar |
| Screw | `components/apps/sticky-notes/ScrewHead.tsx` | Decorative SVG Phillips-head screw (colour picker UI element) |
| Physics | `lib/sticky-notes/physics.ts` | Pendulum simulation — spring + damping + wind torque |
| Wind | `lib/sticky-notes/wind.ts` | 3-octave simplex-noise wind field generator |
| Storage | `lib/sticky-notes/storage.ts` | `localStorage` load/save under key `sticky-notes-v1` |
| Utils | `lib/sticky-notes/utils.ts` | Color palette, font registry, `createNote`, overlap resolution |
| Types | `lib/sticky-notes/types.ts` | `StickyNoteData` interface |
| Text render | `lib/brain-dump/text-render.ts` | Shared Markdown-to-block parser (shared with Brain Dump app) |

---

## Features

### 1. Freeform Canvas

- Notes are absolutely positioned on a full-viewport board with a subtle dot-grid background (`radial-gradient`, 28 px grid).
- Any number of notes can coexist simultaneously; there is no hard limit.
- The board does not scroll — notes are constrained within the visible bounds via position clamping.

### 2. Create Notes

- A floating action button (FAB) in the bottom-right corner (`+` icon) creates a new note.
- The new note is placed at a random position with a 40 px margin from the edges.
- Color is randomly chosen from the six available palette colors.
- Default size is **200 × 200 px**; minimum 150 px, maximum 340 px on each axis.
- Each note gets a `crypto.randomUUID()` id and a `createdAt` timestamp.

### 3. Drag & Drop

- Notes are dragged by their header bar (cursor changes to `grab` / `grabbing`).
- Uses raw `mousemove`/`mouseup` listeners on `window` for smooth tracking outside the element bounds.
- On `mouseup`, the final position is passed through the **overlap resolver** before being committed to state, preventing notes from sitting on top of each other.
- Clicking/dragging any note brings it to the front (increments `zIndex` above the current maximum).
- Wind physics are paused for the note being dragged (`interactingNoteRef`).

### 4. Overlap Resolution

- `resolvePosition` in `utils.ts` runs up to 40 push-away iterations.
- At each step it picks the minimum push direction (right / left / down / up) to separate the overlapping pair, with a 10 px gap.
- Applied both when placing a new note and when dropping an existing note after a drag.

### 5. Resize

- A resize grip (SE-corner diagonal icon) is rendered at the bottom-right of every note.
- Dragging it constrains width and height between **150 px – 340 px**.
- Implemented with the same `mousemove`/`mouseup` pattern as drag.

### 6. Inline Markdown Rendering

Notes render a lightweight subset of Markdown in view mode, powered by the shared `parseBlocks` parser:

| Syntax | Rendered as |
|---|---|
| `# Heading` | `<p>` at 1.3× base font size, bold |
| `## Heading` | `<p>` at 1.15× base font size, bold |
| `### Heading` | `<p>` at 1× base font size, semi-bold, 80% opacity |
| `- item` / `* item` | Bullet paragraph with `•` prefix |
| `---` | `<hr>` with 20% opacity |
| `**bold**` | `<strong>` |
| `*italic*` / `_italic_` | `<em>` |
| `` `code` `` | Mono `<code>` with semi-transparent background |
| `~~strike~~` | `<del>` at 60% opacity |
| `https://…` | Clickable `<a>` that opens in a new tab |

Switching from view to edit mode shows the raw Markdown source in a `<textarea>`. Clicking outside the textarea (blur) exits edit mode.

### 7. Color Palette

Six built-in color themes, each with three coordinated hex values (`bg`, `header`, `text`):

| Name | Background | Header | Text |
|---|---|---|---|
| Yellow | `#FEF9C3` | `#FDE047` | `#713f12` |
| Pink | `#FCE7F3` | `#F9A8D4` | `#831843` |
| Blue | `#DBEAFE` | `#93C5FD` | `#1e3a5f` |
| Green | `#DCFCE7` | `#86EFAC` | `#14532d` |
| Purple | `#F3E8FF` | `#C084FC` | `#581c87` |
| Peach | `#FFEDD5` | `#FDBA74` | `#7c2d12` |

Color is changed via the customisation popover (palette icon in the header on hover). The active color is highlighted with a thicker border.

### 8. Font Selection

Six fonts available in the customisation popover, with live previews using the "Ag" glyph:

| ID | Label | Family | Source |
|---|---|---|---|
| `default` | Default | `inherit` (system) | Built-in |
| `playwrite` | Playwrite | Playwrite AU TAS | Google Fonts |
| `lavishly` | Lavishly | Lavishly Yours | Google Fonts |
| `festive` | Festive | Festive | Google Fonts |
| `fascinate` | Fascinate | Fascinate Inline | Google Fonts |
| `bitcount` | Bitcount | Bitcount Grid Single | Google Fonts |

Google Fonts stylesheets are **lazily injected** into `<head>` on first use. Preconnect links for `fonts.googleapis.com` and `fonts.gstatic.com` are also injected idempotently. When the palette popover opens, all fonts are preloaded so previews render immediately.

### 9. Font Size

Six discrete sizes selectable from the popover: **11, 12, 13 (default), 14, 16, 18** px.

### 10. Note Angle (Fixed Tilt)

Five angle presets selectable from the popover: **-10°, -5°, 0°, +5°, +10°**.

This is a decorative static tilt (`fixedAngle` stored in the note). Wind physics oscillates around this fixed angle — they are additive at render time via `useTransform(rotationMV, v => v + fixedAngle)`.

### 11. Wind Physics

The most technically sophisticated feature. All notes physically react to a simulated wind field:

**Wind Field (`wind.ts`)**
- Built on **3-octave simplex noise** from the `simplex-noise` package.
- Four independent noise layers with deterministic seeds:
  - **Primary** — large slow sweeps (~8 s cycle, ~1200 px spatial scale), 60% weight
  - **Gust** — medium turbulence bursts (~2 s, ~400 px scale), 28% weight
  - **Flutter** — high-frequency micro-tremor per position (~0.6 s), 12% weight
  - **Envelope** — global amplitude modulator creating genuine calm spells (~20–40 s); output is ~35% of the time at zero (dead calm)
- Output velocity range: **–55 to +55** (nominal units)

**Per-Note Physics (`physics.ts`)**
- Models each note as a **pendulum plate** pivoting from its top-center.
- Euler integration at each animation frame (`requestAnimationFrame`).
- Forces:
  - Wind torque proportional to note area (width × height factor)
  - Spring restoring force (`SPRING_K = 14`) pulling back to 0°
  - Viscous damping (`DAMPING = 4.2`) — underdamped so slight natural oscillation occurs
- Maximum angle capped at **~20°** (`MAX_ANGLE = 0.36 rad`)
- **Sleep optimization**: if wind velocity < 0.6 and angle/velocity near zero, integration is skipped entirely to avoid endless micro-oscillations.

**Wind Modifiers (per note, in `StickyBoard.tsx`)**
- **Elevation factor**: notes higher on the board (smaller `y`) feel more wind (up to 1.35× at the top, down to 0.7× at the bottom)
- **Shelter factor**: a note upwind of the target within a 30° cone reduces the target's effective wind by up to 50%, based on distance and relative size
- **Crowd factor**: each neighboring note within 320 px reduces wind by 7%, floored at 0.72×

**Render path**: physics runs entirely outside React using `MotionValue` from Framer Motion. The rAF loop calls `motionValue.set()` directly — zero React re-renders per frame.

**Wind Control UI (`WindControl.tsx`)**
- Fixed to the top-right of the header bar (z-index 200).
- Wind icon animates with a horizontal oscillation when wind is blowing.
- Popover contains:
  - **On/Off toggle** (shadcn `Switch`)
  - **Sensitivity slider** from 0.25× to 2.0× in 0.25 steps (shadcn `Slider`)
  - Five named presets: `barely`, `gentle`, `normal`, `breezy`, `stormy`
- Settings persist to `localStorage` under key `sticky-notes-wind-v1`.

### 12. Persistence

- All notes are saved to `localStorage` under key `sticky-notes-v1` as a JSON array of `StickyNoteData`.
- Saves fire on every state update (guarded by a `hydrated` flag to avoid writing the empty pre-load state).
- Wind settings (enabled + sensitivity) are saved separately under `sticky-notes-wind-v1`.
- SSR-safe: both load functions guard `typeof window === 'undefined'`.

### 13. Z-Index / Layering

- Every note has an integer `zIndex`.
- Clicking or starting a drag on any note calls `bringToFront`, which sets its `zIndex` to `max(all zIndexes) + 1`.
- No zIndex recycling — values grow monotonically per session.

### 14. Delete

- The `×` button in the top-right of the header bar removes the note from state.
- Button is hidden by default and fades in on group hover (`opacity-0 group-hover:opacity-65`).

### 15. Empty State

When no notes exist, a centered hint text `click + to pin a thought` is shown with muted styling.

### 16. Customisation Popover

Triggered by the palette icon (left side of header, visible on hover). Built with shadcn `Popover`. Contains all customisation controls in one compact panel (188 px wide): colour, angle, font family, and font size. Styled to match the note's current color (`backgroundColor: color.bg`).

### 17. Decorative Screw Head (ScrewHead.tsx)

An SVG Phillips-head screw used as the colour picker affordance. Visually distinguishes active vs. inactive states:
- **Active**: driven-in look — darker metallic gradient, recessed disc, prominent deep slot, inset shadow
- **Inactive**: raised/proud look — lighter gradient, specular highlight, subtle drop shadow
- Scales up 10% on hover.

---

## Pros

- **Zero backend required** — fully client-side with `localStorage`; works offline and deploys cheaply.
- **Performant physics** — rAF loop writes to `MotionValue` directly, bypassing React's reconciler entirely. No re-renders per frame.
- **Sleep optimization** — idle notes skip integration entirely, keeping CPU near-zero during calm spells.
- **Spatially coherent wind** — notes near each other behave realistically; upwind notes shelter downwind ones; elevated notes feel more wind.
- **Markdown support** — richer than a plain `<textarea>`, enabling light structure (headings, bullets, links, code) without a heavy editor library.
- **Lazy font loading** — Google Fonts stylesheets are only fetched when actually selected, not on page load.
- **Overlap resolver** — notes never pile directly on top of each other after a drop or creation.
- **Customisation depth** — 6 colors × 6 fonts × 6 sizes × 5 angles = 1080 visual combinations per note.
- **No React re-renders for animation** — Framer Motion's `MotionValue` + `useTransform` keeps the wind animation entirely in the motion layer.
- **Wind interaction pause** — physics stops for whichever note the user is actively dragging or typing in, preventing fighting between user intent and simulation.
- **Sensible defaults** — notes start at 200 × 200 px, angle 0°, default font, size 13, random color — immediately usable.

---

## Cons / Limitations

- **No multi-device sync** — `localStorage` is per-browser. Notes created on one device are invisible on another.
- **No undo/redo** — deleting a note is permanent and immediate with no recovery.
- **Mouse-only drag** — the drag implementation uses `mousedown`/`mousemove`/`mouseup` events. Touch devices (mobile, tablet) cannot drag notes.
- **Finite board** — the canvas doesn't scroll or zoom. On small viewports, the usable area is limited, and notes are hard-clamped to visible bounds.
- **zIndex never resets** — `zIndex` grows monotonically per session. After many bring-to-front operations the values grow large (though still safe for CSS).
- **Overlap resolver is greedy, not optimal** — up to 40 push-away iterations may not find a valid non-overlapping layout when the board is densely packed, potentially leaving notes partially off-screen.
- **No note grouping or linking** — notes are entirely independent; there is no way to connect, group, or reference them.
- **No export** — notes cannot be exported to PDF, image, or any other format.
- **No search or filter** — with many notes, finding specific content requires visual scanning.
- **Font loading is sequential** — opening the palette loads all 5 Google Fonts, which may cause a brief layout flash on slow connections.
- **No resize on touch** — the resize grip also relies on mouse events.
- **Wind affects rotation only** — notes do not drift in position due to wind; only angular rotation is simulated.
- **Sensitivity range is coarse** — the slider steps in 0.25 increments across only 8 positions; fine-grained control is limited.

---

## Data Model

```ts
interface StickyNoteData {
  id: string;          // crypto.randomUUID()
  content: string;     // raw Markdown text
  colorId: string;     // 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'peach'
  fontId?: string;     // 'default' | 'playwrite' | 'lavishly' | 'festive' | 'fascinate' | 'bitcount'
  fontSize?: number;   // 11 | 12 | 13 | 14 | 16 | 18 (default: 13)
  x: number;           // left position in px
  y: number;           // top position in px
  width: number;       // 150–340 px
  height: number;      // 150–340 px
  fixedAngle: number;  // decorative tilt in degrees (–15 … +15)
  zIndex: number;      // stacking order
  createdAt: number;   // Date.now() timestamp
}
```

---

## Dependencies Used

| Package | Purpose |
|---|---|
| `framer-motion` | Physics animation via `MotionValue`, `useTransform`, `motion.div`; FAB hover/tap animations |
| `simplex-noise` | 3-octave coherent noise for the wind field |
| `lucide-react` | `Plus`, `X`, `Palette`, `Wind` icons |
| shadcn `Popover` | Customisation panel and wind control panel |
| shadcn `Switch` | Wind on/off toggle |
| shadcn `Slider` | Wind sensitivity control |
