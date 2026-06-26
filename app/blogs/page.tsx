export const revalidate = 300; // re-fetch CMS data every 5 minutes

import type { Metadata } from 'next';
import Link from 'next/link';
import { blogClient } from '@/lib/cms';
import { portfolioConfig } from '@/config/portfolio.config';
import { Footer } from '@/components/portfolio/footer';

const baseUrl = portfolioConfig.site.url;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, deep-dives, and insights on software engineering, system design, and AI.',
  alternates: { canonical: `${baseUrl}/blogs` },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/blogs`,
    title: `Blog — ${portfolioConfig.name}`,
    description: 'Thoughts, deep-dives, and insights on software engineering, system design, and AI.',
    siteName: portfolioConfig.name,
    images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog — ${portfolioConfig.name}`,
    description: 'Thoughts, deep-dives, and insights on software engineering, system design, and AI.',
    creator: portfolioConfig.site.twitter,
    images: [`${baseUrl}/og-image.png`],
  },
};

// Smart date formatter: relative for ≤30 days, absolute otherwise
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

export default async function BlogsPage() {
  const allPosts = await blogClient.getAllPosts().catch(() => []);
  const displayPosts = [...allPosts].sort((a: any, b: any) => {
    const dateA = new Date(a.publishedAt || a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.publishedAt || b.date || b.createdAt || 0).getTime();
    return dateB - dateA;
  });


  return (
    <div className="relative min-h-screen bg-background text-foreground">
    <div className="py-20 px-6 md:px-12 lg:px-16 container max-w-4xl mx-auto">
      <div className="mb-12">
        <Link 
          href="/#blog" 
          className="text-primary hover:text-accent transition-colors flex items-center gap-2 text-sm font-mono mb-8 inline-flex"
        >
          <span>←</span> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          All <span className="text-primary">Blogs</span>
        </h1>
        <p className="text-secondary leading-relaxed">
          Thoughts, tutorials, and insights on web development and more.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {displayPosts.map((post: any, index) => (
          <article
            key={index}
            className="p-6 rounded border border-border hover:border-primary transition-colors duration-200 hover:shadow-lg hover:shadow-primary/10 group bg-card"
          >
            <Link href={`/blogs/${post.slug}`} className="block">
              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                {post.title}
              </h3>

              <p className="text-secondary leading-relaxed mb-4">{post.excerpt || post.description}</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <time className="text-sm text-muted-foreground font-mono">
                  Published {formatBlogDate(post.publishedAt || post.date || post.createdAt)}
                </time>

                <div className="flex flex-wrap gap-2">
                  {(post.tags || post.metatags || []).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <Footer />
    </div>
    </div>
  );
}
