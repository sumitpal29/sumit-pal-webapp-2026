# sumit-pal-webapp-2026

Personal portfolio and blog for [Sumit Pal](https://sumitpal.in) — Staff Software Engineer.

Built with Next.js 16 App Router, TypeScript, Tailwind CSS v4, and Framer Motion. Content is managed through a GitHub-backed CMS with no database or CMS service required.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Next.js 16 App Router                      │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────────────┐   │
│  │   Server Pages  │        │     Client Components    │   │
│  │  (RSC, async)   │        │  (animations, scroll,    │   │
│  │                 │        │   theme, cursor)         │   │
│  │  /              │        │                          │   │
│  │  /blogs         │        │  SectionContainer        │   │
│  │  /blogs/[slug]  │        │  PortfolioLayout         │   │
│  │  /projects      │        │  ThemeToggle             │   │
│  │  /experience/   │        │  CursorGlow              │   │
│  └────────┬────────┘        └──────────────────────────┘   │
│           │                                                 │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │                   lib/cms.ts                        │   │
│  │         @blog-database/github-client wrapper        │   │
│  │                                                     │   │
│  │  getProfileConfigs()   → config/profile-config.json │   │
│  │  getExperiences()      → metadata/experiences.json  │   │
│  │  getProjects()         → metadata/projects.json     │   │
│  │  blogClient.getAllPosts() → indexed markdown files  │   │
│  │  blogClient.getPost(slug) → single markdown file    │   │
│  └────────┬────────────────────────────────────────────┘   │
└───────────┼─────────────────────────────────────────────────┘
            │ HTTPS (GitHub raw content API)
┌───────────▼─────────────────────────────────────────────────┐
│         GitHub Repo: sumitpal29/sumit-pal-portfolio-database │
│                                                             │
│  config/profile-config.json   ← about text, skills, email  │
│  metadata/experiences.json    ← work history                │
│  metadata/projects.json       ← project list                │
│  posts/[slug].md              ← blog post markdown          │
│  posts/index.json             ← pagination index            │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 + CSS Modules |
| Animations | Framer Motion |
| CMS | `@blog-database/github-client` (local package) |
| Markdown | `react-markdown` + `remark-gfm` |
| Fonts | Geist + Geist Mono (via `next/font`) |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## Project Structure

```
├── app/
│   ├── layout.tsx                  # Root layout: metadata, JSON-LD Person schema, fonts
│   ├── page.tsx                    # Homepage — fetches all CMS data server-side
│   ├── robots.ts                   # /robots.txt
│   ├── sitemap.ts                  # /sitemap.xml — includes all blog post URLs
│   ├── blogs/
│   │   ├── page.tsx                # Blog listing page
│   │   └── [slug]/
│   │       ├── page.tsx            # Blog post page — markdown rendering + BlogPosting schema
│   │       └── blog-post.module.css # Scoped prose typography styles
│   ├── experience/
│   │   └── [company]/
│   │       └── page.tsx            # Detailed experience page
│   └── projects/
│       └── page.tsx                # Full project archive (table view)
│
├── components/
│   └── portfolio/
│       ├── portfolio-layout.tsx    # Root client wrapper — mounts scroll spy, passes activeSection
│       ├── section-container.tsx   # Two-column sticky layout (40% LHS nav / 60% RHS content)
│       ├── about.tsx               # About + skills badges
│       ├── experience.tsx          # Experience cards
│       ├── projects.tsx            # Featured projects
│       ├── blog.tsx                # Latest blog posts preview
│       ├── contact.tsx             # Contact + social links
│       ├── hero-image.tsx          # Profile photo (Next.js Image)
│       ├── cursor-glow.tsx         # Canvas-based cursor glow effect
│       ├── theme-toggle.tsx        # Three-way theme switcher (light / dark / system)
│       └── theme-provider.tsx      # next-themes provider
│
├── config/
│   └── portfolio.config.ts         # Single source of truth: name, title, description,
│                                   # socials, site URL, OG image
│
├── hooks/
│   ├── use-scroll-spy.ts           # IntersectionObserver — tracks which section is in viewport
│   ├── use-mobile.ts               # Responsive breakpoint detection
│   └── use-toast.ts                # Toast notification hook
│
├── lib/
│   ├── cms.ts                      # CMS client + typed fetch helpers
│   ├── seo.ts                      # SEO utility functions
│   └── utils.ts                    # cn() class name helper
│
├── styles/
│   └── globals.css                 # CSS variables (light/dark themes), Tailwind base
│
├── public/
│   ├── og-image.png                # 1200×630 Open Graph image
│   ├── icon.svg / icon-*.png       # Favicons (light + dark scheme aware)
│   └── sumit-pal-ai-architect.png  # Profile photo
│
└── types/
    └── content.ts                  # Shared TypeScript types
```

---

## Layout System

The homepage uses a **two-column sticky layout**:

```
┌──────────────── max-w-[1200px] ─────────────────┐
│                                                  │
│  ┌─── 40% (sticky) ───┐  ┌─── 60% (scroll) ───┐ │
│  │                    │  │                    │ │
│  │  Name              │  │  About section     │ │
│  │  Title             │  │  Experience        │ │
│  │  Description       │  │  Projects          │ │
│  │                    │  │  Blog              │ │
│  │  — About      ←    │  │  Contact           │ │
│  │  — Experience      │  │                    │ │
│  │  — Projects        │  │                    │ │
│  │  — Blog            │  │                    │ │
│  │  — Contact         │  │                    │ │
│  │                    │  │                    │ │
│  └────────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

The left column is `position: sticky; top: 0; height: 100vh`. The active nav item is driven by `useScrollSpy` (IntersectionObserver) passed down from `PortfolioLayout`.

---

## CMS Data Flow

All content is fetched **server-side at request time** from a separate GitHub repository via the `@blog-database/github-client` package.

```
GitHub repo (sumit-pal-portfolio-database)
  └── config/profile-config.json     →  About text, skills, email, socials
  └── metadata/experiences.json      →  Array of experience entries
  └── metadata/projects.json         →  Array of project entries
  └── posts/<slug>.md                →  Individual blog post (frontmatter + body)
  └── posts/index.json               →  Pagination index for blog listing
```

The CMS client (`lib/cms.ts`) wraps the package with typed helpers:

```typescript
getProfileConfigs()           // ProfileData | null
getExperiences()              // ExperienceData[]
getProjects()                 // ProjectData[]
blogClient.getAllPosts()       // PostMeta[]
blogClient.getPost(slug)      // Post  { frontmatter, content }
```

---

## Theme System

Three themes — **candy** (default), **light**, **dark** — implemented via CSS custom properties and `next-themes`.

| Token | Candy (default) | Dark |
|-------|----------------|------|
| `--background` | `#fffae3` | `#2a2a2a` |
| `--foreground` | `#616163` | `#fffae3` |
| `--primary` | `#fad312` (yellow) | `#fad312` |
| `--secondary` | `#84b686` (green) | `#839f84` |
| `--border` | `#e0dec5` | `#4a4a4a` |

---

## SEO

| Page | Metadata |
|------|----------|
| All pages | `Person` JSON-LD schema, canonical URL |
| Homepage | Full OG + Twitter card, `Person` structured data |
| Blog listing | OG + Twitter card |
| Blog post | `BlogPosting` JSON-LD, `article` OG type, `publishedTime`, `modifiedTime` |
| Projects | OG + Twitter card |
| `/sitemap.xml` | Static pages + all blog post URLs with `lastModified` |
| `/robots.txt` | Allow all, sitemap pointer |

---

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Set your site URL:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Update config

Edit `config/portfolio.config.ts` with your name, title, description, and social links.

### 4. Point to your content repo

Edit `lib/cms.ts` — update the `CMS_CONFIG` to point to your GitHub repository:

```typescript
const CMS_CONFIG = {
  repo: 'your-username/your-content-repo',
  branch: 'main',
  project: 'your-project-name',
};
```

### 5. Run

```bash
yarn dev
```

---

## Deployment

Designed for **Vercel**. Set `NEXT_PUBLIC_SITE_URL` in the Vercel environment variables dashboard, push to `main`, and it deploys automatically.
