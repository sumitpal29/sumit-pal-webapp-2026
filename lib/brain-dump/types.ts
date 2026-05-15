export type ThoughtStatus = 'open' | 'done' | 'archived';

export interface Thought {
  id: string;
  text: string;
  tags: string[];
  status: ThoughtStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  label: string;
  color: string; // hsl(...) computed once on creation
  system: boolean; // system tags cannot be deleted or renamed
  priority: number; // lower = higher in the filter bar
}

export type TagMap = Record<string, Tag>;
