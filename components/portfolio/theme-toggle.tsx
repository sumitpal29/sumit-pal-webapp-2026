'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Lollipop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a skeleton with exact same structural wrapper to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-card border border-border rounded-full p-2" aria-label="Toggle theme">
        <div className="p-1.5 w-7 h-7" />
        <div className="p-1.5 w-7 h-7" />
        <div className="p-1.5 w-7 h-7" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-full p-2" aria-label="Toggle theme">
      <button
        onClick={() => setTheme('candy')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'candy' ? 'bg-primary text-primary-foreground' : 'text-secondary hover:text-primary'}`}
        aria-label="Candy theme"
      >
        <Lollipop className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-secondary hover:text-primary'}`}
        aria-label="Light theme"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-secondary hover:text-primary'}`}
        aria-label="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
