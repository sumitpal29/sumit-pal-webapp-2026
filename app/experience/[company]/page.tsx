import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getExperiences } from '@/lib/cms';

export default async function DetailedExperiencePage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  
  const experiences = await getExperiences();
  const exp = experiences.find((e) => e.slug === company);

  if (!exp) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 md:px-12 lg:px-16 container max-w-4xl mx-auto">
      <div className="mb-12">
        <Link 
          href="/#experience" 
          className="text-primary hover:text-accent transition-colors flex items-center gap-2 text-sm font-mono mb-8 inline-flex"
        >
          <span>←</span> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {exp.role} <span className="text-primary">@ {exp.company}</span>
        </h1>
        <p className="text-secondary font-mono text-lg mb-6">{exp.period}</p>
        <p className="text-secondary leading-relaxed bg-card p-6 rounded border border-border">
          {exp.description}
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-primary">#</span> What I did
        </h2>
        <ul className="space-y-4">
          {exp.responsibilities.map((resp, i) => (
            <li key={i} className="text-secondary text-base md:text-lg flex gap-4">
              <span className="text-primary flex-shrink-0 mt-1">▸</span>
              <span>{resp}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-16 pt-8 border-t border-border">
        <a 
          href={exp.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
        >
          Visit {exp.company} Website
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
