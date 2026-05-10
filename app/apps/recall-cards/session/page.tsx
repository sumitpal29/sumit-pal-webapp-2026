'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FlashCard } from '@/components/apps/recall-cards/FlashCard';
import { SessionSummary } from '@/components/apps/recall-cards/SessionSummary';
import { SessionToggle } from '@/components/apps/recall-cards/SessionToggle';
import { buildSessionQueue, insertRequeue, loadTagMap } from '@/lib/recall-cards/deck-loader';
import {
  getProgress,
  saveProgress,
  getSessionForTags,
  upsertSession,
  removeSession,
  appendSessionToHistory,
  getPrefs,
  savePrefs,
} from '@/lib/recall-cards/storage';
import {
  applyRating,
  tickSession,
  shouldRequeue,
  defaultProgress,
} from '@/lib/recall-cards/scheduler';
import type { ResolvedCard, SessionRecord, UserPrefs } from '@/lib/recall-cards/types';

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tags = (searchParams.get('tags') ?? '').split(',').filter(Boolean);

  const [cards, setCards] = useState<ResolvedCard[]>([]);
  const [cardMap, setCardMap] = useState<Record<string, ResolvedCard>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [prefs, setPrefs] = useState<UserPrefs>({ resumeSessionOnRefresh: true });
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (tags.length === 0) { router.replace('/apps/recall-cards'); return; }

    const loadedPrefs = getPrefs();
    setPrefs(loadedPrefs);

    async function init() {
      const tagMap = await loadTagMap();

      // Check for resumable session matching these tags
      const existing = getSessionForTags(tags);
      if (loadedPrefs.resumeSessionOnRefresh && existing) {
        sessionIdRef.current = existing.id;
        startedAtRef.current = new Date(existing.startedAt).getTime();
        setRatings(existing.ratings);
        setCompleted(existing.completed);

        const resolvedCards = await buildSessionQueue(tags, tagMap);
        const map: Record<string, ResolvedCard> = {};
        resolvedCards.forEach((c) => { map[c.id] = c; });
        setCardMap(map);
        setCards(resolvedCards);
        setQueue(existing.queue);
        setLoading(false);
        return;
      }

      // Fresh session — tick SM-2 progress counters
      const progress = getProgress();
      const ticked = tickSession(progress);
      saveProgress(ticked);

      const resolvedCards = await buildSessionQueue(tags, tagMap);
      const map: Record<string, ResolvedCard> = {};
      resolvedCards.forEach((c) => { map[c.id] = c; });
      setCardMap(map);
      setCards(resolvedCards);

      const initialQueue = resolvedCards.map((c) => c.id);
      setQueue(initialQueue);
      setLoading(false);

      if (loadedPrefs.resumeSessionOnRefresh) {
        upsertSession({
          id: sessionIdRef.current,
          tags,
          queue: initialQueue,
          completed: [],
          ratings: {},
          startedAt: new Date(startedAtRef.current).toISOString(),
        });
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback(
    (nextQueue: string[], nextCompleted: string[], nextRatings: Record<string, number>) => {
      if (prefs.resumeSessionOnRefresh) {
        upsertSession({
          id: sessionIdRef.current,
          tags,
          queue: nextQueue,
          completed: nextCompleted,
          ratings: nextRatings,
          startedAt: new Date(startedAtRef.current).toISOString(),
        });
      }
    },
    [prefs.resumeSessionOnRefresh, tags]
  );

  const handleRate = useCallback(
    (rating: number) => {
      const cardId = queue[0];
      if (!cardId) return;

      // Update SM-2 progress
      const progress = getProgress();
      const current = progress[cardId] ?? defaultProgress(cardId);
      progress[cardId] = applyRating(current, rating);
      saveProgress(progress);

      const nextRatings = { ...ratings, [cardId]: rating };
      setRatings(nextRatings);

      let nextQueue = queue.slice(1);
      let nextCompleted = completed;

      if (shouldRequeue(rating)) {
        nextQueue = insertRequeue(nextQueue, cardId);
      } else {
        nextCompleted = [...completed, cardId];
      }

      if (nextQueue.length === 0) {
        // Session finished
        const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        const allRatings = Object.values(nextRatings);
        const avg = allRatings.length
          ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
          : 0;
        const breakdown: Record<string, number> = {};
        for (const r of allRatings) {
          breakdown[r] = (breakdown[r] ?? 0) + 1;
        }
        const record: SessionRecord = {
          id: sessionIdRef.current,
          date: new Date().toISOString(),
          tags,
          durationSeconds,
          cardsReviewed: nextCompleted.length,
          avgRating: Math.round(avg * 10) / 10,
          ratingBreakdown: breakdown,
        };
        appendSessionToHistory(record);
        removeSession(sessionIdRef.current);
        setSessionRecord(record);
        setDone(true);
        return;
      }

      setQueue(nextQueue);
      setCompleted(nextCompleted);
      persistSession(nextQueue, nextCompleted, nextRatings);
    },
    [queue, completed, ratings, persistSession, tags]
  );

  const handleSkip = useCallback(() => {
    const cardId = queue[0];
    if (!cardId) return;
    const nextQueue = [...queue.slice(1), cardId];
    setQueue(nextQueue);
    persistSession(nextQueue, completed, ratings);
  }, [queue, completed, ratings, persistSession]);

  const handlePrefsChange = (next: UserPrefs) => {
    setPrefs(next);
    savePrefs(next);
    if (!next.resumeSessionOnRefresh) removeSession(sessionIdRef.current);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Building your deck…</p>
        </div>
      </div>
    );
  }

  if (queue.length === 0 && !done) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center max-w-sm px-6">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-foreground mb-2">All caught up!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            No cards are due for the selected topics. Come back after a few more sessions.
          </p>
          <Link
            href="/apps/recall-cards"
            className="text-sm text-primary hover:underline"
          >
            ← Back to topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 md:py-16 flex flex-col gap-8">
      {/* In-app back nav + session settings */}
      <div className="flex items-center justify-between">
        <Link
          href="/apps/recall-cards"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Topics
        </Link>
        {!done && (
          <SessionToggle prefs={prefs} onPrefsChange={handlePrefsChange} />
        )}
      </div>

        {done && sessionRecord ? (
          <SessionSummary record={sessionRecord} />
        ) : (
          <FlashCard
            card={cardMap[queue[0]]}
            cardIndex={completed.length}
            totalCards={cards.length}
            onRate={handleRate}
            onSkip={handleSkip}
          />
        )}
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionContent />
    </Suspense>
  );
}
