'use client';

import { useEffect } from 'react';
import { Button } from '@wishhub/ui';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error Boundary Captured:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-xl">
              <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-neutral-950 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto">
              We encountered an unexpected error. Don't worry, your wishlists and curation data are safe.
            </p>
          </div>
        </div>

        {error.message && (
          <div className="p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm text-xs font-mono text-left overflow-auto max-h-40 shadow-inner text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-neutral-400 block mb-1">ERROR DIGEST:</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="w-full sm:w-auto rounded-2xl h-12 px-6 gap-2 font-bold shadow-lg shadow-neutral-950/5 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Try Re-fetching
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto rounded-2xl h-12 px-6 gap-2 font-bold border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-all active:scale-[0.99]"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
