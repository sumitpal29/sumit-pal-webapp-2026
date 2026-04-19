'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-start px-6 md:px-12 lg:px-16 pt-20 lg:pt-0"
    >
      <motion.div
        className="max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={itemVariants} className="text-primary text-lg md:text-xl font-medium">
          Hi, my name is
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mt-4 md:mt-6"
        >
          Brittany Chiang
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-secondary mt-2 md:mt-4"
        >
          I build things for the web.
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-secondary text-base md:text-lg leading-relaxed mt-6 md:mt-8 max-w-2xl"
        >
          I'm a full-stack engineer passionate about building beautiful and functional digital
          experiences. Currently, I'm focused on building accessible products and working with a
          variety of technologies.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 md:mt-12">
          <Link
            href="#work"
            className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 border border-primary text-primary rounded font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            Check out my work
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hidden lg:block absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border border-primary rounded-full flex items-center justify-center">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
