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

export function PinnedSection({ thoughts, tagMap, allTags, onDone, onDelete, onUpdate }: Props) {
  if (thoughts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400/80">
          Important + Urgent
        </span>
        <div className="flex-1 h-px bg-red-500/15" />
      </div>
      {thoughts.map((t) => (
        <BrainDumpItem
          key={t.id}
          thought={t}
          tagMap={tagMap}
          allTags={allTags}
          pinned
          onDone={() => onDone(t.id)}
          onDelete={() => onDelete(t.id)}
          onUpdate={(text, tagIds) => onUpdate(t.id, text, tagIds)}
        />
      ))}
    </div>
  );
}
