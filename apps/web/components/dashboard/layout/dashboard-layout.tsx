'use client';

import { ReactNode, useState } from 'react';
import { WishlistSidebar } from '../sidebar/wishlist-sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@wishhub/ui';
import { cn } from '@wishhub/utils';
import { TopNav } from './top-nav';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans antialiased text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-md md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:sticky md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <WishlistSidebar onClose={() => setIsSidebarOpen(false)} />

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 md:hidden text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Shared Top Navigation */}
        <TopNav />

        {/* Mobile Side-trigger */}
        {!isSidebarOpen && (
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-40 md:hidden h-14 w-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}

        <main className="flex-1 overflow-auto bg-neutral-50/50 dark:bg-neutral-950/30">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
