'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { portfolioConfig } from '@/config/portfolio.config';

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

interface SectionContainerProps {
  children?: ReactNode;
  activeSection?: string;
}

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Personal Projects', href: '#projects' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' },
];

export function SectionContainer({ children, activeSection }: SectionContainerProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 80);
  });

  const sideAWidthClass = "min-[912px]:w-[40%]";
  const sideBWidthClass = "min-[912px]:w-[60%]";

  function scrollTo(href: string) {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <>
      {/* Mobile top nav — hidden on desktop */}
      <header className={`min-[912px]:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur border-b border-border' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 py-3">
          <span className={`font-bold text-sm font-mono transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
            {portfolioConfig.name.split(' ')[0]}
          </span>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="p-2 text-foreground"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="bg-background/95 backdrop-blur border-b border-border px-6 pb-4">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollTo(item.href)}
                      className={`w-full text-left py-2.5 text-sm font-mono font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-secondary'}`}
                    >
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

    <div className="mx-auto max-w-[1200px] w-full flex flex-col min-[912px]:flex-row relative px-6 md:px-12 lg:px-12">

      {/* Side A */}
      <div
        className={`w-full ${sideAWidthClass} min-[912px]:sticky min-[912px]:top-0 min-[912px]:h-screen py-8 min-[912px]:py-16 flex flex-col justify-between transition-[width] duration-500 ease-out`}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={itemVariants} className="text-primary text-lg md:text-xl font-medium">
            Hi, my name is
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 md:mt-6"
          >
            {portfolioConfig.name}
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary mt-2 md:mt-4"
          >
            {portfolioConfig.title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-secondary text-sm md:text-base leading-relaxed mt-6 md:mt-8 max-w-sm"
          >
            {portfolioConfig.description}
          </motion.p>

          {/* Navigation Links */}
          <motion.nav variants={itemVariants} className="mt-16 hidden min-[912px]:block">
            <ul className="flex flex-col w-max">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center py-3 transition-colors duration-700 ${
                        isActive ? 'text-foreground' : 'text-secondary hover:text-foreground'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span
                        className={`mr-4 h-px transition-all duration-700 ease-out ${
                          isActive
                            ? 'w-16 bg-foreground'
                            : 'w-6 bg-secondary group-hover:w-12 group-hover:bg-foreground'
                        }`}
                      ></span>
                      <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-700 ${isActive ? 'text-foreground' : ''}`}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>

        </motion.div>
      </div>

      {/* Side B */}
      <div
        className={`w-full ${sideBWidthClass} py-0 min-[912px]:py-16 flex flex-col transition-[width] duration-500 ease-out`}
      >
        {children}
      </div>

    </div>
    </>
  );
}
