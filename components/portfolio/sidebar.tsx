'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Work', href: '#work' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', ariaLabel: 'GitHub' },
  { name: 'LinkedIn', href: 'https://linkedin.com', ariaLabel: 'LinkedIn' },
  { name: 'Twitter', href: 'https://twitter.com', ariaLabel: 'Twitter' },
];

interface SidebarProps {
  activeSection?: string;
}

export function Sidebar({ activeSection }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Skip to main link */}
      <a href="#main" className="skip-to-main">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:fixed lg:flex lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:justify-between lg:bg-background lg:p-8 lg:border-r lg:border-border"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo/Initials */}
        <div className="flex flex-col gap-12">
          <Link
            href="#hero"
            className="text-3xl font-bold text-primary hover:text-accent transition-colors"
          >
            BC
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.name.toLowerCase()
                    ? 'text-primary'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                <span className="text-primary mr-2">{'0' + (navItems.indexOf(item) + 1)}.</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Social Links & CTA */}
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className="text-secondary hover:text-primary transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="px-4 py-3 border border-primary text-primary rounded text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 text-center"
          >
            Resume
          </a>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-6">
        <Link
          href="#hero"
          className="text-2xl font-bold text-primary hover:text-accent transition-colors"
        >
          BC
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden fixed top-16 left-0 right-0 bg-background border-b border-border z-40 p-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors duration-200 ${
                activeSection === item.name.toLowerCase()
                  ? 'text-primary'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              <span className="text-primary mr-2">{'0' + (navItems.indexOf(item) + 1)}.</span>
              {item.name}
            </Link>
          ))}

          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className="text-secondary hover:text-primary transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="mt-4 px-4 py-3 border border-primary text-primary rounded text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 text-center"
          >
            Resume
          </a>
        </nav>
      )}

      {/* Mobile Content Offset */}
      <div className="lg:hidden h-16" />
    </>
  );
}
