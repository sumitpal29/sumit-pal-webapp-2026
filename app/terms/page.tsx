import type { Metadata } from 'next';
import Link from 'next/link';
import { portfolioConfig } from '@/config/portfolio.config';
import { Footer } from '@/components/portfolio/footer';

const baseUrl = portfolioConfig.site.url;

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `Terms of use for ${portfolioConfig.site.title}.`,
  alternates: { canonical: `${baseUrl}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const lastUpdated = 'June 27, 2025';

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="py-20 px-6 md:px-12 lg:px-16 container max-w-3xl mx-auto">

        <div className="mb-12">
          <Link
            href="/"
            className="text-primary hover:text-accent transition-colors flex items-center gap-2 text-sm font-mono mb-8 inline-flex"
          >
            <span>←</span> Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of <span className="text-primary">Use</span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-secondary leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Acceptance of Terms</h2>
            <p>
              By accessing <strong className="text-foreground">{baseUrl}</strong> (the
              &quot;Site&quot;), you agree to be bound by these Terms of Use. If you do not agree
              with any part of these terms, please do not use this Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Intellectual Property</h2>
            <p>
              All content on this Site — including text, design, code snippets, and images — is
              the property of {portfolioConfig.name} unless otherwise stated. You may not reproduce,
              distribute, or create derivative works without explicit written permission.
            </p>
            <p className="mt-3">
              Open-source projects linked from this Site are governed by their respective licences
              (typically MIT). Check each repository for the applicable licence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Permitted Use</h2>
            <p>You may:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>View, share, and link to pages on this Site for personal or professional reference.</li>
              <li>Quote brief excerpts with proper attribution and a link back to the original page.</li>
            </ul>
            <p className="mt-3">You may not:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Scrape or systematically copy content for commercial purposes.</li>
              <li>Use content to train machine-learning models without written permission.</li>
              <li>Represent content as your own work.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Disclaimer of Warranties</h2>
            <p>
              This Site is provided &quot;as is&quot; without warranties of any kind, express or
              implied. {portfolioConfig.name} does not warrant that the Site will be error-free,
              uninterrupted, or free of viruses or other harmful components. Use of the Site is at
              your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, {portfolioConfig.name} shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of, or inability to use, this Site or its content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">External Links</h2>
            <p>
              This Site may contain links to third-party websites. These links are provided for
              convenience only. {portfolioConfig.name} has no control over, and accepts no
              responsibility for, the content or practices of any linked site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Changes to Terms</h2>
            <p>
              These terms may be updated at any time. The &quot;Last updated&quot; date at the top
              reflects the most recent revision. Continued use of the Site after changes are posted
              constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p>
              For questions about these terms, contact{' '}
              <a
                href={`mailto:${portfolioConfig.email}`}
                className="text-primary hover:underline"
              >
                {portfolioConfig.email}
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
