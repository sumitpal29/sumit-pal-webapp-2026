import type { Thought, Tag } from '@/lib/brain-dump/types';
import { BrainDumpItem } from './BrainDumpItem';

interface Props {
  thoughts: Thought[];
  tagMap: Record<string, Tag>;
  allTags: Tag[];
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, tagIds: string[]) => void;
}

export function BrainDumpList({ thoughts, tagMap, allTags, onDone, onDelete, onUpdate }: Props) {
  if (thoughts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {thoughts.map((t) => (
        <BrainDumpItem
          key={t.id}
          thought={t}
          tagMap={tagMap}
          allTags={allTags}
          onDone={() => onDone(t.id)}
          onDelete={() => onDelete(t.id)}
          onUpdate={(text, tagIds) => onUpdate(t.id, text, tagIds)}
        />
      ))}
    </div>
  );
}
