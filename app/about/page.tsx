import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfileConfigs, getExperiences } from '@/lib/cms';
import { portfolioConfig } from '@/config/portfolio.config';
import { Footer } from '@/components/portfolio/footer';

const baseUrl = portfolioConfig.site.url;

export const revalidate = 300;

const faqItems = [
  {
    question: 'Who is Sumit Pal?',
    answer:
      'Sumit Pal is a Staff Software Engineer and AI Product Builder based in India with over 8 years of industry experience. He specialises in building high-performance web applications, AI-powered products, and developer platforms at scale. Having worked across product startups and large engineering organisations, Sumit brings a rare combination of deep technical expertise and a founder mindset — he does not just write code, he thinks about product strategy, user impact, and long-term system health. He is proficient in TypeScript, React, Next.js, Node.js, and a growing suite of AI/LLM tooling including OpenAI APIs, LangChain, and vector databases.',
  },
  {
    question: 'Why this portfolio?',
    answer:
      'This portfolio exists to showcase real work — not polished slides or buzzword-heavy resumes. Every project, experiment, and lab app here reflects how Sumit actually thinks and builds. It is also a living product in its own right: built with Next.js App Router, powered by a GitHub-based CMS, and continuously improved. If you want to understand how Sumit approaches engineering and product problems, reading through this site is the fastest way to do it.',
  },
  {
    question: 'How do I contact Sumit?',
    answer: `The simplest way is email — reach out directly at ${portfolioConfig.email}. Sumit typically responds within 24–48 hours. You can also connect on LinkedIn or explore his open-source work on GitHub. For project enquiries, include a brief description of what you are building, the problem you are trying to solve, and your timeline. The more context you share, the more useful the first conversation will be.`,
  },
  {
    question: 'Why should I reach out to Sumit?',
    answer:
      'If you need someone who can take a vague product idea and turn it into a working, shippable application — Sumit is that person. He has led frontend architecture for products used by millions, integrated AI features into production systems, and built internal developer platforms that cut engineering cycle times significantly. As a freelancer, he operates with the speed and ownership mentality of a founding engineer. You get senior IC-level execution without the overhead of a large agency. Whether you need a greenfield MVP, an AI integration, or a performance audit of an existing product, Sumit can scope it, build it, and ship it.',
  },
  {
    question: 'What projects has Sumit handled?',
    answer:
      'Sumit has worked across a wide range of projects: consumer-facing web applications with complex real-time requirements, B2B SaaS dashboards, AI-powered internal tools, npm packages consumed by thousands of developers, and productivity micro-apps (see the Lab section). On the AI side, he has built LLM-backed features, RAG pipelines, and AI-assisted developer workflows. On the infrastructure side, he has designed component libraries, design systems, and frontend build tooling for large engineering teams. His open-source contributions and personal lab projects are publicly available on GitHub and throughout this site.',
  },
];

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${portfolioConfig.name} — Staff Software Engineer, AI Product Builder, and freelance developer available for projects.`,
  alternates: { canonical: `${baseUrl}/about` },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/about`,
    title: `About — ${portfolioConfig.name}`,
    description: `Learn more about ${portfolioConfig.name} — ${portfolioConfig.title.trim()}.`,
    siteName: portfolioConfig.name,
    images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About — ${portfolioConfig.name}`,
    description: `Learn more about ${portfolioConfig.name} — ${portfolioConfig.title.trim()}.`,
    creator: portfolioConfig.site.twitter,
    images: [`${baseUrl}/og-image.png`],
  },
};

export default async function AboutPage() {
  const [profile, experiences] = await Promise.all([
    getProfileConfigs(),
    getExperiences(),
  ]);

  const aboutTexts = profile?.about ?? [];
  const skillsList = profile?.skills ?? portfolioConfig.skills;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="py-20 px-6 md:px-12 lg:px-16 container max-w-4xl mx-auto">

        <div className="mb-12">
          <Link
            href="/"
            className="text-primary hover:text-accent transition-colors flex items-center gap-2 text-sm font-mono mb-8 inline-flex"
          >
            <span>←</span> Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-primary">Me</span>
          </h1>
          <p className="text-secondary leading-relaxed max-w-2xl">
            {portfolioConfig.description}
          </p>
        </div>

        {/* Bio */}
        <section className="mb-16" aria-labelledby="bio-heading">
          <h2 id="bio-heading" className="text-2xl font-bold mb-6 text-foreground">
            Background
          </h2>
          <div className="space-y-4">
            {aboutTexts.length > 0 ? (
              aboutTexts.map((text, idx) => (
                <p key={idx} className="text-secondary leading-relaxed">
                  {text}
                </p>
              ))
            ) : (
              <p className="text-secondary leading-relaxed">
                I am a Staff Software Engineer with a founder mindset, passionate about building
                high-performance applications, developer platforms, and AI-powered products.
              </p>
            )}
          </div>
        </section>

        {/* Skills */}
        <section className="mb-16" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-2xl font-bold mb-6 text-foreground">
            Skills &amp; Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 text-sm rounded bg-primary/10 text-primary border border-primary/20 font-medium font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Experience snapshot */}
        {experiences.length > 0 && (
          <section className="mb-16" aria-labelledby="experience-heading">
            <h2 id="experience-heading" className="text-2xl font-bold mb-6 text-foreground">
              Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div
                  key={exp.slug}
                  className="p-6 rounded border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-foreground">{exp.role}</span>
                      <span className="text-secondary"> @ </span>
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {exp.company}
                      </a>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{exp.period}</span>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connect */}
        <section className="mb-16" aria-labelledby="connect-heading">
          <h2 id="connect-heading" className="text-2xl font-bold mb-6 text-foreground">
            Connect
          </h2>
          <div className="flex flex-wrap gap-4">
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
            {portfolioConfig.email && (
              <a
                href={`mailto:${portfolioConfig.email}`}
                className="px-4 py-2 border border-border rounded text-sm font-mono hover:border-primary hover:text-primary transition-colors"
              >
                Email
              </a>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold mb-8 text-foreground">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group border border-border rounded bg-card open:border-primary/40 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                  <h3 className="font-semibold text-foreground text-base leading-snug">
                    {item.question}
                  </h3>
                  <span className="text-primary text-xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="h-px bg-border mb-4" />
                  <p className="text-secondary leading-relaxed text-sm">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FAQ JSON-LD for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqItems.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            }),
          }}
        />

        <Footer />
      </div>
    </div>
  );
}
