import type { ReactNode } from 'react';
import { AppsHeader } from '@/components/apps/apps-header';
import { Footer } from '@/components/portfolio/footer';
import { ThemeToggle } from '@/components/portfolio/theme-toggle';

export default function AppsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppsHeader />
      <div className="flex-1">{children}</div>
      <div className="max-w-3xl mx-auto w-full px-6 pb-10">
        <Footer />
      </div>
      <div className="fixed bottom-6 left-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
