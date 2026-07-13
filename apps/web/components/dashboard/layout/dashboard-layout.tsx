'use client';

import { ReactNode, useState } from 'react';
import { WishlistSidebar } from '../sidebar/wishlist-sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@wishhub/ui';
import { cn } from '@wishhub/utils';
import { TopNav } from './top-nav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card transition-transform duration-300 ease-in-out md:sticky md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <WishlistSidebar onClose={() => setIsSidebarOpen(false)} />

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 md:hidden text-muted-foreground"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Shared Top Navigation */}
        <TopNav />

        {/* Mobile Side-trigger (Alternative if TopNav is too full) */}
        {!isSidebarOpen && (
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 left-6 z-40 md:hidden h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 transition-transform"
             >
                <Menu className="h-6 w-6" />
             </Button>
        )}

        <main className="flex-1 overflow-auto bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
