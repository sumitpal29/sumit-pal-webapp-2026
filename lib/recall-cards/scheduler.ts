import type { CardProgress } from './types';

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

export function defaultProgress(cardId: string): CardProgress {
  return {
    cardId,
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    sessionsSinceReview: 0,
    totalReviews: 0,
    lastRating: 0,
    lastReviewedAt: new Date().toISOString(),
  };
}

// UI uses 1–5; SM-2 algorithm uses 0–5 quality scale
function toQuality(rating: number): number {
  const map: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 };
  return map[rating] ?? 3;
}

export function applyRating(p: CardProgress, rating: number): CardProgress {
  const q = toQuality(rating);
  let { easeFactor, interval, repetitions } = p;

  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  return {
    ...p,
    easeFactor,
    interval,
    repetitions,
    totalReviews: p.totalReviews + 1,
    lastRating: rating,
    lastReviewedAt: new Date().toISOString(),
    sessionsSinceReview: 0,
  };
}

export function tickSession(store: ProgressStore): ProgressStore {
  return Object.fromEntries(
    Object.entries(store).map(([id, p]) => [
      id,
      { ...p, sessionsSinceReview: p.sessionsSinceReview + 1 },
    ])
  );
}

export const isDue = (p: CardProgress): boolean =>
  p.sessionsSinceReview >= p.interval;

export const shouldRequeue = (rating: number): boolean => rating <= 2;
