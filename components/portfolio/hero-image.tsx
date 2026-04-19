'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function HeroImage() {
  return (
    <section className="relative w-full flex items-center justify-center pt-24 pb-8 md:pt-32 md:pb-12 px-6 md:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl shadow-foreground/10 border-4 border-border shadow-xl/20"
      >
        <Image
          src="/sumit-pal-ai-architect.png"
          alt="Sumit Pal"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </section>
  );
}
