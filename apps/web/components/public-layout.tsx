'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, Github, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@wishhub/ui';
import { ThemeToggle } from './dashboard/layout/theme-toggle';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300 relative">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-neutral-200/30 dark:bg-neutral-900/10 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/40 dark:border-neutral-800/40 bg-white/75 dark:bg-neutral-950/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-50 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="text-white dark:text-neutral-950 h-5 w-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-neutral-950 dark:text-white">
              Wish<span className="premium-gradient-text">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl font-bold text-sm h-10 px-4">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-xl font-bold text-sm h-10 px-5 shadow-md">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-neutral-200/40 dark:border-neutral-800/40 bg-white dark:bg-neutral-950 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-bold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-neutral-100 dark:border-neutral-900 my-4 pt-4 flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl font-bold h-11">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl font-bold h-11">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-neutral-200/40 dark:border-neutral-800/40 bg-white dark:bg-neutral-950 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Slogan Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-50 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white dark:text-neutral-950 h-4.5 w-4.5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-neutral-950 dark:text-white">
                WishHub
              </span>
            </Link>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-semibold">
              The universal multi-platform product curation engine. Free during Beta.
            </p>
          </div>

          {/* Links Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Product
            </h4>
            <ul className="space-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
              <li>
                <Link href="/features" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Features List
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  About Curation
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Resources & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Resources
            </h4>
            <ul className="space-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
              <li>
                <Link href="/faq" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  FAQ & Help
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Support Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Legal
            </h4>
            <ul className="space-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
              <li>
                <Link href="/privacy" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower copyright bar */}
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            © {new Date().getFullYear()} WishHub Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" />
            <span>for modern shoppers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
