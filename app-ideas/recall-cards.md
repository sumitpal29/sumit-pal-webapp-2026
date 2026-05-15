# Recall Cards — Flashcard Study App

**Route:** `/apps/recall-cards`
**Storage:** LocalStorage (IndexedDB upgrade path)
**Stack:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui
**Algorithm:** SM-2 (adapted to sessions, not days)
**Markdown:** Reuses blog's existing markdown pipeline (ReactMarkdown + remarkGfm + rehypeHighlight)
**Tag map:** Hand-written `tag-map.json` for v1
**Mid-session refresh:** User toggle (preference saved to localStorage)

---

## Core idea

User picks study topics via tags → session queue builds from matching cards → card flips Q→A (answer rendered by type) → user self-rates 1–5 → SM-2 decides when card reappears. Source paths optionally link back to the original book passage with phrase-level highlighting. Progress and history persist to localStorage. Up to 4 paused sessions can coexist (FIFO stack).

---

## Infrastructure — Shared App Layout

All `/apps/*` routes and `/blogs/*` routes share a common layout layer:

### `app/apps/layout.tsx`

Wraps every app page with `AppsHeader`, a fixed bottom-left `ThemeToggle`, and the shared `Footer`.

### `app/blogs/layout.tsx`

Same pattern for blog routes — `AppsHeader` + `ThemeToggle` fixed bottom-left.

### `components/apps/apps-header.tsx`

Centered nav with three links only: **Home** (`/`), **Apps** (`/apps`), **Blogs** (`/blogs`).

- Active state: exact match for Home, `startsWith` for Apps and Blogs.
- No logo, no ThemeToggle (ThemeToggle lives fixed bottom-left in each layout).

### `app/apps/page.tsx`

Apps index at `/apps`. Shows all four lab apps in a 2-column grid:

- Live apps render as `<Link>` with green "live" badge.
- WIP apps render as `<div className="opacity-60 cursor-default">` with "soon" badge.
- Current apps: Recall Cards (live), Focus Timer (wip), Read Tracker (wip), Daily Standup (wip).

---

## Portfolio — Lab Section

### `components/portfolio/lab.tsx`

Homepage section (`03. Lab`) showcasing the apps:

- Uses shadcn `Carousel` with `dragFree: true` and `basis-[200px]` card items.
- Arrow buttons hidden on mobile (`hidden sm:flex`).
- Each card has a status dot (green = live, border-color = wip) and a "live"/"soon" badge.
- "Explore the Lab →" text CTA links to `/apps` with hover translate animation.

Homepage section order: About → Blog → Lab → Experience → Projects → Contact.

---

## Tag System — Inverted Index with Relevance

### Why tag-map.json

Without it: showing tags on the landing page means loading every deck JSON, parsing all cards, and aggregating. With `tag-map.json`: one ~2KB file renders all tag chips with counts instantly. Deck JSONs are lazy-loaded only when needed.

```
Landing page  →  fetch tag-map.json only
User selects  →  look up which deck files are needed
Session       →  fetch only those deck JSONs, filter + sort cards
```

### tag-map.json structure

```json
{
  "react": {
    "label": "React",
    "description": "React fundamentals, hooks, rendering, component patterns",
    "decks": [
      { "file": "react-hooks.json", "relevance": 1.0 },
      { "file": "react-beginner.json", "relevance": 0.9 },
      { "file": "best-interview-questions.json", "relevance": 0.7 }
    ],
    "related": ["hooks", "javascript", "frontend-interview", "performance"],
    "cardCount": 47
  },
  "frontend-interview": {
    "label": "Frontend Interview",
    "description": "Mixed bag — JS, React, CSS, system design for interviews",
    "decks": [
      { "file": "best-interview-questions.json", "relevance": 1.0 },
      { "file": "react-hooks.json", "relevance": 0.6 },
      { "file": "javascript-core.json", "relevance": 0.8 }
    ],
    "related": ["react", "javascript", "css", "system-design"],
    "cardCount": 112
  }
}
```

**`relevance`** (0–1): how central this tag is to the deck. Used to sort cards in session queue — higher relevance floats up.

**`related`**: powers "Also try:" suggestions when a user selects a tag (rendered inline in `TagSelector.tsx`, not a separate component).

**`cardCount`**: pre-computed count shown on the tag chip without loading decks.

**Maintenance:** Hand-written for v1. v2 adds `scripts/generate-tag-map.ts` that scans all deck JSONs and rebuilds the file automatically.

---

## Card Schema

```typescript
// The three rendering modes for an answer
type AnswerType = "text" | "markdown" | "code";

interface Card {
  id: string;                // "biq-react-001" — deck-prefix + sequential

  question: string;          // plain text or inline markdown
  answer: string;            // required — content varies by answerType
  answerType: AnswerType;    // defaults to "markdown" if omitted
  answerLanguage?: string;   // only when answerType === "code" e.g. "typescript"

  hint?: string;             // shown as a nudge before the user flips
  description?: string;      // extra context shown collapsed below the answer

  tags: string[];            // card-level tags (union with deck-level tags)

  source?: CardSource;
}

interface CardSource {
  // CMS path convention:
  //   /projectname/books/bookname/chapter-folder/pagename
  path: string;

  // Extract a specific heading block from the fetched markdown.
  // Pulls everything from "## <section>" until the next same-level heading.
  section?: string;

  // After rendering, wrap this exact phrase in <mark> for visual emphasis.
  highlight?: string;
}

interface CardDeck {
  id: string;           // "best-interview-questions"
  title: string;        // "Best of Interview Questions"
  description?: string;
  tags: string[];       // deck-level tags — all cards in this deck inherit them
  cards: Card[];
}
```

### answerType explained

| Type | When to use | How it renders |
| ---- | ----------- | -------------- |
| `"text"` | Simple one-liners, definitions | `<p>` plain text, no parsing |
| `"markdown"` | Most cards — prose + inline code + lists + code blocks | Blog markdown pipeline |
| `"code"` | Answer is entirely a code snippet | Single syntax-highlighted block; `answerLanguage` sets the highlighter |

`"markdown"` is the default when `answerType` is omitted. `"code"` is a convenience so you don't need to wrap fences in the JSON — just set `answerLanguage: "typescript"` and write the code directly in `answer`.

---

## Source Highlight — How it Works

Two-level: `section` coarse-extracts a heading block; `highlight` fine-pins a phrase inside it.

**Status: v2 (not yet implemented).** The `source.path` field is stored in card data but `BookSourceDrawer` and `markdown-excerpt.ts` are not built yet. The card still works fully without them.

---

## SM-2 Algorithm

```typescript
// lib/recall-cards/scheduler.ts

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

// UI uses 1–5; SM-2 internally uses 0–5 quality scale (no 2 in SM-2)
function toQuality(rating: number): number {
  const map: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 };
  return map[rating] ?? 3;
}

export function applyRating(p: CardProgress, rating: number): CardProgress {
  const q = toQuality(rating);
  let { easeFactor, interval, repetitions } = p;

  if (q >= 3) {
    interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(MIN_EASE, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  return { ...p, easeFactor, interval, repetitions,
    totalReviews: p.totalReviews + 1, lastRating: rating,
    lastReviewedAt: new Date().toISOString(), sessionsSinceReview: 0 };
}

// Call at session start — bumps counters for all tracked cards
export function tickSession(store: Record<string, CardProgress>) { ... }

export const isDue = (p: CardProgress) => p.sessionsSinceReview >= p.interval;
export const shouldRequeue = (rating: number) => rating <= 2;
```

**Interval progression for a card answered 5 every time:**
1 → 6 → 15 → 37 → 92 sessions before it reappears.

---

## LocalStorage Schema

```typescript
// "recall-cards:progress" — SM-2 state per card
type ProgressStore = Record<string, CardProgress>;

// "recall-cards:sessions" — FIFO stack of up to 4 paused sessions
//   (early plan used "recall-cards:session" single object — now an array)
type SessionStack = ActiveSession[];  // max 4, evicts oldest on overflow (FIFO)

interface ActiveSession {
  id: string;           // uuid
  tags: string[];       // sorted tag set — used for match lookup
  queue: string[];      // remaining card ids
  completed: string[];
  ratings: Record<string, number>;
  startedAt: string;
  resumeOnRefresh: boolean;
}

// "recall-cards:prefs" — user preferences
interface UserPrefs {
  resumeSessionOnRefresh: boolean; // default: true
}

// "recall-cards:history" — past session log
interface SessionHistory {
  sessions: SessionRecord[];
}
```

### Session stack — FIFO, max 4

`storage.ts` maintains an ordered array under `recall-cards:sessions`:

| Function | Behaviour |
| --- | --- |
| `getSessions()` | Returns full array |
| `getSessionForTags(tags)` | Finds by sorted tag-set match |
| `upsertSession(session)` | Updates in-place by id; if new, prepends and slices to MAX_SESSIONS=4 |
| `removeSession(id)` | Filters out by id |
| `clearAllSessions()` | Removes the key entirely |

### Mid-session refresh toggle

A `SessionToggle` component (shadcn Popover + Switch) in the session header:

```text
⚙  Session options
────────────────────────────────
Resume on refresh    [toggle ON]
  "Pick up where you left off
   if you close or refresh."
```

When ON (default): `upsertSession()` is called on every card action.
When OFF: refresh starts a fresh queue.

---

## Session Flow

```text
Landing (/apps/recall-cards)
  ├── Fetch tag-map.json → render tag chips (label + count)
  ├── Select tag → show "Also try:" chip suggestions (from related[])
  ├── Multi-select → "Start Session (N cards)"
  └── Paused sessions section (if any exist in recall-cards:sessions)
      ├── Up to 4 rows: tag chips · queue count · Resume button · X button
      └── X → confirm("Your card progress is safe — only the current queue
                        will be lost.") → removeSession(id)

Session (/apps/recall-cards/session?tags=react,hooks)
  ├── On load:
  │   ├── getSessionForTags(tags) → resume if found + resumeOnRefresh=true
  │   └── Otherwise: build fresh queue
  │       ├── tag-map lookup → which deck files needed
  │       ├── Parallel-fetch deck JSONs
  │       ├── Merge + deduplicate cards by id
  │       ├── tickSession() on all progress entries
  │       ├── Filter: isDue() or no progress yet
  │       └── Sort: relevance desc, shuffle within tiers
  │
  ├── Study loop:
  │   ├── Question side (+ hint button reveals hint text inline)
  │   ├── Skip button → advances without rating
  │   ├── Flip → answer rendered by answerType
  │   │         + description in <details> if present
  │   ├── RatingBar 1–5 (Blank/Wrong/Hard/Good/Easy)
  │   │   Keyboard: digits 1–5 call onRate via useEffect
  │   └── On rate:
  │       ├── ≤ 2 → requeue at ~30% remaining position
  │       └── ≥ 3 → applyRating(), upsertSession(), persist progress
  │
  └── Session Summary (SessionSummary.tsx):
      ├── Cards reviewed · avg rating · revisit count
      ├── Rating distribution bar chart
      └── Study Again | Change Tags | History

History (/apps/recall-cards/history)
  ├── "N sessions" count
  ├── "Reset all" button (confirm → saveProgress({}) + clearAllSessions())
  └── SessionHistoryList: expandable rows
      └── Expand → per-rating breakdown
```

---

## Components

| Component | What it does |
| --- | --- |
| `TagSelector.tsx` | Multi-select tag chips with count badges; "Also try:" suggestions inline from `related[]` |
| `FlashCard.tsx` | AnimatePresence x-slide flip between question/answer faces; hint reveal inline; Skip button |
| `AnswerRenderer.tsx` | Switches on `answerType`: text → `<p>`, code → fenced block → ReactMarkdown, markdown → ReactMarkdown |
| `RatingBar.tsx` | 5 buttons (Blank/Wrong/Hard/Good/Easy), color-coded; keyboard 1–5 via useEffect |
| `SessionToggle.tsx` | shadcn Popover + Switch for resume-on-refresh preference |
| `SessionSummary.tsx` | End-of-session stats: cards, avg rating, revisit count, distribution bar |
| `SessionHistoryList.tsx` | Expandable session rows: date, tags, cards, duration, avg rating |
| `answer.module.css` | Scoped prose styles for card answers; mirrors blog-post.module.css but smaller; includes hljs theme and mark highlight styles |

`RelatedTagSuggestions` and `HintButton` are **not** separate files — they are inline within `TagSelector.tsx` and `FlashCard.tsx` respectively.

---

## Folder Structure

```text
app/
  apps/
    layout.tsx                          # Shared: AppsHeader + ThemeToggle + Footer
    page.tsx                            # /apps index — 4 app cards grid
    recall-cards/
      page.tsx                          # Tag selection + paused sessions stack
      session/page.tsx                  # Active study session
      history/page.tsx                  # Session history timeline
  blogs/
    layout.tsx                          # Shared: AppsHeader + ThemeToggle

components/
  apps/
    apps-header.tsx                     # Centered nav: Home | Apps | Blogs
    recall-cards/
      TagSelector.tsx
      FlashCard.tsx
      AnswerRenderer.tsx
      RatingBar.tsx
      SessionToggle.tsx
      SessionSummary.tsx
      SessionHistoryList.tsx
      answer.module.css
  portfolio/
    lab.tsx                             # Homepage Lab section (Carousel)

lib/
  recall-cards/
    types.ts                            # All shared interfaces
    scheduler.ts                        # SM-2 pure functions
    storage.ts                          # Typed localStorage helpers (session stack API)
    deck-loader.ts                      # Fetch by tag, merge, dedup, sort

public/
  data/
    recall-cards/
      tag-map.json                      # Inverted tag index (hand-maintained v1)
      decks/
        react-hooks.json                # 8 cards — useMemo, useCallback, useEffect, etc.
        javascript-core.json            # 8 cards — closures, event loop, debounce, etc.
```

> Note: data files must be in `public/data/` (not `data/`) so Next.js serves them as static files for `fetch('/data/...')` in client components.

---

## v1 Build Checklist

- [x] `tag-map.json` with 4 tags, 2 deck files
- [x] 2 starter decks (8 cards each, mixed `answerType`)
- [x] `types.ts` — all shared interfaces
- [x] `scheduler.ts` — SM-2 pure functions
- [x] `storage.ts` — session stack API (FIFO, max 4)
- [x] `deck-loader.ts` — fetch by tag, merge, dedup, relevance sort
- [x] Landing page — tag chips, card count, "Also try" suggestions, paused sessions stack
- [x] Session page — build queue, study loop, rating, upsert session on every action
- [x] `AnswerRenderer` — switches on `answerType` (text / markdown / code)
- [x] `FlashCard` — x-slide flip animation, hint reveal, Skip button
- [x] `RatingBar` — 1–5 buttons + keyboard shortcuts (1–5 keys)
- [x] `SessionToggle` — resume-on-refresh preference popover
- [x] `SessionSummary` — end-of-session stats + distribution
- [x] `SessionHistoryList` — expandable history rows
- [x] Session history page with Reset All
- [x] `app/apps/layout.tsx` — shared header/footer for all app routes
- [x] `app/blogs/layout.tsx` — shared header for blog routes
- [x] `components/apps/apps-header.tsx` — Home | Apps | Blogs nav
- [x] `app/apps/page.tsx` — apps index page
- [x] `components/portfolio/lab.tsx` — Lab section with Carousel

## v2 / Later

- [ ] `BookSourceDrawer` — lazy CMS fetch + rendered excerpt with `<mark>` highlight
- [ ] `lib/recall-cards/markdown-excerpt.ts` — `extractSection` + `applyHighlight`
- [ ] Export/import progress JSON
- [ ] Mastery % per tag on landing
- [ ] `scripts/generate-tag-map.ts` — auto-rebuild tag-map from deck JSONs
- [ ] Pull decks from GitHub CMS instead of bundled static JSON
