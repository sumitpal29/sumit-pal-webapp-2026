'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, History, BrainCircuit } from 'lucide-react';
import { TagSelector } from '@/components/apps/recall-cards/TagSelector';
import { loadTagMap } from '@/lib/recall-cards/deck-loader';
import { getSessions, removeSession, getPrefs } from '@/lib/recall-cards/storage';
import type { TagMap, ActiveSession } from '@/lib/recall-cards/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RecallCardsPage() {
  const router = useRouter();
  const [tagMap, setTagMap] = useState<TagMap>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [pausedSessions, setPausedSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    loadTagMap().then((map) => {
      setTagMap(map);
      setLoading(false);
    });
    const prefs = getPrefs();
    if (prefs.resumeSessionOnRefresh) {
      setPausedSessions(getSessions());
    }
  }, []);

  const totalCards = selected.reduce((sum, tag) => {
    return sum + (tagMap[tag]?.cardCount ?? 0);
  }, 0);

  const handleToggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    router.push(`/apps/recall-cards/session?tags=${selected.join(',')}`);
  };

  const confirmRemoveSession = () => {
    if (!pendingRemoveId) return;
    removeSession(pendingRemoveId);
    setPausedSessions((prev) => prev.filter((s) => s.id !== pendingRemoveId));
    setPendingRemoveId(null);
  };

  return (
    <>
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-10">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <BrainCircuit size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Recall Cards</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick topics, flip cards, rate yourself. SM-2 remembers what to bring back.
          </p>
        </div>
        <Link
          href="/apps/recall-cards/history"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <History size={13} />
          History
        </Link>
      </div>

      {/* Paused sessions stack */}
      {pausedSessions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Paused sessions
          </p>
          {pausedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.queue.length} card{session.queue.length !== 1 ? 's' : ''} remaining
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() =>
                    router.push(
                      `/apps/recall-cards/session?tags=${session.tags.join(',')}`
                    )
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Resume →
                </button>
                <button
                  onClick={() => setPendingRemoveId(session.id)}
                  aria-label="Remove session"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tag picker */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Choose topics</p>
        {loading ? (
          <div className="flex gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 w-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <TagSelector tagMap={tagMap} selected={selected} onToggle={handleToggle} />
        )}
      </div>

      {/* Start CTA */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleStart}
          disabled={selected.length === 0}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {selected.length === 0
            ? 'Select topics to begin'
            : `Start session · ${totalCards} cards`}
        </button>
        {selected.length > 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            Cards already mastered are automatically skipped
          </p>
        )}
      </div>
    </main>

      <AlertDialog open={pendingRemoveId !== null} onOpenChange={(open) => !open && setPendingRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove paused session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your card progress is safe — only the current queue will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
