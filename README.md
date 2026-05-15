# sumit-pal-web-2026

> Personal portfolio, blog, and lab — for [Sumit Pal](https://sumitpal.in), Staff Software Engineer & AI Product Builder.

[![Live](https://img.shields.io/badge/live-sumitpal.in-black?style=flat-square)](https://sumitpal.in)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-asia--southeast1-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

<!-- SCREENSHOT: Full-page screenshot of the homepage (candy theme, desktop viewport) -->
<!-- Place as: public/screenshots/homepage.png -->

---

## Overview

A production-grade personal site built on a principle: **GitHub is the database**. There is no CMS vendor, no database service, no webhook infrastructure. All content — blog posts, work history, projects, lab app configs, flashcard decks — lives as JSON and Markdown files in versioned GitHub repositories and is fetched at request time over the raw content API.

The result is a site with zero recurring infrastructure costs for content management, full version history on every word ever written, and a content pipeline that is just `git push`.

---

## What's Inside

| Area | Description |
| --- | --- |
| **Portfolio** | About, experience timeline, featured projects with live README quick-view |
| **Blog** | Markdown-first blog with audio player, syntax highlighting, and full SEO |
| **Lab** | localStorage-first productivity tools — no login, no server, no tracking |
| **CMS** | Git-backed content layer across two GitHub repositories |
| **Themes** | Three themes: candy (default), light, dark — CSS variable architecture |
| **SEO** | Structured data, OG/Twitter cards, sitemap, canonical URLs per page |
| **Deployment** | Dockerised, deployed to GCP Cloud Run via Cloud Build CI/CD |

---

## System Architecture

<!-- DIAGRAM 1: System Architecture -->
<!-- Place as: public/diagrams/system-architecture.png -->
<!--
eraser.io prompt:
Three-layer architecture diagram. Top layer "Client" has one box "Browser".
Middle layer "Application" has one box "Next.js 16 App Router (Cloud Run)" with
two sub-items: "React Server Components" and "Client Components (Framer Motion, localStorage)".
Bottom layer "Content (GitHub)" has two boxes side by side: box one
"sumit-pal-portfolio-database" listing profile-config.json, experiences.json,
projects.json, lab-apps.json, blog posts/; box two "knowledge-base" listing
recall-cards/tag-map.json and recall-cards/decks/. Draw a vertical arrow from
Browser down to Next.js. Draw two arrows from Next.js down to each GitHub box
labeled "HTTPS / raw.githubusercontent.com". Clean, minimal, monochrome with
one accent colour.
-->

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 — App Router, React Server Components |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 + CSS Modules (scoped prose, per-app styles) |
| Animations | Framer Motion |
| CMS client | `blog-database-github-client` — typed GitHub raw content fetcher |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| Fonts | Geist + Geist Mono via `next/font` |
| Container | Docker (3-stage: deps → builder → runner, `next output: standalone`) |
| CI/CD | GCP Cloud Build |
| Registry | GCP Artifact Registry |
| Runtime | GCP Cloud Run (asia-southeast1) |
| Analytics | Vercel Analytics |

---

## Project Structure

```text
├── app/
│   ├── layout.tsx                      # Root layout, JSON-LD Person schema, fonts
│   ├── page.tsx                        # Homepage — parallel CMS fetches, RSC
│   ├── robots.ts / sitemap.ts          # /robots.txt, /sitemap.xml
│   ├── blogs/
│   │   ├── layout.tsx                  # Shared header + theme toggle
│   │   ├── page.tsx                    # Blog listing
│   │   └── [slug]/page.tsx             # Post page — BlogPosting schema, audio player
│   └── apps/
│       ├── layout.tsx                  # Shared header + theme toggle for all lab apps
│       ├── page.tsx                    # Lab index — fetched from CMS
│       └── recall-cards/
│           ├── page.tsx                # Tag selection + paused session stack
│           ├── session/page.tsx        # Active study session
│           └── history/page.tsx        # Session history
│
├── components/
│   ├── portfolio/
│   │   ├── portfolio-layout.tsx        # Client root: scroll spy, active section state
│   │   ├── section-container.tsx       # Two-column sticky layout (40/60 split)
│   │   ├── about.tsx / experience.tsx / projects.tsx / blog.tsx / contact.tsx
│   │   ├── lab.tsx                     # Lab section carousel (shadcn Carousel)
│   │   ├── project-readme-sheet.tsx    # Lazy README fetch in a slide-out Sheet
│   │   ├── hero-image.tsx / cursor-glow.tsx / audio-player.tsx
│   │   └── theme-toggle.tsx / theme-provider.tsx
│   └── apps/
│       ├── apps-header.tsx             # Shared nav: Home | Apps | Blogs
│       └── recall-cards/               # FlashCard, RatingBar, TagSelector, SessionSummary…
│
├── lib/
│   ├── cms.ts                          # Typed CMS helpers — getProjects, getLabApps, etc.
│   └── recall-cards/
│       ├── types.ts / scheduler.ts     # SM-2 algorithm, card + session interfaces
│       ├── storage.ts                  # localStorage session stack (FIFO, max 4)
│       └── deck-loader.ts              # Fetch decks by tag, deduplicate, relevance-sort
│
├── config/
│   └── portfolio.config.ts             # Name, title, socials, site URL — single source of truth
│
├── hooks/
│   ├── use-scroll-spy.ts               # IntersectionObserver — active section tracking
│   └── use-mobile.ts / use-toast.ts
│
├── styles/globals.css                  # CSS variables (three themes), Tailwind base
│
├── Dockerfile                          # 3-stage build
└── cloudbuild.yaml                     # Cloud Build pipeline
```

---

## The CMS System

The central architectural decision of this project: **no CMS service, no database**. Content is plain files in a GitHub repository, fetched at request time over `raw.githubusercontent.com`.

Two repositories form the content layer:

| Repository | Purpose |
| --- | --- |
| `sumit-pal-portfolio-database` | Profile config, work experience, projects, lab app manifest, blog posts |
| `knowledge-base` | Recall Cards flashcard decks (`tag-map.json`, per-tag deck JSONs) |

The `blog-database-github-client` package constructs raw GitHub URLs and handles fetch + TTL caching. `lib/cms.ts` wraps it with typed helpers:

```typescript
getProfileConfigs()           // ProfileData | null
getExperiences()              // ExperienceData[]
getProjects()                 // ProjectData[]
getLabApps()                  // LabAppData[]
blogClient.getAllPosts()       // PostMeta[]
blogClient.getPost(slug)      // { frontmatter, content }
buildKnowledgeBaseUrl(path)   // raw URL into the knowledge-base repo
```

All of these run as React Server Components — the data fetching never reaches the client bundle.

### CMS Data Flow

<!-- DIAGRAM 2: CMS Data Flow (sequence) -->
<!-- Place as: public/diagrams/cms-data-flow.png -->
<!--
eraser.io prompt:
Left-to-right sequence diagram with four participants: "Page Request",
"app/page.tsx (RSC)", "lib/cms.ts", "GitHub Raw CDN". Show five concurrent
arrows from app/page.tsx to lib/cms.ts: getProfileConfigs(), getExperiences(),
getProjects(), getLabApps(), blogClient.getAllPosts(). Then show lib/cms.ts
making parallel fetch calls to GitHub Raw CDN with example paths:
config/profile-config.json, metadata/experiences.json, metadata/projects.json,
metadata/lab-apps.json, meta/list_1.json. Show JSON responses returning left.
End with a note "RSC renders HTML — zero JS payload for data fetching".
-->

### Why this works in production

- **Caching**: `blog-database-github-client` maintains an in-memory TTL cache (5 min). Repeated requests within a server instance are served from memory.
- **Resilience**: Every fetch helper returns a typed fallback (`null` or `[]`) on error — the page renders with partial data rather than erroring.
- **Deployless content updates**: Changing a blog post, experience entry, or lab app config is a `git push` to the content repo. No redeployment needed.

---

## Deployment Pipeline

The site is containerised and deployed to GCP Cloud Run. The pipeline runs on every push to `main`.

### Pipeline stages

<!-- DIAGRAM 3: Deployment Pipeline -->
<!-- Place as: public/diagrams/deployment-pipeline.png -->
<!--
eraser.io prompt:
Left-to-right pipeline diagram. Steps in sequence: box "git push to main" →
box "Cloud Build Trigger" → box "3-stage Docker Build (deps / builder / runner)"
→ box "Push to Artifact Registry" with a note below "commit-SHA tag + latest tag"
→ box "Cloud Run Deploy" with a note below "commit-SHA image only — latest never
deployed to prod" → box "Live at sumitpal.in". Below Cloud Run add
"512Mi · 1 vCPU · min 0 / max 5 instances · asia-southeast1". Use a clean
linear flow with arrow connectors.
-->

### Docker: 3-stage build

The `Dockerfile` uses a three-stage build to keep the production image minimal:

| Stage | Base | Purpose |
| --- | --- | --- |
| `deps` | `node:20-alpine` | Install dependencies only (`npm ci`) |
| `builder` | `node:20-alpine` | Run `next build` with `output: standalone` |
| `runner` | `node:20-alpine` | Copy only the standalone output + static assets |

The final image contains no `node_modules`, no source files, and no build tooling — just the compiled Next.js standalone server.

### Cloud Run configuration

| Setting | Value |
| --- | --- |
| Region | `asia-southeast1` |
| Memory | `512Mi` |
| CPU | `1 vCPU` |
| Min instances | `0` (scales to zero) |
| Max instances | `5` |
| Image strategy | Commit-SHA tagged — `:latest` is pushed to the registry but never deployed |

The commit-SHA deployment strategy means every production revision is traceable to an exact commit, and rolling back is a single `gcloud run deploy` with a previous SHA.

---

## The Lab

A section of the site dedicated to localStorage-first productivity tools — small utilities built for personal use. No accounts, no server-side state, no tracking. Everything runs in the browser and persists to `localStorage`.

<!-- SCREENSHOT: /apps index page -->
<!-- Place as: public/screenshots/lab-apps.png -->

Current apps and their status are managed via `metadata/lab-apps.json` in the content repo — adding a new app to the lab requires no code change or redeployment.

---

## Theme System

Three themes implemented as CSS custom property sets, switched via `next-themes`.

| Token | Candy (default) | Dark | Light |
| --- | --- | --- | --- |
| `--background` | `#fffae3` | `#2a2a2a` | `#ffffff` |
| `--foreground` | `#616163` | `#fffae3` | `#1a1a1a` |
| `--primary` | `#fad312` | `#fad312` | `#d4a000` |
| `--secondary` | `#84b686` | `#839f84` | `#4a7c4e` |
| `--border` | `#e0dec5` | `#4a4a4a` | `#e5e5e5` |

<!-- SCREENSHOT: Side-by-side candy theme and dark theme, same section -->
<!-- Place as: public/screenshots/themes.png -->

All colour tokens are defined once in `styles/globals.css`. Components reference only CSS variables — switching themes requires zero component changes.

---

## SEO

Structured data and metadata are emitted per page type:

| Page | Structured Data | Meta |
| --- | --- | --- |
| All pages | `Person` JSON-LD | Canonical URL |
| Homepage | `Person` JSON-LD | Full OG + Twitter card |
| Blog listing | — | OG + Twitter card |
| Blog post | `BlogPosting` JSON-LD | `article` OG type, `publishedTime`, `modifiedTime`, per-post keywords |
| `/sitemap.xml` | — | Static pages + all blog post URLs with `lastModified` |
| `/robots.txt` | — | Allow all, sitemap pointer |

Blog post slugs are defined by filename in the content repository — renaming a file changes the URL, and the sitemap updates automatically on next request.
