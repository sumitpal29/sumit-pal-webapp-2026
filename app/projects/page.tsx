import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/portfolio/theme-toggle';
import { CursorGlow } from '@/components/portfolio/cursor-glow';
import { getProjects, ProjectData } from '@/lib/cms';
import { portfolioConfig } from '@/config/portfolio.config';

const baseUrl = portfolioConfig.site.url;

export const metadata: Metadata = {
  title: 'Project Archive',
  description: `A complete list of projects shipped by ${portfolioConfig.name} — from production systems to side experiments.`,
  alternates: { canonical: `${baseUrl}/projects` },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/projects`,
    title: `Project Archive — ${portfolioConfig.name}`,
    description: `A complete list of projects shipped by ${portfolioConfig.name} — from production systems to side experiments.`,
    siteName: portfolioConfig.name,
    images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Project Archive — ${portfolioConfig.name}`,
    description: `A complete list of projects shipped by ${portfolioConfig.name} — from production systems to side experiments.`,
    creator: portfolioConfig.site.twitter,
    images: [`${baseUrl}/og-image.png`],
  },
};

export default async function ProjectsArchive() {
  const displayProjects = await getProjects();

  return (
    <div className="relative min-h-screen bg-background">
      <CursorGlow />
      <div className="fixed bottom-6 left-6 z-50">
        <ThemeToggle />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="mb-16 md:mb-24">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-accent font-medium mb-8 transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">Archive</h1>
          <p className="text-secondary text-lg mt-4 max-w-2xl">
            A complete list of projects I've shipped.
          </p>
        </div>

        <div className="w-full overflow-x-auto pb-8">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border/50 text-secondary">
                <th className="py-4 px-4 font-semibold text-sm">Year</th>
                <th className="py-4 px-4 font-semibold text-sm uppercase tracking-wider">Project</th>
                <th className="py-4 px-4 font-semibold text-sm uppercase tracking-wider hidden md:table-cell">Built with</th>
                <th className="py-4 px-4 font-semibold text-sm text-right uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody>
              {displayProjects.map((project, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/20 hover:bg-card/50 transition-colors duration-200 group"
                >
                  <td className="py-6 px-4 text-primary font-mono text-sm">{project.year}</td>
                  <td className="py-6 px-4">
                    <span className="text-foreground font-bold text-lg group-hover:text-primary transition-colors">
                      {project.title}
                    </span>
                    <p className="md:hidden text-secondary text-sm mt-2">{project.tech.join(' · ')}</p>
                  </td>
                  <td className="py-6 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span key={t} className="text-xs text-secondary bg-primary/5 px-2 py-1 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex justify-end gap-3">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-secondary hover:text-primary transition-colors"
                          aria-label={`${project.title} GitHub repo`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-secondary hover:text-primary transition-colors"
                          aria-label={`${project.title} live demo`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
