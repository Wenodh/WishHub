'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bookmark, Compass, Heart, ShieldCheck, Moon, RefreshCw, Layers } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';

export default function FeaturesPage() {
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

  const features = [
    {
      icon: Bookmark,
      title: 'Universal Product Saver',
      description: 'Saves product listings from any store. Simply click the extension or drop a link in your dashboard to extract rich product data automatically.'
    },
    {
      icon: Layers,
      title: 'Multi-Wishlist Management',
      description: 'Organize your curated products into infinite custom wishlists, collections, folders, registries, or planning boards.'
    },
    {
      icon: Compass,
      title: 'Catalog Normalization',
      description: 'Under the hood, we clean URL tracking codes, parse canonical metadata, and consolidate same-product lists to ensure a single, clean database model.'
    },
    {
      icon: Sparkles,
      title: 'AI Shopping Insights',
      description: 'Get automated product summaries, key pros and cons lists, and smart purchase suitability scores generated instantly using cutting-edge AI.'
    },
    {
      icon: RefreshCw,
      title: 'Smart Duplicate Detection',
      description: 'The browser extension knows instantly if you already saved a product and lets you quickly assign it to additional lists.'
    },
    {
      icon: Heart,
      title: 'Price Tracking Engine',
      description: 'Tracks historical prices. Watch and verify low-price points in real-time, receiving intelligent notifications when products drop.'
    },
    {
      icon: Moon,
      title: 'First-Class Dark Mode',
      description: 'Every component is built from the ground up to support responsive light and dark backgrounds beautifully.'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description: 'Zero-trust authorization guards every endpoint. We do not sell data or inject trackers into your browsing experience.'
    }
  ];

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 space-y-16">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center space-y-4"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <Sparkles className="h-3 w-3 text-yellow-500" />
            Capabilities
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight text-neutral-950 dark:text-white">
            Designed for <span className="premium-gradient-text">perfection</span>.
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Every feature on WishHub has been meticulously crafted to be highly intuitive, extremely fast, and incredibly beautiful.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={i}
                className="p-8 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 premium-shadow space-y-4 hover:border-neutral-900 dark:hover:border-neutral-50 transition-colors duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed font-semibold">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
