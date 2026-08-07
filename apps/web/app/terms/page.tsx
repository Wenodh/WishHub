'use client';

import React from 'react';
import { ShieldCheck, Calendar } from 'lucide-react';
import { PublicLayout } from '@/components/public-layout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
            Terms & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-950 dark:text-white">
            Terms of <span className="premium-gradient-text">Service</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: August 2026
          </div>
        </div>

        {/* Content Document */}
        <div className="p-8 md:p-12 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/30 backdrop-blur-md space-y-8 text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm font-semibold premium-shadow">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using WishHub (including our website, browser extension, and dashboard APIs), you agree to be bound by these Terms of Service and all applicable guidelines. If you do not agree to all of these terms, you are prohibited from utilizing our tools.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">2. Beta Usage & Registration</h2>
            <p>
              WishHub is currently in a public beta stage. We offer our curation services free during this launch period. To access certain dashboard and collection features, you must complete account registration. You agree to safeguard your Better Auth sessions and credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">3. Content & Scraper Code</h2>
            <p>
              WishHub allows you to extract publicly available merchant URLs to build collections. You represent that you have the right to curate and compile these catalog items. You agree not to abuse our scraper APIs or deploy high-volume script queries that could trigger rate limiting or elevate server stress.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">4. Intellectual Property</h2>
            <p>
              The WishHub software framework, custom design tokens, layout styles, and browser extension codebases are the exclusive intellectual property of WishHub Inc. and our contributors. You may not reverse-engineer, clone, or redistribute our workspace structures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">5. Limitation of Liability</h2>
            <p>
              WishHub is provided "as is" without warranty of any kind. We do not guarantee continuous, uninterrupted scraping results, merchant site compatibility, or price tracker updates. We are not liable for changes in merchant stock, price updates, or purchasing decisions.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
