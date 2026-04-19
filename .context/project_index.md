# Project Index: Developer Portfolio

A production-ready developer portfolio built with Next.js 16, TypeScript, Tailwind 4, and Framer Motion.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **UI Components**: Radix UI, Lucide React
- **Data Source**: GitHub API (for projects, blog, and experience)
- **Deployment**: Vercel (recommended)

## Directory Structure
- `app/`: Next.js App Router pages and global styles.
  - `layout.tsx`: Root layout with SEO and global fonts.
  - `page.tsx`: Single-page entry point for the portfolio.
  - `globals.css`: Tailwind 4 CSS variables and base styles.
- `components/`: React components.
  - `portfolio/`: Main UI sections (Hero, About, Experience, Projects, Blog, Contact).
- `config/`: Core configuration.
  - `portfolio.config.ts`: Personal info, GitHub repo settings, and social links.
- `hooks/`: Custom React hooks.
  - `use-scroll-spy.ts`: Handles active section detection during scroll.
- `lib/`: Utilities and API clients.
  - `github-api.ts`: Low-level GitHub contents fetching.
  - `github-content/`: Content orchestration (loading and parsing markdown).
  - `markdown-parser.ts`: Converts markdown frontmatter and body to HTML.
- `types/`: Shared TypeScript interfaces.

## Key Entry Points
- **Main UI Loop**: `app/page.tsx` renders the `PortfolioLayout` from `components/portfolio/portfolio-layout.tsx`.
- **Active Section Logic**: `useScrollSpy` hook in `PortfolioLayout`.
- **Content Loading**: `loader.ts` (in `lib/github-content/`) fetches content from GitHub using `github-api.ts`.
