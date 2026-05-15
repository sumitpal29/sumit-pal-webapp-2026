'use client';

import { StickyBoard } from '@/components/apps/sticky-notes/StickyBoard';

export default function StickyNotesPage() {
  return (
    // Fill the flex-1 area left by the apps layout; no footer padding needed for a canvas app
    <div className="w-full" style={{ height: 'calc(100dvh - 3.5rem)' }}>
      <StickyBoard />
    </div>
  );
}
