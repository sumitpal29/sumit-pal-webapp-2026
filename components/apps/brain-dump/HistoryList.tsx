import type { Thought, Tag } from '@/lib/brain-dump/types';
import { TagBadge } from './TagBadge';
import { parseSegments } from '@/lib/brain-dump/text-render';

interface Props {
  thoughts: Thought[];
  tagMap: Record<string, Tag>;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

function groupByDate(thoughts: Thought[]): { label: string; items: Thought[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86_400_000;
  const weekAgo = today - 7 * 86_400_000;

  const buckets: Record<string, Thought[]> = {};
  for (const t of thoughts) {
    let label: string;
    if (t.createdAt >= today) label = 'Today';
    else if (t.createdAt >= yesterday) label = 'Yesterday';
    else if (t.createdAt >= weekAgo) label = 'This Week';
    else {
      label = new Date(t.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    (buckets[label] ??= []).push(t);
  }

  const order = ['Today', 'Yesterday', 'This Week'];
  return Object.entries(buckets).sort(([a], [b]) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  }).map(([label, items]) => ({ label, items }));
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {parseSegments(text).map((seg, i) => {
        if (seg.type === 'bold') return <strong key={i}>{seg.value}</strong>;
        if (seg.type === 'link')
          return <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{seg.value}</a>;
        return <span key={i}>{seg.value}</span>;
      })}
    </>
  );
}

const STATUS_STYLES: Record<string, string> = {
  open: 'text-primary bg-primary/10 border-primary/20',
  done: 'text-green-500 bg-green-500/10 border-green-500/20',
  archived: 'text-muted-foreground bg-muted border-border',
};

export function HistoryList({ thoughts, tagMap, onRestore, onDelete }: Props) {
  if (thoughts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No history yet.
      </p>
    );
  }

  const groups = groupByDate(thoughts);

  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ label, items }) => (
        <div key={label} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {items.map((t) => {
            const thoughtTags = t.tags.map((id) => tagMap[id]).filter(Boolean);
            return (
              <div
                key={t.id}
                className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words flex-1">
                    <RichText text={t.text} />
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_STYLES[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1">
                    {thoughtTags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} size="xs" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <time className="text-[10px] text-muted-foreground/60">
                      {new Date(t.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                    {t.status !== 'open' && (
                      <button
                        onClick={() => onRestore(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-[11px] text-primary hover:underline transition-opacity"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
