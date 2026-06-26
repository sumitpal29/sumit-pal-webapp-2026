'use client';

import { ReactNode } from 'react';
import { CursorGlow } from './cursor-glow';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { SectionContainer } from './section-container';
import { ThemeToggle } from './theme-toggle';

interface PortfolioLayoutProps {
  children: ReactNode;
}

const sections = ['hero', 'blog', 'lab', 'experience', 'projects', 'contact'];

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const activeSection = useScrollSpy(sections);

  return (
    <div className="relative bg-background">
      <CursorGlow />
      <div className="fixed bottom-6 left-6 z-50">
        <ThemeToggle />
      </div>
      <SectionContainer activeSection={activeSection}>
        <main id="main" className="relative z-10 w-full" role="main">
          {children}
        </main>
      </SectionContainer>
    </div>
  );
}
