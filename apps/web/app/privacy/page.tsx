'use client';

import React from 'react';
import { ShieldCheck, Calendar } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
            Security & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
            Privacy <span className="premium-gradient-text">Policy</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: August 2026
          </div>
        </div>

        {/* Content Document */}
        <div className="p-8 md:p-12 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-8 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm font-semibold premium-shadow">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">1. Introduction</h2>
            <p>
              Welcome to WishHub. We respect your privacy and are deeply committed to protecting your personal data. This privacy policy describes how we collect, store, share, and process your information when you visit our website, use our software endpoints, or install our browser extension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">2. Data We Collect</h2>
            <p>
              We collect minimal, necessary details to support product curation and account synchronization:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Credentials:</strong> Name, Email, and avatar images provided during Better Auth registration.</li>
              <li><strong>Curation Content:</strong> Target product URLs, titles, store names, prices, and merchant descriptions extracted via our scraper tool.</li>
              <li><strong>Extension Cache:</strong> Local preferences and wishlist ID references stored securely in Chrome storage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">3. How We Use Your Data</h2>
            <p>
              We utilize your data to deliver and refine our services:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>To synchronize your personal wishlists across browser platforms and web portals.</li>
              <li>To run AI analysis, summary, and match suitability scoring pipelines.</li>
              <li>To provide historical price updates and notify you of catalog drops.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">4. Data Sharing and Protection</h2>
            <p>
              We stand firmly behind a <strong>no-sale policy</strong>. We never trade, rent, or lease your private wishlists or personal demographics with advertising networks or third-party data aggregators. All databases are securely hosted in Supabase with SSL/HTTPS encryption standards enforced.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">5. Your Rights and Controls</h2>
            <p>
              You maintain absolute control over your catalog items. You can edit lists, rename folders, or permanently delete products from your workspace. Deleting your account will trigger immediate, cascading deletion of all associated wishlists, catalog links, and personal parameters.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
