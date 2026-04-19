# KI: Data Fetching Architecture

The project uses a GitHub-powered content management system, fetching markdown files from a remote repository and rendering them as static pages with Incremental Static Regeneration (ISR).

## Architecture Overview
1. **Low-level API (`lib/github-api.ts`)**:
   - Uses native `fetch` with GitHub-specific headers.
   - `getGitHubFile`: Fetches raw file content.
   - `listGitHubFiles`: Lists directory contents using the JSON API.
   - **Caching**: Implements ISR via `next: { revalidate: 3600 }`, refreshing content every hour.

2. **Content Orchestration (`lib/github-content/loader.ts`)**:
   - Maps GitHub files to structured TypeScript interfaces (`ProjectData`, `BlogPost`, `Experience`).
   - Handles sorting (e.g., blog posts by date, projects by title).

3. **Markdown Parsing (`lib/markdown-parser.ts`)**:
   - `parseFrontMatter`: Custom regex-based parser for YAML-style frontmatter.
   - `markdownToHtml`: Simple regex-based converter for headers, bold, links, code, and lists.
   - `parseMarkdown`: Combines frontmatter extraction and HTML conversion.

## Configuration
- Content sources are defined in `config/portfolio.config.ts` under `github.contentPaths`.
- Requires `NEXT_PUBLIC_GITHUB_TOKEN` for higher rate limits (optional but recommended).

## Data Flow
`App Page` -> `Loader` -> `GitHub API` -> `Markdown Parser` -> `Rendered UI`
