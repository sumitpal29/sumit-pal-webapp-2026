'use client';

import { motion } from 'framer-motion';


import { ProfileData } from '@/lib/cms';

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

interface AboutProps {
  profile?: ProfileData | null;
}

export function About({ profile }: AboutProps) {
  const aboutTexts = profile?.about ?? [];
  const skillsList = profile?.skills ?? [];

  return (
    <section
      id="about"
      className="relative min-[912px]:min-h-screen flex items-center justify-start px-6 md:px-12 lg:px-16 py-12 md:py-20 lg:py-32"
      aria-labelledby="about-heading"
    >
      <motion.div
        className="max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 md:mb-12">
          <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-foreground">
            <span className="text-primary">01.</span> About
          </h2>
          <div className="hidden md:block flex-grow h-px bg-border max-w-xs" />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-8 lg:gap-12">
          <div className="space-y-4">
            {aboutTexts.map((text, idx) => (
              <p key={idx} className="text-secondary leading-relaxed">
                {text}
              </p>
            ))}
          </div>

          <motion.div variants={itemVariants}>
            <div className="text-secondary font-mono text-sm">
              <p className="text-primary mb-4">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-xs rounded bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </section>
  );
}
