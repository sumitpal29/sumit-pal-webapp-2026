# Design Themes — Complete Reference

## Overview

The project uses a **CSS custom property–based theming system** wired through Tailwind CSS v4 and [next-themes](https://github.com/pacocoursey/next-themes). All color, radius, and typography values live as CSS variables on class selectors (`:root`, `.candy`, `.light`, `.dark`). Tailwind reads these at build time via `@theme inline` and exposes them as utility classes (`bg-background`, `text-primary`, etc.) across the entire app.

There are **three user-selectable themes** — Candy (default), Light, and Dark — plus a legacy `:root` warm-yellow base that is superseded by the active theme class at runtime. A fourth definition (`:root-dark-x` in `styles/globals.css`) exists as a commented-out experiment and is never applied.

---

## Theme Infrastructure

### Files

| File | Role |
|---|---|
| `app/globals.css` | Master theme definitions — `:root`, `.candy`, `.light`, `.dark`. Also defines `@theme inline` (Tailwind token bridge) and `@layer base` (global HTML element styles). |
| `styles/globals.css` | Secondary sheet imported by some sub-routes. Contains its own `:root` and `.dark` — values differ slightly from the master (e.g. `--radius: 0.625rem` vs `0.5rem`). |
| `components/portfolio/theme-provider.tsx` | Wraps the app in `NextThemesProvider`. Sets `attribute="class"`, `defaultTheme="candy"`, `themes={['candy','light','dark']}`, `enableSystem={false}`. |
| `components/portfolio/theme-toggle.tsx` | Three-button pill UI (Lollipop / Sun / Moon icons) rendered in all layouts. Calls `setTheme()` from `next-themes`. Active theme button gets `bg-primary text-primary-foreground` highlight. |
| `components/theme-provider.tsx` | Generic passthrough wrapper (used by non-portfolio routes). |

### How it works at runtime

1. `next-themes` writes the active theme name as a class on `<html>` (e.g. `<html class="candy">`).
2. CSS cascade: `.candy` variables override `:root` variables.
3. Tailwind's `@theme inline` block re-exports every `var(--*)` as a named color token so utilities like `bg-background` always resolve to whatever `:root` / `.candy` / `.light` / `.dark` declares.
4. `@custom-variant dark (&:is(.dark *))` makes Tailwind's `dark:` prefix respond to the `.dark` class rather than `prefers-color-scheme`.

---

## Theme 1 — Candy (Default)

**Class:** `.candy` | **Icon:** Lollipop | **Mood:** Dark background, neon accents, retro-candy energy

This is the signature theme of the portfolio. A near-black charcoal surface with saturated yellow and green pops. The yellow `#fad312` is the brand color shared across all themes.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#2a2a2a` | Page / canvas background (near-black charcoal) |
| `--foreground` | `#fffae3` | Body text, icons (warm off-white) |
| `--primary` | `#fad312` | Brand yellow — buttons, active states, focus rings, links |
| `--primary-foreground` | `#2a2a2a` | Text on primary-colored surfaces |
| `--secondary` | `#87ff8b` | Neon mint-green accents |
| `--secondary-foreground` | `#2a2a2a` | Text on secondary-colored surfaces |
| `--accent` | `#fad312` | Same as primary (accent = brand yellow) |
| `--accent-foreground` | `#2a2a2a` | Text on accent surfaces |
| `--muted` | `#3a3a3a` | Subtle background fills (slightly lighter than bg) |
| `--muted-foreground` | `#fffae3` | De-emphasized text (same warm off-white) |
| `--border` | `#4a4a4a` | Dividers, input borders |
| `--input` | `#1a1a1a` | Input field background (darkest layer) |
| `--ring` | `#fad312` | Focus ring (brand yellow) |
| `--card` | `#1a1a1a` | Card / popover surface (darkest layer) |
| `--card-foreground` | `#fffae3` | Text on cards |
| `--popover` | `#1a1a1a` | Popover background |
| `--popover-foreground` | `#fffae3` | Text in popovers |
| `--destructive` | `#ff6b6b` | Errors, delete actions |
| `--destructive-foreground` | `#ffffff` | Text on destructive surfaces |

### Sidebar Tokens

| Token | Value |
|---|---|
| `--sidebar` | `#1a1a1a` |
| `--sidebar-foreground` | `#fffae3` |
| `--sidebar-primary` | `#fad312` |
| `--sidebar-primary-foreground` | `#1a1a1a` |
| `--sidebar-accent` | `#87ff8b` |
| `--sidebar-accent-foreground` | `#1a1a1a` |
| `--sidebar-border` | `#4a4a4a` |
| `--sidebar-ring` | `#fad312` |

### Chart Colors

| Token | Value | Role |
|---|---|---|
| `--chart-1` | `#fad312` | Primary data series (yellow) |
| `--chart-2` | `#87ff8b` | Secondary data series (green) |
| `--chart-3` | `#fffae3` | Tertiary (warm white) |
| `--chart-4` | `#ea80fc` | Quaternary (lavender-pink) |
| `--chart-5` | `#ffab91` | Quinary (peach) |

### Visual Character

- Three-layer depth: `#1a1a1a` (deep) → `#2a2a2a` (mid / bg) → `#3a3a3a` (muted)
- High contrast: warm off-white `#fffae3` on charcoal gives excellent readability
- Neon duality: yellow (energy, CTA) + green (success, secondary), both punchy on dark

---

## Theme 2 — Light

**Class:** `.light` | **Icon:** Sun | **Mood:** Clean, high-contrast, professional

A conventional light theme with crisp white surfaces and a blue primary. Intended for maximum readability in bright environments.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#ffffff` | Pure white page background |
| `--foreground` | `#1f2937` | Near-black body text (Tailwind gray-800) |
| `--primary` | `#2563eb` | Blue-600 — buttons, links, focus rings |
| `--primary-foreground` | `#ffffff` | White text on blue |
| `--secondary` | `#4b5563` | Gray-600 for secondary elements |
| `--secondary-foreground` | `#ffffff` | White on secondary |
| `--accent` | `#2563eb` | Same as primary |
| `--accent-foreground` | `#ffffff` | White on accent |
| `--muted` | `#f3f4f6` | Gray-100 subtle backgrounds |
| `--muted-foreground` | `#6b7280` | Gray-500 de-emphasized text |
| `--border` | `#e5e7eb` | Gray-200 borders |
| `--input` | `#e5e7eb` | Gray-200 input border/bg |
| `--ring` | `#2563eb` | Blue focus ring |
| `--card` | `#ffffff` | White card surfaces |
| `--card-foreground` | `#1f2937` | Dark text on cards |
| `--popover` | `#ffffff` | White popovers |
| `--popover-foreground` | `#1f2937` | Dark text in popovers |
| `--destructive` | `#ef4444` | Red-500 errors |
| `--destructive-foreground` | `#ffffff` | White on destructive |

### Sidebar Tokens

| Token | Value |
|---|---|
| `--sidebar` | `#f9fafb` (gray-50) |
| `--sidebar-foreground` | `#1f2937` |
| `--sidebar-primary` | `#2563eb` |
| `--sidebar-primary-foreground` | `#ffffff` |
| `--sidebar-accent` | `#e5e7eb` |
| `--sidebar-accent-foreground` | `#1f2937` |
| `--sidebar-border` | `#e5e7eb` |
| `--sidebar-ring` | `#2563eb` |

### Chart Colors

| Token | Value |
|---|---|
| `--chart-1` | `#2563eb` (blue) |
| `--chart-2` | `#10b981` (emerald) |
| `--chart-3` | `#f59e0b` (amber) |
| `--chart-4` | `#6366f1` (indigo) |
| `--chart-5` | `#ec4899` (pink) |

### Visual Character

- Entirely neutral / achromatic surface: pure white + gray scale
- Blue primary is the only strong hue — creates clear visual hierarchy
- Chart palette is maximally diverse (blue, green, amber, indigo, pink) for data legibility
- Standard enterprise-style appearance; familiar to productivity tool users

---

## Theme 3 — Dark

**Class:** `.dark` | **Icon:** Moon | **Mood:** Deep, accessible, developer-focused

A true dark theme with high-contrast blue accents on near-black backgrounds. Designed for low-light environments and long reading sessions.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#111827` | Gray-900 deep dark background |
| `--foreground` | `#f9fafb` | Gray-50 near-white body text |
| `--primary` | `#93c5fd` | Blue-300 — soft bright blue for dark context |
| `--primary-foreground` | `#111827` | Dark text on primary |
| `--secondary` | `#9ca3af` | Gray-400 for secondary elements |
| `--secondary-foreground` | `#111827` | Dark on secondary |
| `--accent` | `#93c5fd` | Same as primary (blue-300) |
| `--accent-foreground` | `#111827` | Dark on accent |
| `--muted` | `#374151` | Gray-700 subtle backgrounds |
| `--muted-foreground` | `#9ca3af` | Gray-400 de-emphasized text |
| `--border` | `#374151` | Gray-700 borders |
| `--input` | `#374151` | Gray-700 input backgrounds |
| `--ring` | `#93c5fd` | Blue-300 focus ring |
| `--card` | `#1f2937` | Gray-800 card surfaces |
| `--card-foreground` | `#f9fafb` | Near-white text on cards |
| `--popover` | `#1f2937` | Gray-800 popovers |
| `--popover-foreground` | `#f9fafb` | Near-white in popovers |
| `--destructive` | `#ef4444` | Red-500 errors |
| `--destructive-foreground` | `#f9fafb` | Near-white on destructive |

### Sidebar Tokens

| Token | Value |
|---|---|
| `--sidebar` | `#111827` |
| `--sidebar-foreground` | `#f9fafb` |
| `--sidebar-primary` | `#93c5fd` |
| `--sidebar-primary-foreground` | `#111827` |
| `--sidebar-accent` | `#374151` |
| `--sidebar-accent-foreground` | `#f9fafb` |
| `--sidebar-border` | `#374151` |
| `--sidebar-ring` | `#93c5fd` |

### Chart Colors

| Token | Value |
|---|---|
| `--chart-1` | `#60a5fa` (blue-400) |
| `--chart-2` | `#34d399` (emerald-400) |
| `--chart-3` | `#fbbf24` (amber-400) |
| `--chart-4` | `#818cf8` (indigo-400) |
| `--chart-5` | `#f472b6` (pink-400) |

### Visual Character

- Two-layer dark surface: `#111827` (bg) / `#1f2937` (card) — standard 800/900 Tailwind split
- Blue lightened to 300 as primary (avoids accessibility issues of dark blue on dark bg)
- Chart palette mirrors Light theme's hues at 400-level brightness for dark-surface legibility
- The `--muted-foreground` and `--secondary` collapse to the same gray-400 — de-emphasis is uniform

---

## Legacy `:root` Base (Warm Yellow Light)

**Defined in:** `app/globals.css` `:root` block  
**Applied when:** No theme class is on `<html>` (i.e., during SSR before hydration or if `next-themes` hasn't loaded).  
**Note:** `next-themes` defaults to `candy` so this base is almost never visible in production, but serves as the SSR fallback.

### Key Values

| Token | Value |
|---|---|
| `--background` | `#fffae3` (warm cream) |
| `--foreground` | `#616163` (warm gray) |
| `--primary` | `#fad312` (brand yellow) |
| `--secondary` | `#87ff8b` (neon green) |
| `--muted` | `#f0f0da` (cream-gray) |
| `--border` | `#e0dec5` (warm sand) |
| `--card` | `#ffffff` |
| `--radius` | `0.5rem` |

This base shares the brand yellow/green palette of Candy but on a warm cream background with warm-gray text — it reads as a "soft" daylight variant of the Candy theme.

---

## Shared Design Tokens

These are the same value across all three themes:

| Token | Value | Notes |
|---|---|---|
| `--radius` | `0.5rem` | Base border-radius for all UI elements |
| `--radius-sm` | `calc(0.5rem - 4px)` = `0.125rem` | Computed from `--radius` |
| `--radius-md` | `calc(0.5rem - 2px)` = `0.25rem` | Computed |
| `--radius-lg` | `0.5rem` | Same as base |
| `--radius-xl` | `calc(0.5rem + 4px)` = `0.75rem` | Computed |
| `--destructive` | `#ff6b6b` / `#ef4444` | Candy/root uses `#ff6b6b`; Light/Dark use `#ef4444` |
| `--font-sans` | `'Geist', 'Geist Fallback'` | Primary UI font (via `@theme inline`) |
| `--font-mono` | `'Geist Mono', 'Geist Mono Fallback'` | Code, labels, badges |

**Body fallback stack** (from `@layer base`):
```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```
Geist is loaded via Next.js font optimization; Inter is the CSS fallback for body text in `app/globals.css`.

---

## Typography Scale

Defined globally in `app/globals.css` `@layer base`. Applied to raw HTML elements:

| Element | Mobile | Desktop | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| `h1` | `text-5xl` (3rem) | `text-6xl` (3.75rem) | `font-bold` (700) | `tracking-tight` (−0.025em) | 1.2 |
| `h2` | `text-3xl` (1.875rem) | `text-4xl` (2.25rem) | `font-bold` | `tracking-tight` | 1.3 |
| `h3` | `text-xl` (1.25rem) | `text-2xl` (1.5rem) | `font-bold` | — | 1.4 |
| `p` | `text-base` (1rem) | `text-lg` (1.125rem) | — | — | `leading-relaxed` (1.625) |

Global `body` line-height: `1.6`.

---

## Prose Styles (Markdown Content)

Three distinct CSS Module `prose` classes are used in different contexts:

### Blog Posts (`app/blogs/[slug]/blog-post.module.css`)

For long-form article reading. Generous spacing for comfort.

| Property | Value |
|---|---|
| Font size | `1.2rem` |
| Line height | `1.75` |
| Max width | `680px` |
| Paragraph margin | `1.75rem` bottom |
| `h1` size | `2.25rem` |
| `h2` size | `1.75rem` |
| `h3` size | `1.375rem` |
| `h4` size | `1.15rem` |
| Heading `margin-top` | `3rem` |
| Blockquote border | `4px solid var(--primary)` |
| `code` color | `var(--primary)` on `var(--muted)` bg |
| Link color | `var(--primary)` → `var(--accent)` on hover |
| Image border-radius | `8px` |

### README Viewer (`components/portfolio/readme.module.css`)

For compact GitHub README rendering in a sidebar/panel.

| Property | Value |
|---|---|
| Font size | `0.9rem` |
| Line height | `1.7` |
| `h1` size | `1.5rem` |
| `h2` size | `1.2rem` (with `border-bottom`) |
| `h3` size | `1.05rem` |
| Heading `margin-top` | `2rem` |
| Blockquote border | `3px solid var(--primary)` |
| Image border-radius | `6px` |

### Recall Cards Answers (`components/apps/recall-cards/answer.module.css`)

For flashcard answer content. Tighter than blog, looser than README.

| Property | Value |
|---|---|
| Font size | `0.95rem` |
| Line height | `1.7` |
| `mark` highlight | `#fef08a` bg / `#1a1a1a` text (light) |
| `mark` in `.dark` | `#854d0e` bg / `#fef9c3` text |

### Shared Syntax Highlighting (highlight.js)

All three prose modules use the same custom highlight.js color mapping:

| Token type | Color |
|---|---|
| Keywords / built-ins / tags | `var(--primary)` (brand yellow / blue per theme) |
| Strings / attributes / additions | `#87c87c` (soft green — fixed, not theme-aware) |
| Titles / sections / types | `#e0a060` (warm orange — fixed) |
| Comments / meta | `var(--muted-foreground)` at 70% opacity, italic |
| Numbers / literals / variables | `#c07fd0` (soft purple — fixed) |
| Params / properties | `var(--foreground)` |

The green, orange, and purple highlight colors are **not theme tokens** — they are hardcoded hex values that were chosen to read acceptably on both dark (Candy) and light backgrounds.

---

## Theme Token Cross-Reference

| Token | `:root` / Fallback | Candy | Light | Dark |
|---|---|---|---|---|
| `--background` | `#fffae3` | `#2a2a2a` | `#ffffff` | `#111827` |
| `--foreground` | `#616163` | `#fffae3` | `#1f2937` | `#f9fafb` |
| `--primary` | `#fad312` | `#fad312` | `#2563eb` | `#93c5fd` |
| `--secondary` | `#87ff8b` | `#87ff8b` | `#4b5563` | `#9ca3af` |
| `--accent` | `#fad312` | `#fad312` | `#2563eb` | `#93c5fd` |
| `--muted` | `#f0f0da` | `#3a3a3a` | `#f3f4f6` | `#374151` |
| `--border` | `#e0dec5` | `#4a4a4a` | `#e5e7eb` | `#374151` |
| `--card` | `#ffffff` | `#1a1a1a` | `#ffffff` | `#1f2937` |
| `--ring` | `#fad312` | `#fad312` | `#2563eb` | `#93c5fd` |
| `--radius` | `0.5rem` | (inherits `:root`) | (inherits `:root`) | (inherits `:root`) |

---

## Accessibility Considerations

- `prefers-reduced-motion` is respected in `app/globals.css`: all animation durations are forced to `0.01ms` when the system preference is set.
- `*:focus-visible` always shows a `2px outline` with `outline-primary` color, ensuring keyboard navigation is visible in every theme.
- A `.skip-to-main` link is styled globally for screen-reader / keyboard users.
- `disableTransitionOnChange: true` in `ThemeProvider` prevents a flash of unstyled content or color bleed during theme switches.
- `suppressHydrationWarning` is set on both `<html>` and `<body>` to prevent React hydration errors caused by `next-themes` injecting the class server-side vs. client-side.
- The theme toggle renders skeleton placeholders before mounting to avoid layout shift.

---

## shadcn/ui Integration

The project uses shadcn's **New York** style variant (`"style": "new-york"` in `components.json`) with:

- `baseColor: "neutral"` — shadcn's base gray palette
- `cssVariables: true` — all shadcn components consume `var(--primary)`, `var(--card)`, etc. rather than hardcoded values, making them automatically theme-aware
- `iconLibrary: "lucide"` — Lucide React for all icons (consistent with `Wind`, `Plus`, `X`, `Palette`, `Lollipop`, `Sun`, `Moon` usage throughout)
