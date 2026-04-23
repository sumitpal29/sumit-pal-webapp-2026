# How I Built My Portfolio in a Weekend Using Claude — And Why GitHub Is My CMS

I've been meaning to rebuild my personal site for two years.

You know how it goes. The project starts, you pick a stack, you spend three hours debating whether to use Contentful or Sanity or just hardcode everything, and then life happens and the half-finished repo sits there silently judging you.

This time was different. I opened Claude Code, described what I wanted, and by the end of the weekend I had a production-ready portfolio with a working blog, full SEO, and a content system I actually understand. No vendor lock-in. No monthly fees. No CMS dashboard to maintain.

This is the story of how that happened — the decisions, the architecture, the bugs we hit, and a practical guide if you want to do something similar.

---

## The Problem With Most Portfolio Setups

Before getting into what I built, it's worth talking about what I was trying to avoid.

Most developer portfolios fall into one of two traps:

**Trap 1: Fully hardcoded.** Everything is JSX. Adding a new blog post means editing a TypeScript file, pushing to git, and waiting for a deployment. Want to fix a typo? Pull request. It works, but it's friction that compounds over time until you just stop writing.

**Trap 2: Headless CMS.** Contentful, Sanity, Strapi. You get a nice dashboard, but now you have a paid dependency, API rate limits, a content schema to maintain, and a tight coupling between your UI and a third-party service. Fine for a team. Overkill for one person's blog.

I wanted a third option: content that lives in git, is as readable as markdown, requires zero infrastructure, but still renders dynamically on the site.

The answer was already in front of me — GitHub itself.

---

## GitHub as a Headless CMS

Here's the insight: GitHub serves raw file content over HTTPS. Any JSON or Markdown file in a public repository is fetchable at a predictable URL with no auth required. And GitHub has essentially 100% uptime.

So instead of running a CMS, I created a second repository — `sumit-pal-portfolio-database` — that acts purely as a content store:

```
sumit-pal-portfolio-database/
├── config/
│   └── profile-config.json     ← about text, skills, contact info
├── metadata/
│   ├── experiences.json        ← work history
│   └── projects.json           ← project list
└── posts/
    ├── index.json              ← pagination index
    ├── jwt-vs-paseto.md        ← blog post with frontmatter
    └── system-design-101.md
```

The webapp fetches from this repo at request time. No build step required when content changes. No webhook. No CMS dashboard. I write a blog post in my editor, push to the content repo, and the next page load picks it up.

The client that handles this fetching — `@blog-database/github-client` — is a local package I built separately. It abstracts away the URL construction, caching, and pagination. From the webapp's perspective, content fetching looks like this:

```typescript
// lib/cms.ts
const CMS_CONFIG = {
  repo: 'sumitpal29/sumit-pal-portfolio-database',
  branch: 'main',
  project: 'sumit-portfolio-website',
  cacheTtl: 300_000,
};

export const blogClient = createBlogClient(CMS_CONFIG);
export async function getExperiences(): Promise<ExperienceData[]> {
  const data = await fetchCmsJson<ExperienceData[]>('metadata/experiences.json');
  return data ?? [];
}
```

Clean, typed, and the data source is a git repo I fully own.

---

## Bringing Claude Into the Build

I used [Claude Code](https://claude.ai/code) — Anthropic's CLI — throughout this project. Not as a code generator I paste from, but as a genuine collaborator working in my codebase.

The experience is different from chatting with an AI in a browser tab. Claude Code has access to your actual files. It reads them, edits them, runs commands, checks TypeScript errors, and iterates. You describe what you want; it works through the problem and tells you when it hits something surprising.

A few things stood out.

### It Audits, Not Just Generates

Early on, I had an `enhancements.md` file with a list of UI/UX fixes I'd noted down. Instead of just asking Claude to implement them one by one, I asked it to check which were already done.

It read every relevant component, compared the code against my list, and came back with a precise status for each item:

- Blog date formatting: already implemented.
- Experience card order: already correct.
- Skills as badges in 3-column grid: done.
- Active section highlighting in the left nav: **broken** — the code existed but the scroll spy hook had misconfigured IntersectionObserver settings that meant it almost never fired.

That last one would have taken me a while to track down. The hook used `threshold: 0.5` combined with `rootMargin: '-50% 0px -50% 0px'`, which created a zero-height detection band in the center of the viewport. Almost nothing ever triggered it. The fix was a one-line change to `rootMargin: '-20% 0px -70% 0px'` with `threshold: 0`.

### It Catches Things You Didn't Ask About

Midway through the project, I asked Claude to check the blog post route that wasn't working. While fetching the rendered HTML to debug the CSS issue, it noticed something in the page `<title>` tag:

```
<title>JWT vs PASETO — Brittany Chiang</title>
```

And in the `<meta>` tags:

```html
<meta name="author" content="Brittany Chiang" />
<link rel="author" href="https://brittanychiang.com" />
```

Every page on my site was branded as someone else. This came from `config/portfolio.config.ts`, a file that had been seeded with Brittany Chiang's data as a starting template and never updated. Claude flagged it, traced it to the source, and fixed it across all metadata in one pass.

It also found the same pattern in my about section copy — "Fast-forward to today, and I've had the privilege of working at an advertising agency, a start-up, and a huge corporation" is almost word-for-word from Brittany Chiang's site. Gone.

### It Diagnoses Build Pipeline Issues

The most technically interesting moment came when I was trying to fix the blog post typography. I'd written detailed CSS in `globals.css` for a `.prose-blog` class, but the blog post looked completely unstyled.

Claude fetched the compiled CSS bundle directly from the running dev server and searched for the class:

```
'prose-blog': NOT FOUND
'margin-bottom: 2rem': NOT FOUND
'blockquote': NOT FOUND
```

The styles weren't in the bundle at all. It then compared timestamps:

```
compiled CSS:  Apr 21 16:55
globals.css:   Apr 21 17:08
```

Turbopack had compiled the CSS file once and cached it. Our edits weren't being picked up. The fix was to move the blog post styles into a co-located CSS Module (`blog-post.module.css`) — a new file that Turbopack would compile fresh — rather than appending to the existing globals.

This kind of diagnosis — fetching the actual runtime artifact, diffing it against the source, finding the timestamp mismatch — is exactly the kind of thing that takes an hour to figure out alone and two minutes with a tool that can run arbitrary commands and connect the dots.

---

## The Architecture That Emerged

Here's what the final system looks like:

```
GitHub Repo (content)
  └── JSON + Markdown files
         │
         │ HTTPS fetch (server-side)
         ▼
Next.js App Router (webapp)
  ├── Server Components fetch content at request time
  ├── Client Components handle animations, scroll, theme
  └── CSS Modules for page-specific styles
         │
         ▼
Vercel (hosting)
```

**Two-column layout.** The homepage uses a sticky 40/60 split. The left column — your name, title, and nav — stays fixed while you scroll through sections on the right. The active nav item tracks your position via IntersectionObserver.

**No database.** No Redis, no Postgres, no connection strings. Content is fetched from GitHub and cached in memory for 5 minutes. Cold start is slightly slower but there's nothing to provision, back up, or pay for.

**Blog posts as markdown.** Each post is a `.md` file with YAML frontmatter. Title, description, tags, and dates come from frontmatter; the body renders via `react-markdown` with `remark-gfm` for GitHub-flavored markdown support (tables, task lists, strikethrough).

**SEO by default.** Every page has typed `metadata` exports, Open Graph tags, Twitter cards, and canonical URLs. Blog posts get `BlogPosting` JSON-LD schema. The homepage has `Person` schema. A dynamic sitemap at `/sitemap.xml` includes every blog post URL with its last-modified date.

**One config file.** `config/portfolio.config.ts` is the single source of truth for name, title, description, social links, and site URL. Every page that needs this data imports from there — no scattered hardcoded strings.

---

## What Working With AI Actually Feels Like

There's a version of "AI-assisted development" that's just autocomplete for longer stretches. This wasn't that.

The more honest description is: **it compressed the feedback loop**. Things that normally take an hour — tracking down a stale cache, auditing for hardcoded strings, verifying that dead code is actually dead — happened in minutes because Claude can run the commands, read the output, and reason about what it means.

Some patterns I found useful:

**Give it context, not just tasks.** "Fix the spacing" produces mediocre results. "The spacing looks wrong compared to how Medium renders articles — here's the URL, here's what our CSS generates" produces a root-cause analysis and a specific fix.

**Let it audit before it edits.** Before making changes to a component, asking "what's already implemented from this list" surfaces both what's done and what's broken. It's faster than reading every file yourself.

**Watch what it flags unsolicited.** Some of the most valuable finds in this project — the Brittany Chiang metadata, the stale config, the dead lib files — came from Claude noticing something adjacent to what I asked about. Don't dismiss these.

**It knows when something is wrong.** When the CSS wasn't compiling into the bundle, Claude didn't just suggest changes and hope. It fetched the actual compiled output, searched it for the class, found it missing, compared timestamps, and diagnosed the Turbopack caching issue. That's the kind of systematic debugging that's hard to rush.

---

## Build Your Own: A Practical Guide

If you want to set up something similar, here's the path with the least friction.

### Step 1: Create a content repository

Make a new GitHub repository — public or private. Give it a structure you can reason about:

```
your-content-repo/
├── config/
│   └── profile-config.json
├── metadata/
│   ├── experiences.json
│   └── projects.json
└── posts/
    └── your-first-post.md
```

Your `profile-config.json` might look like:

```json
{
  "about": [
    "I'm a software engineer who...",
    "Currently I'm focused on..."
  ],
  "skills": ["TypeScript", "React", "Node.js", "PostgreSQL"],
  "email": "you@example.com",
  "socials": [
    { "name": "GitHub", "href": "https://github.com/you" },
    { "name": "LinkedIn", "href": "https://linkedin.com/in/you" }
  ]
}
```

Blog posts use standard markdown with frontmatter:

```markdown
---
title: Your Post Title
description: A one-sentence summary for SEO and previews
createdAt: 2026-04-21
metatags: [engineering, systems]
---

Your content here...
```

### Step 2: Set up the webapp

```bash
npx create-next-app@latest my-portfolio --typescript --tailwind --app
cd my-portfolio
```

Install what you need for content and animation:

```bash
yarn add framer-motion react-markdown remark-gfm next-themes
```

### Step 3: Build a CMS client

Write a simple fetch wrapper around the GitHub raw content URL pattern:

```typescript
// lib/cms.ts
const BASE = 'https://raw.githubusercontent.com/you/your-content-repo/main';

export async function fetchContent<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getProfile() {
  return fetchContent<ProfileData>('config/profile-config.json');
}
```

The `next: { revalidate: 300 }` tells Next.js to cache the response for 5 minutes and revalidate in the background — you get fast page loads and fresh content without ISR complexity.

### Step 4: One config, not many

Create `config/site.config.ts` for everything identity-related:

```typescript
export const siteConfig = {
  name: 'Your Name',
  title: 'Your Job Title',
  description: 'Your one-sentence bio.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com',
  social: {
    github: 'https://github.com/you',
    linkedin: 'https://linkedin.com/in/you',
  },
};
```

Import this in your layout for metadata, in your hero component for the name, in your footer for socials. One change, updates everywhere.

### Step 5: SEO from day one

Don't treat SEO as a polish step. In Next.js App Router, metadata is co-located with pages and costs almost nothing to set up properly:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: 'website', url: siteConfig.url, ... },
  alternates: { canonical: siteConfig.url },
};
```

For blog posts, use `generateMetadata` to pull frontmatter into OG tags:

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: { type: 'article', publishedTime: post.frontmatter.createdAt, ... },
  };
}
```

Add a `Person` JSON-LD schema to your root layout and a `BlogPosting` schema to each post page. These enable Google rich results and help search engines understand your content.

### Step 6: Use AI effectively during the build

A few prompts that worked well in this project:

- *"Read these files and tell me which items from this list are already implemented, which are broken, and which are missing."* — better than doing the audit yourself.
- *"Fetch the compiled CSS from localhost and tell me if this class name is in it."* — invaluable for debugging build pipeline issues.
- *"Search the codebase for any hardcoded strings that should come from config."* — finds the things you forgot about.
- *"What does this component actually do vs what I think it does?"* — useful before refactoring.

The key is specificity. Vague prompts produce vague results. The more context you give — what you're comparing against, what you already tried, what the expected vs actual behavior is — the more precisely the AI can help.

---

## Is This Approach Right for You?

The GitHub-as-CMS pattern works well when:

- You're the only content author (or a small team comfortable with git)
- Your content doesn't need real-time updates or collaborative editing
- You want zero infrastructure cost and zero vendor dependency
- You're comfortable writing markdown

It's less suitable when:

- Non-technical content authors need a UI to write and publish
- You need rich media management (lots of image uploads, video)
- You need granular access controls or a publishing workflow with approvals

For a personal portfolio or a developer blog, the tradeoffs are firmly in your favour. The content repo is just a git repo. It has a full history. You can roll back a post. You can branch and draft. And you never worry about your CMS going down.

---

## The Outcome

The final site has:

- A blog I'll actually write for, because publishing is just `git push`
- A content system I fully understand and fully own
- SEO that I know is correct because I watched it get built piece by piece
- Zero monthly fees beyond hosting

The part that surprised me most wasn't any specific technical decision. It was how much faster the whole thing moved with a tool that could hold the full context of the codebase, catch regressions, audit before editing, and diagnose issues by inspecting the actual runtime artifacts rather than just guessing.

It still required judgement — knowing what to build, what to skip, when a suggestion was wrong. But the mechanical work, the debugging, the auditing, the boilerplate — that part largely vanished.

Two years of procrastination. One weekend to ship.

---

*Source code: [github.com/sumitpal29/sumit-pal-webapp-2026](https://github.com/sumitpal29/sumit-pal-webapp-2026)*
*Content repo: private — but the structure is described in the README.*
