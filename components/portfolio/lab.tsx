'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BrainCircuit, Wind, Timer, StickyNote, ArrowRight, type LucideIcon } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { LabAppData } from '@/lib/cms';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const iconMap: Record<string, LucideIcon> = {
  BrainCircuit,
  Wind,
  Timer,
  StickyNote,
};

interface Props {
  apps: LabAppData[];
}

export function Lab({ apps }: Props) {
  return (
    <section
      id="lab"
      className="relative flex items-start justify-start px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16"
    >
      <motion.div
        className="max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Heading */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">02.</span> Lab
          </h2>
          <div className="hidden md:block flex-grow h-px bg-border max-w-xs" />
        </motion.div>

        <motion.p variants={itemVariants} className="text-secondary text-sm leading-relaxed mb-8 max-w-md">
          Small tools I built for myself — productivity apps that scratch an itch.
          localStorage-first, no login required.
        </motion.p>

        {/* Cards — carousel */}
        <motion.div variants={itemVariants} className="relative">
          <Carousel
            opts={{ align: 'start', dragFree: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {apps.map((app) => {
                const isLive = app.status === 'live';
                const Icon = iconMap[app.icon];
                return (
                  <CarouselItem key={app.id} className="pl-3 basis-[200px]">
                    <Link
                      href={app.href}
                      className="group relative flex flex-col gap-3 p-5 rounded-lg border border-border bg-card hover:border-primary/60 transition-all duration-200 hover:shadow-md hover:shadow-primary/8 h-full"
                    >
                      {/* Status dot */}
                      <span
                        className={`absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full ${
                          isLive ? 'bg-green-500' : 'bg-border'
                        }`}
                      />

                      <div className="text-primary">
                        {Icon && <Icon size={18} />}
                      </div>

                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {app.name}
                      </p>

                      <p className="text-xs text-secondary leading-relaxed flex-1">
                        {app.shortDescription}
                      </p>

                      <span
                        className={`self-start text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isLive ? 'live' : 'soon'}
                      </span>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden sm:flex" />
            <CarouselNext className="-right-4 hidden sm:flex" />
          </Carousel>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="mt-8">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-foreground transition-colors group"
          >
            Explore the Lab
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
