import type { Metadata } from 'next';
import Link from 'next/link';
import { portfolioConfig } from '@/config/portfolio.config';
import { Footer } from '@/components/portfolio/footer';

const baseUrl = portfolioConfig.site.url;

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${portfolioConfig.site.title}.`,
  alternates: { canonical: `${baseUrl}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-secondary leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Overview</h2>
            <p>
              This website (<strong className="text-foreground">{baseUrl}</strong>) is a personal
              portfolio belonging to {portfolioConfig.name}. Your privacy matters. This policy
              describes what data is collected when you visit and how it is used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Information Collected</h2>
            <p>This site does not collect or store any personally identifiable information directly.
              However, the following third-party services may collect data automatically:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong className="text-foreground">Google Analytics</strong> — page views, session
                duration, referrer, and approximate geolocation (country/city level) via anonymised
                IP addresses. See{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-foreground">Vercel Analytics</strong> — aggregated,
                privacy-friendly visitor metrics with no cookies. See{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel&apos;s Privacy Policy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Cookies</h2>
            <p>
              This site stores a minimal <code className="text-primary font-mono text-sm">theme</code> preference
              in <code className="text-primary font-mono text-sm">localStorage</code> to remember
              your light/dark mode choice. No tracking or advertising cookies are set by this site
              directly. Third-party services listed above may set their own cookies in accordance
              with their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">External Links</h2>
            <p>
              This site contains links to GitHub, LinkedIn, and other external services. Once you
              leave this site, their respective privacy policies apply. This site has no control
              over and accepts no responsibility for the content or privacy practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Data Retention</h2>
            <p>
              No personal data is stored on servers controlled by this site. Analytics data
              retained by Google Analytics and Vercel Analytics is governed by their own retention
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Your Rights</h2>
            <p>
              If you have concerns about data collected through third-party analytics, you can opt
              out using browser extensions such as{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Analytics Opt-out
              </a>{' '}
              or by enabling &quot;Do Not Track&quot; in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact</h2>
            <p>
              For any privacy-related questions, reach out at{' '}
              <a
                href={`mailto:${portfolioConfig.email}`}
                className="text-primary hover:underline"
              >
                {portfolioConfig.email}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Changes to This Policy</h2>
            <p>
              This policy may be updated from time to time. The &quot;Last updated&quot; date at the
              top of this page will reflect any changes. Continued use of the site after changes
              are posted constitutes acceptance of the updated policy.
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
