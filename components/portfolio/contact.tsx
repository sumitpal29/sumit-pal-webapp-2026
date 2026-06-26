'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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

interface ContactProps {
  email?: string;
  socials?: Array<{ name: string; href: string; ariaLabel?: string }>;
}

export function Contact({ email, socials }: ContactProps) {
  const displayEmail = email || 'hello@example.com';
  const displaySocials = socials?.length ? socials : [
    { name: 'Twitter', href: 'https://twitter.com' },
    { name: 'GitHub', href: 'https://github.com' },
    { name: 'LinkedIn', href: 'https://linkedin.com' },
    { name: 'CodePen', href: 'https://codepen.io' },
  ];

  return (
    <section
      id="contact"
      className="relative flex items-start justify-center px-6 md:px-8 lg:px-10 py-10 md:py-12 lg:py-16"
    >
      <motion.div
        className="max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">05.</span> What's Next?
          </h2>
        </motion.div>

        <motion.h3
          variants={itemVariants}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8"
        >
          Get In Touch
        </motion.h3>

        <motion.p
          variants={itemVariants}
          className="text-secondary leading-relaxed mb-8 md:mb-12 max-w-xl mx-auto"
        >
          I'm always interested in hearing about new projects and opportunities. Whether you have
          a question or just want to say hi, feel free to reach out!
        </motion.p>

        <motion.div variants={itemVariants}>
          <a
            href={`mailto:${displayEmail}`}
            className="inline-flex items-center gap-3 px-8 py-4 border border-primary text-primary rounded font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 mb-8 md:mb-12"
          >
            Say Hello
            <span className="text-xl">→</span>
          </a>
        </motion.div>

        <motion.footer
          variants={itemVariants}
          className="space-y-6 pt-10 md:pt-12 border-t border-border"
        >
          <nav className="flex flex-wrap justify-center gap-8">
            {displaySocials.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel || social.name}
                className="text-secondary hover:text-primary transition-colors duration-200"
              >
                {social.name}
              </a>
            ))}
          </nav>

          <nav className="flex flex-wrap justify-center gap-6">
            {[
              { name: 'About', href: '/about' },
              { name: 'Contact', href: '/contact' },
              { name: 'Privacy', href: '/privacy' },
              { name: 'Terms', href: '/terms' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <p className="text-muted-foreground text-sm font-mono">
            Designed & Built by Sumit Pal
          </p>
        </motion.footer>
      </motion.div>
    </section>
  );
}
