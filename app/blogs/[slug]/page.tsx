import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogClient } from '@/lib/cms';
import { portfolioConfig } from '@/config/portfolio.config';
import { ThemeToggle } from '@/components/portfolio/theme-toggle';
import { CursorGlow } from '@/components/portfolio/cursor-glow';
import styles from './blog-post.module.css';

function formatBlogDate(raw: string | undefined): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const baseUrl = portfolioConfig.site.url;

  try {
    const post = await blogClient.getPost(slug);
    const { title, description, createdAt, updatedAt, metatags } = post.frontmatter;
    const canonicalUrl = `${baseUrl}/blogs/${slug}`;

    return {
      title,
      description,
      authors: [{ name: portfolioConfig.name, url: baseUrl }],
      keywords: metatags,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'article',
        url: canonicalUrl,
        title,
        description,
        siteName: portfolioConfig.name,
        publishedTime: createdAt,
        modifiedTime: updatedAt,
        authors: [portfolioConfig.name],
        tags: metatags,
        images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: portfolioConfig.site.twitter,
        images: [`${baseUrl}/og-image.png`],
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await blogClient.getPost(slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = post;

  const baseUrl = portfolioConfig.site.url;
  const canonicalUrl = `${baseUrl}/blogs/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.createdAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.createdAt,
    url: canonicalUrl,
    author: {
      '@type': 'Person',
      name: portfolioConfig.name,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: portfolioConfig.name,
      url: baseUrl,
    },
    keywords: frontmatter.metatags?.join(', '),
    image: `${baseUrl}/og-image.png`,
  };

  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CursorGlow />
      <div className="fixed bottom-6 left-6 z-50">
        <ThemeToggle />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-accent transition-colors mb-12"
        >
          <span>←</span> All posts
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {frontmatter.title}
          </h1>

          {frontmatter.description && (
            <p className="text-secondary text-lg leading-relaxed mb-6">
              {frontmatter.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <time className="text-sm font-mono text-muted-foreground">
              {formatBlogDate(frontmatter.createdAt)}
              {frontmatter.updatedAt && frontmatter.updatedAt !== frontmatter.createdAt && (
                <span className="ml-3 opacity-60">
                  · updated {formatBlogDate(frontmatter.updatedAt)}
                </span>
              )}
            </time>

            {frontmatter.metatags?.length ? (
              <div className="flex flex-wrap gap-2">
                {frontmatter.metatags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="h-px bg-border mb-12" />

        <article className={styles.prose}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>

        <div className="h-px bg-border mt-16 mb-10" />

        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-accent transition-colors"
        >
          <span>←</span> Back to all posts
        </Link>
      </main>
    </div>
  );
}
