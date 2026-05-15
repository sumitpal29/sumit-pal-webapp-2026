'use client';

import { useState, useRef, useEffect } from 'react';
import { Tags } from 'lucide-react';
import type { Tag } from '@/lib/brain-dump/types';
import { TagBadge } from './TagBadge';
import { TagPicker } from './TagPicker';

interface Props {
  tags: Tag[];
  onSave: (text: string, tagIds: string[]) => void;
  onManageTags: () => void;
}

export function BrainDumpInput({ tags, onSave, onManageTags }: Props) {
  const [text, setText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text, selectedTagIds);
    setText('');
    setSelectedTagIds([]);
    setTagPickerOpen(false);
    textareaRef.current?.focus();
  };

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-xl border border-border bg-card focus-within:border-primary/50 focus-within:shadow-sm transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? (↵ to save, Shift+↵ for newline)"
          rows={3}
          className="w-full resize-none bg-transparent px-4 pt-4 pb-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => setTagPickerOpen((v) => !v)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              tagPickerOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Tags size={13} />
            {selectedTags.length === 0 ? 'Add tags' : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
          </button>
          <span className="text-[10px] text-muted-foreground/60">↵ save</span>
        </div>
      </div>

      {/* Selected tag pills */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="xs"
              onRemove={() =>
                setSelectedTagIds((prev) => prev.filter((id) => id !== tag.id))
              }
            />
          ))}
        </div>
      )}

      {/* Tag picker */}
      {tagPickerOpen && (
        <TagPicker
          tags={tags}
          selectedTagIds={selectedTagIds}
          onChange={setSelectedTagIds}
          onManageTags={onManageTags}
        />
      )}
    </div>
  );
}
