export type AnswerType = 'text' | 'markdown' | 'code';

export interface Card {
  id: string;
  question: string;
  answer: string;
  answerType: AnswerType;
  answerLanguage?: string;
  hint?: string;
  description?: string;
  tags: string[];
  source?: CardSource;
}

export interface CardSource {
  path: string;
  section?: string;
  highlight?: string;
}

export interface CardDeck {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  cards: Card[];
}

export interface TagEntry {
  label: string;
  description: string;
  decks: Array<{ file: string; relevance: number }>;
  related: string[];
  cardCount: number;
}

export type TagMap = Record<string, TagEntry>;

export interface CardProgress {
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  sessionsSinceReview: number;
  totalReviews: number;
  lastRating: number;
  lastReviewedAt: string;
}

export type ProgressStore = Record<string, CardProgress>;

export interface ActiveSession {
  id: string;
  tags: string[];
  queue: string[];
  completed: string[];
  ratings: Record<string, number>;
  startedAt: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  tags: string[];
  durationSeconds: number;
  cardsReviewed: number;
  avgRating: number;
  ratingBreakdown: Record<string, number>;
}

export interface SessionHistory {
  sessions: SessionRecord[];
}

export interface UserPrefs {
  resumeSessionOnRefresh: boolean;
}

// Card enriched with its deck's tags merged in
export interface ResolvedCard extends Card {
  deckId: string;
  effectiveTags: string[];
  relevance: number;
}
