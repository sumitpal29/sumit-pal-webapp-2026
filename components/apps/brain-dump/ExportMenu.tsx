'use client';

import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { Thought, Tag } from '@/lib/brain-dump/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Props {
  thoughts: Thought[];
  tagMap: Record<string, Tag>;
}

function toMarkdown(thoughts: Thought[], tagMap: Record<string, Tag>): string {
  return thoughts
    .map((t) => {
      const tags = t.tags.map((id) => tagMap[id]?.label).filter(Boolean);
      const tagsStr = tags.length ? `  [${tags.join(', ')}]` : '';
      const date = new Date(t.createdAt).toLocaleString();
      return `- ${t.text}${tagsStr}\n  *${date}*`;
    })
    .join('\n\n');
}

export function ExportMenu({ thoughts, tagMap }: Props) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(toMarkdown(thoughts, tagMap));
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const md = toMarkdown(thoughts, tagMap);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain-dump-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-sm">
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          <Copy size={13} /> Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} className="gap-2">
          <Download size={13} /> Download .md
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
