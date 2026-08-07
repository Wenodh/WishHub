'use client';

import { useEffect } from 'react';
import { Button } from '@wishhub/ui';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary Captured:', error);
  }, [error]);

  return (
    <html>
      <body className="antialiased font-sans">
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
                  System Crash
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto">
                  A critical error interrupted the system. We're actively resolving the issue.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={reset}
                className="w-full sm:w-auto rounded-2xl h-12 px-6 gap-2 font-bold shadow-lg shadow-neutral-950/5 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Recover System
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
