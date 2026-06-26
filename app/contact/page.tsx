import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfileConfigs } from '@/lib/cms';
import { portfolioConfig } from '@/config/portfolio.config';
import { Footer } from '@/components/portfolio/footer';

const baseUrl = portfolioConfig.site.url;

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${portfolioConfig.name}. Available for new projects, collaborations, and conversations.`,
  alternates: { canonical: `${baseUrl}/contact` },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/contact`,
    title: `Contact — ${portfolioConfig.name}`,
    description: `Get in touch with ${portfolioConfig.name}.`,
    siteName: portfolioConfig.name,
    images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact — ${portfolioConfig.name}`,
    description: `Get in touch with ${portfolioConfig.name}.`,
    creator: portfolioConfig.site.twitter,
    images: [`${baseUrl}/og-image.png`],
  },
};

export default async function ContactPage() {
  const profile = await getProfileConfigs();
  const displayEmail = profile?.email || portfolioConfig.email;
  const socials = profile?.socials ?? [];

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
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-secondary leading-relaxed max-w-xl">
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to
            collaborate. Feel free to reach out through any of the channels below.
          </p>
        </div>

        {/* Primary CTA */}
        <section className="mb-16">
          <div className="p-8 rounded border border-border bg-card">
            <h2 className="text-xl font-bold text-foreground mb-3">Say Hello</h2>
            <p className="text-secondary text-sm mb-6 leading-relaxed">
              The fastest way to reach me is by email. I typically respond within 24–48 hours.
            </p>
            <a
              href={`mailto:${displayEmail}`}
              className="inline-flex items-center gap-3 px-6 py-3 border border-primary text-primary rounded font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              {displayEmail}
              <span className="text-lg">→</span>
            </a>
          </div>
        </section>

        {/* Social links */}
        {socials.length > 0 && (
          <section className="mb-16" aria-labelledby="social-heading">
            <h2 id="social-heading" className="text-xl font-bold text-foreground mb-6">
              Find me online
            </h2>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel || social.name}
                  className="px-4 py-2 border border-border rounded text-sm font-mono hover:border-primary hover:text-primary transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Fallback socials from config if no CMS socials */}
        {socials.length === 0 && (
          <section className="mb-16" aria-labelledby="social-heading">
            <h2 id="social-heading" className="text-xl font-bold text-foreground mb-6">
              Find me online
            </h2>
            <div className="flex flex-wrap gap-3">
              {portfolioConfig.social.github && (
                <a
                  href={portfolioConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-border rounded text-sm font-mono hover:border-primary hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              )}
              {portfolioConfig.social.linkedin && (
                <a
                  href={portfolioConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-border rounded text-sm font-mono hover:border-primary hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </section>
        )}

        {/* What I'm looking for */}
        <section className="mb-16" aria-labelledby="looking-heading">
          <h2 id="looking-heading" className="text-xl font-bold text-foreground mb-6">
            What I&apos;m open to
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'New Opportunities', desc: 'Staff / Principal engineering roles, team leadership, or IC tracks.' },
              { title: 'AI Product Collaboration', desc: 'Building AI-powered products, developer tools, or internal platforms.' },
              { title: 'Advisory & Consulting', desc: 'Technical strategy, architecture reviews, and frontend performance audits.' },
              { title: 'Open Source', desc: 'Interesting open-source projects that solve real problems.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                <p className="text-secondary text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
