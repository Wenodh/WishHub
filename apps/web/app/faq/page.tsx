'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, HelpCircle } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';
import { cn } from '@wishhub/utils';

export default function FAQPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
  };

  const faqs = [
    {
      question: 'Is WishHub really universal?',
      answer: 'Yes! WishHub uses a highly sophisticated parsing core. It analyzes OpenGraph tags, JSON-LD schemas, and generic page heuristics. This allows it to understand and extract products from virtually any website or storefront across the web.'
    },
    {
      question: 'How do I save products from my browser?',
      answer: 'The absolute best way is to install our premium Browser Extension! It integrates seamlessly with Chrome, Edge, and other Chromium browsers. It lets you extract, normalize, and save products to any wishlist with a single click without ever leaving the page.'
    },
    {
      question: 'What is "Catalog Normalization"?',
      answer: 'When different users save the exact same product from different URLs or search links (e.g. including various tracking tags or referrals), our normalizers resolve them to a single canonical CatalogProduct. This ensures clean database models and prevents duplicate records.'
    },
    {
      question: 'Is WishHub free?',
      answer: 'Yes! WishHub is completely free to use during our public beta. All multi-wishlist, universal product saving, and AI summary features are fully enabled.'
    },
    {
      question: 'How does the AI Shopping Insights feature work?',
      answer: 'When a catalog product is first saved, our AI provider parses its title, brand, description, and pricing parameters. It generates a concise summary, outlines factual lists of pros & cons, and provides a suitability score to help you make informed purchase decisions.'
    },
    {
      question: 'Can I import my wishlists from other websites?',
      answer: 'Universal CSV and platform-specific imports are scheduled for our upcoming v1.1 releases. Currently, you can easily save any product directly using our extension.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-16">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center space-y-4"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <HelpCircle className="h-3 w-3 text-neutral-500" />
            Support Center
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight text-neutral-950 dark:text-white">
            Frequently Asked <span className="premium-gradient-text">Questions</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about setting up, saving, and curating your dream wishlists on WishHub.
          </motion.p>
        </motion.div>

        {/* Accordions */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-extrabold text-neutral-900 dark:text-white hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown className={cn("h-5 w-5 text-neutral-400 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed border-t border-neutral-100 dark:border-neutral-900/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
