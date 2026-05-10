# Lab — Productivity App Ideas

All apps follow the same principles: localStorage-first, no login, no tracking, self-contained.

---

## Planned (on the roadmap)

### Brain Dump
Empty your head in seconds. Type whatever is cluttering your mind — worries, ideas, to-dos, random thoughts — then let it go. The goal is not to organise, just to externalise. Clears mental noise so you can focus on what actually matters.

- Free-text input, one thought per line or prose — doesn't matter
- Timestamp each dump session
- Option to promote a line → Sticky Note or Habit Tracker entry
- "Clear all" with a single confirm — the act of clearing is the point

### Pomodoro
Work and study timer built around intent. Before a session starts, draw a mindmap of your goals — nodes become timed tasks. Keeps your focus visible while you work, not buried in a to-do list.

- Standard 25/5 pomodoro intervals (configurable)
- Mindmap canvas for session goals (nodes + edges)
- Convert any mindmap node into a task with a timer
- Session history: what you planned vs. what you actually worked on

### Sticky Notes
Colourful sticky notes on a freeform canvas. Pin thoughts, links, or reminders anywhere. Lightweight alternative to heavy note apps — just drag, drop, and colour-code.

- Freeform canvas with drag-and-drop positioning
- Colour picker per note (6–8 preset colours)
- Promote a Brain Dump line → sticky in one click
- Persist canvas state to localStorage

---

## Ideas backlog

### Gratitude Log
Three things each morning. No accounts, no streaks gamification — just a quiet habit. Shows previous entries so you can look back without searching.

- Date-keyed entries, 3 prompts per day
- Calendar heatmap showing consistency
- Read-only past entries

### Decision Journal
Record a decision and your reasoning at the moment you make it. Revisit later to see how it played out. Builds calibration and judgment over time.

- Entry: decision + context + confidence level + date
- Revisit prompt: how did it go? what would you do differently?
- Timeline view of past decisions

### Habit Tracker
Minimal daily checkboxes, nothing more. No points, no streaks pressure — just a clean signal of what you're actually doing.

- Up to 10 habits, user-defined
- Monthly grid view (GitHub-style heatmap)
- Import a Brain Dump intention → new habit

### Writing Sprint
Distraction-free timer with a word-count goal. Blank canvas, no formatting toolbar, no autosave noise. Just you and the words.

- Set goal: time (e.g. 20 min) or word count (e.g. 500 words)
- Live word counter, progress bar
- End of sprint: copy to clipboard or discard — no permanent storage by default

### Link Shelf
Save links with a one-line note on *why* you saved it. Searchable and taggable. Combats link hoarding — the "why" forces you to be intentional.

- URL + one-liner note + tags
- Full-text search across notes
- "Promote to Sticky" — pin a link to the canvas

### Weekly Review
Structured weekly template: what went well, what didn't, one intention for next week. Shows last week's answers alongside for comparison — closes the reflection loop.

- Fixed template, fill in the blanks
- Week-over-week side-by-side view
- Export as markdown

### Energy Log
Rate your energy and focus at a few set times each day (morning, midday, afternoon). Surfaces your peak hours over a week so you can protect them.

- 1–5 rating + optional note, 3× daily
- Weekly chart: energy curve by time of day
- Pairs with Pomodoro — schedule deep work at your peak

---

## Connections between apps

```
Brain Dump
  ├── promote line → Sticky Note
  ├── promote intention → Habit Tracker
  └── promote link → Link Shelf

Pomodoro
  └── mindmap node → timed task

Recall Cards
  └── (future) session goal → Pomodoro task
```
