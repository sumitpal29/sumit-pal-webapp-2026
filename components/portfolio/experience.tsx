'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { ExperienceData } from '@/lib/cms';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface ExperienceProps {
  experiences?: ExperienceData[];
}

export function Experience({ experiences }: ExperienceProps) {
  const displayExperiences = experiences ?? [];

  return (
    <section
      id="experience"
      className="relative flex items-start justify-start px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16"
    >
      <motion.div
        className="max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">02.</span> Experience
          </h2>
          <div className="hidden md:block flex-grow h-px bg-border max-w-xs" />
        </motion.div>

        <div className="space-y-8">
          {displayExperiences.map((exp, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 rounded border border-border hover:border-primary transition-colors duration-200 hover:shadow-lg hover:shadow-primary/10 flex flex-col h-full"
            >
              <div className="mb-4">
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-xl font-bold text-primary hover:underline"
                >
                  {exp.company}
                </a>
                <p className="text-foreground font-semibold mt-0.5">{exp.role}</p>
                <p className="text-secondary text-sm font-mono mt-0.5">{exp.period}</p>
              </div>

              <p className="text-secondary text-sm mb-6 flex-grow line-clamp-3">
                {exp.description}
              </p>

              <div className="mt-auto">
                <Link
                  href={`/experience/${exp.slug}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  Show Detailed Experience
                  <span className="ml-1 text-lg leading-none">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
