'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { AnswerType } from '@/lib/recall-cards/types';
import styles from './answer.module.css';

interface Props {
  answer: string;
  answerType: AnswerType;
  answerLanguage?: string;
}

export function AnswerRenderer({ answer, answerType, answerLanguage }: Props) {
  if (answerType === 'text') {
    return <p className="text-foreground text-sm leading-relaxed">{answer}</p>;
  }

  if (answerType === 'code') {
    const fenced = `\`\`\`${answerLanguage ?? ''}\n${answer}\n\`\`\``;
    return (
      <div className={styles.prose}>
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{fenced}</ReactMarkdown>
      </div>
    );
  }

  // markdown (default)
  return (
    <div className={styles.prose}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {answer}
      </ReactMarkdown>
    </div>
  );
}
