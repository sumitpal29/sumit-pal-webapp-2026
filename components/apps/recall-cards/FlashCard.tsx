'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { AnswerRenderer } from './AnswerRenderer';
import { RatingBar } from './RatingBar';
import type { ResolvedCard } from '@/lib/recall-cards/types';
import { cn } from '@/lib/utils';

interface Props {
  card: ResolvedCard;
  cardIndex: number;
  totalCards: number;
  onRate: (rating: number) => void;
  onSkip: () => void;
}

export function FlashCard({ card, cardIndex, totalCards, onRate, onSkip }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const handleFlip = () => setFlipped(true);

  const handleRate = (rating: number) => {
    setFlipped(false);
    setHintShown(false);
    onRate(rating);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{cardIndex + 1} / {totalCards}</span>
        <button
          onClick={onSkip}
          className="hover:text-foreground transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {card.effectiveTags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Card */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="rounded-2xl border border-border bg-card p-7 shadow-sm min-h-[280px] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                    Question
                  </p>
                  <div className={cn('text-foreground text-base leading-relaxed')}>
                    <QuestionMarkdown content={card.question} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  {card.hint && !hintShown ? (
                    <button
                      onClick={() => setHintShown(true)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Lightbulb size={13} />
                      Show hint
                    </button>
                  ) : card.hint && hintShown ? (
                    <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Lightbulb size={13} className="text-yellow-500" />
                      {card.hint}
                    </p>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={handleFlip}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Flip <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="rounded-2xl border border-primary/30 bg-card p-7 shadow-sm min-h-[280px] flex flex-col gap-5">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
                    Answer
                  </p>
                  <AnswerRenderer
                    answer={card.answer}
                    answerType={card.answerType}
                    answerLanguage={card.answerLanguage}
                  />
                </div>

                {card.description && (
                  <details className="text-xs text-muted-foreground border-t border-border pt-3">
                    <summary className="cursor-pointer hover:text-foreground transition-colors">
                      More context
                    </summary>
                    <p className="mt-2 leading-relaxed">{card.description}</p>
                  </details>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating — only visible after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <RatingBar onRate={handleRate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionMarkdown({ content }: { content: string }) {
  return (
    <div className="[&>p]:mb-2 [&>p:last-child]:mb-0 [&_code]:text-[0.82em] [&_code]:bg-muted [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-border [&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
