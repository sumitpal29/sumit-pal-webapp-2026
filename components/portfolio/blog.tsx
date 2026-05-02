'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Smart date formatter: relative for ≤30 days, absolute otherwise
function formatBlogDate(raw: string | undefined): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw; // fallback for non-parseable strings

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); // → "21 Apr 2026"
}

interface BlogProps {
  posts?: any[];
}

export function Blog({ posts }: BlogProps) {
  const displayPosts = posts ?? [];

  return (
    <section
      id="blog"
      className="relative flex items-start justify-start px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16"
    >
      <motion.div
        className="max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">04.</span> Blog
          </h2>
          <div className="hidden md:block flex-grow h-px bg-border max-w-xs" />
        </motion.div>

        <div className="space-y-6">
          {displayPosts.slice(0, 3).map((post, index) => (
            <motion.article
              key={index}
              variants={itemVariants}
              className="p-6 rounded border border-border hover:border-primary transition-colors duration-200 hover:shadow-lg hover:shadow-primary/10 group"
            >
              <Link href={`/blogs/${post.slug}`} className="block">
                <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
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
            </motion.article>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-12 flex justify-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 border border-primary text-primary rounded font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            View all posts
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
