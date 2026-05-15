'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Apps', href: '/apps' },
  { label: 'Blogs', href: '/blogs' },
];

export function AppsHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-center">
        <nav className="flex items-center gap-1">
          {navLinks.map(({ label, href }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-widest transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-secondary hover:text-foreground'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
