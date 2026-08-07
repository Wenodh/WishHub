'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap, Globe, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';

export default function AboutPage() {
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

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-16">
        {/* Page Title Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center space-y-4"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <Sparkles className="h-3 w-3 text-yellow-500" />
            Our Vision
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight text-neutral-950 dark:text-white">
            Meet <span className="premium-gradient-text">WishHub</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
            We are building the universal workspace to save, track, and organize items from any digital storefront across the globe.
          </motion.p>
        </motion.div>

        {/* Vision details cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-4 premium-shadow">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white">Universal Capture</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
              The modern web is fragmented. Every merchant forces you to use their own proprietary list. WishHub breaks down those walls, offering a unified portal for all your desires.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-4 premium-shadow">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white">Store Agnostic</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
              Whether you are shopping on Amazon, Sephora, Target, Shopify boutiques, or obscure local marketplaces, our scraping pipelines extract data accurately in real-time.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-4 premium-shadow">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white">Privacy First</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
              Your wishlists are personal. We never sell your browsing history, purchase intentions, or shopping trends. You maintain full ownership and control over your collection.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-4 premium-shadow">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white">Design Crafted</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
              We design with intense respect for whitespace, beautiful micro-interactions, dark & light mode harmony, and instant feedback loops, making WishHub a joy to open.
            </p>
          </div>
        </div>

        {/* Detailed text section */}
        <div className="p-8 md:p-12 rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-white/50 dark:bg-neutral-900/10 backdrop-blur-xl space-y-6 leading-relaxed text-sm text-neutral-600 dark:text-neutral-300 font-medium">
          <p>
            WishHub was founded by a team of design and technology enthusiasts who were frustrated with the clunky, ad-ridden, and privacy-invasive wishlist widgets of the past. We wanted a tool that felt as clean and fast as Linear or Notion, but designed specifically for cataloging physical products.
          </p>
          <p>
            By leveraging state-of-the-art web scrapers and smart normalizers, WishHub turns any messy product URL into an immaculate catalog product entry. With Version 1.0, we are fully committed to creating the ultimate workspace for active online consumers.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
