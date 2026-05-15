'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectData } from '@/lib/cms';
import styles from './readme.module.css';

function githubToRawReadme(githubUrl: string): string {
  const match = githubUrl.match(/github\.com\/([^/]+\/[^/?#]+)/);
  if (!match) return '';
  const repo = match[1].replace(/\.git$/, '');
  return `https://raw.githubusercontent.com/${repo}/main/README.md`;
}

interface Props {
  project: ProjectData;
}

export function ProjectReadmeSheet({ project }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    if (!open || content !== null || !project.github) return;

    setLoading(true);
    setNotFound(false);
    try {
      const url = githubToRawReadme(project.github);
      const res = await fetch(url);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error(`${res.status}`);
      setContent(await res.text());
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (!project.github) return null;

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <BookOpen size={14} />
          Quick view
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-base font-semibold text-foreground">
            {project.title}
          </SheetTitle>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors mt-1 font-mono"
          >
            {project.github.replace('https://', '')}
            <ExternalLink size={11} />
          </a>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5">
            {loading && <ReadmeSkeleton />}

            {notFound && (
              <p className="text-sm text-muted-foreground mt-2">
                No README found on the main branch.
              </p>
            )}

            {content && (
              <article className={styles.prose}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ReadmeSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-1">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-5/6" />
      <Skeleton className="h-3.5 w-4/6" />
      <Skeleton className="h-5 w-36 mt-3" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-24 w-full mt-2 rounded-md" />
    </div>
  );
}
