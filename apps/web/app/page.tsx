'use client';

import { Button } from "@wishhub/ui";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Tag, Heart, Bookmark, Compass } from "lucide-react";

export default function Page() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-200/40 dark:bg-neutral-900/30 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl text-center space-y-12 relative z-10"
      >
        {/* Animated Brand Emblem */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-neutral-900 dark:bg-white rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative w-20 h-20 bg-neutral-900 dark:bg-neutral-50 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <Sparkles className="text-white dark:text-neutral-950 h-10 w-10" />
            </div>
          </div>
        </motion.div>

        {/* Hero Copy */}
        <motion.div variants={itemVariants} className="space-y-4 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-neutral-950 dark:text-white">
            Curate <span className="premium-gradient-text">everything</span> you love.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            The universal workspace to save, track, and organize products from any store across the web with a single click.
          </p>
        </motion.div>

        {/* Primary Call to Action buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" asChild className="h-14 px-10 rounded-2xl text-base font-bold shadow-xl shadow-black/10 dark:shadow-white/5 hover:scale-[1.02] transition-transform">
            <Link href="/signup" className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-2xl text-base font-bold border-neutral-200 dark:border-neutral-800 hover:scale-[1.02] transition-transform bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>

        {/* Highly premium visual cards features grid */}
        <motion.div
          variants={itemVariants}
          className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {/* Card 1 */}
          <div className="p-8 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 premium-shadow space-y-4 hover:border-neutral-900 dark:hover:border-neutral-50 transition-colors duration-300">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">Save Anywhere</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Collect any product with our minimalist browser extension. We auto-scrape all product info instantly.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 premium-shadow space-y-4 hover:border-neutral-900 dark:hover:border-neutral-50 transition-colors duration-300">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Compass className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">Stay Curated</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Organize items into beautiful custom collections for design projects, gift ideas, or daily shopping folders.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 premium-shadow space-y-4 hover:border-neutral-900 dark:hover:border-neutral-50 transition-colors duration-300">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Heart className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">Price Intelligence</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Track historical prices. Get dynamic drops and verify low-price points in real-time without refreshing.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
