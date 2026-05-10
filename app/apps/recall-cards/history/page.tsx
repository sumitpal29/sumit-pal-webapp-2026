'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { SessionHistoryList } from '@/components/apps/recall-cards/SessionHistoryList';
import { getHistory, saveProgress, clearAllSessions } from '@/lib/recall-cards/storage';
import type { SessionHistory } from '@/lib/recall-cards/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionHistory>({ sessions: [] });

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleReset = () => {
    if (!confirm('Reset all progress and history? This cannot be undone.')) return;
    saveProgress({});
    clearAllSessions();
    localStorage.removeItem('recall-cards:history');
    setHistory({ sessions: [] });
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/apps/recall-cards"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft size={13} />
              Back
            </Link>
            <h1 className="text-xl font-bold text-foreground">Session History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {history.sessions.length} session{history.sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {history.sessions.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={12} />
              Reset all
            </button>
          )}
        </div>

        <SessionHistoryList sessions={history.sessions} />
    </main>
  );
}
