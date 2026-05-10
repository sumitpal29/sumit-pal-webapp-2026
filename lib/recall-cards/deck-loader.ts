import type { CardDeck, TagMap, ResolvedCard } from './types';
import { isDue } from './scheduler';
import { getProgress } from './storage';
import { buildKnowledgeBaseUrl } from '@/lib/cms';

// Paths inside the knowledge-base CMS project:
//   knowledge-base/recall-cards/tag-map.json
//   knowledge-base/recall-cards/decks/<file>
export async function loadTagMap(): Promise<TagMap> {
  const url = buildKnowledgeBaseUrl('recall-cards/tag-map.json');
  const res = await fetch(url);
  return res.json() as Promise<TagMap>;
}

async function loadDeck(file: string): Promise<CardDeck> {
  const url = buildKnowledgeBaseUrl(`recall-cards/decks/${file}`);
  const res = await fetch(url);
  return res.json() as Promise<CardDeck>;
}

export async function buildSessionQueue(
  selectedTags: string[],
  tagMap: TagMap
): Promise<ResolvedCard[]> {
  // Collect which deck files are needed and their max relevance per tag selection
  const deckRelevance = new Map<string, number>();
  for (const tag of selectedTags) {
    const entry = tagMap[tag];
    if (!entry) continue;
    for (const { file, relevance } of entry.decks) {
      const existing = deckRelevance.get(file) ?? 0;
      deckRelevance.set(file, Math.max(existing, relevance));
    }
  }

  // Fetch all needed decks in parallel
  const deckFiles = Array.from(deckRelevance.keys());
  const decks = await Promise.all(deckFiles.map(loadDeck));

  // Flatten cards, deduplicate by id, filter by selected tags
  const seen = new Set<string>();
  const resolved: ResolvedCard[] = [];

  for (const deck of decks) {
    const deckRelevanceScore = deckRelevance.get(`${deck.id}.json`) ?? 0.5;

    for (const card of deck.cards) {
      if (seen.has(card.id)) continue;
      seen.add(card.id);

      const effectiveTags = Array.from(new Set([...deck.tags, ...card.tags]));
      const matchesSelection = selectedTags.some((t) => effectiveTags.includes(t));
      if (!matchesSelection) continue;

      resolved.push({
        ...card,
        deckId: deck.id,
        effectiveTags,
        relevance: deckRelevanceScore,
      });
    }
  }

  // Filter to cards that are due
  const progress = getProgress();
  const due = resolved.filter((card) => {
    const p = progress[card.id];
    return !p || isDue(p);
  });

  // Sort: relevance desc, then shuffle within same relevance tier
  return sortWithShuffle(due);
}

function sortWithShuffle(cards: ResolvedCard[]): ResolvedCard[] {
  // Group by relevance tier (round to 1 decimal to avoid float noise)
  const groups = new Map<number, ResolvedCard[]>();
  for (const card of cards) {
    const tier = Math.round(card.relevance * 10) / 10;
    const group = groups.get(tier) ?? [];
    group.push(card);
    groups.set(tier, group);
  }

  // Sort tiers descending, shuffle within each
  const tiers = Array.from(groups.keys()).sort((a, b) => b - a);
  const result: ResolvedCard[] = [];
  for (const tier of tiers) {
    result.push(...shuffle(groups.get(tier)!));
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Insert a card back into queue at ~30% remaining position (for requeue on low rating)
export function insertRequeue(queue: string[], cardId: string): string[] {
  const insertAt = Math.max(1, Math.floor(queue.length * 0.3));
  const next = [...queue];
  next.splice(insertAt, 0, cardId);
  return next;
}
