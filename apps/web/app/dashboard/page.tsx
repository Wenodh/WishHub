'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useWishlists } from '@wishhub/api-client';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { Toolbar } from '@/components/dashboard/toolbar/toolbar';
import { ProductGrid } from '@/components/dashboard/product/product-grid';
import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { Button } from '@wishhub/ui';
import { Settings2, Star, Plus } from 'lucide-react';
import { useState, Suspense, useCallback } from 'react';
import { WishlistSettingsDialog } from '@/components/dashboard/dialogs/wishlist-settings-dialog';
import { CreateWishlistDialog } from '@/components/dashboard/dialogs/create-wishlist-dialog';
import { AddProductDialog } from '@/components/dashboard/dialogs/add-product-dialog';

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');
  const search = searchParams.get('search') || '';

  const { data: wishlists } = useWishlists();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const activeWishlist = wishlists?.find(w => w.id === activeWishlistId);

  // Helper to change URL params
  const handleSelectWishlist = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('wishlist', id);
    // Clear search when changing folders
    params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Is the user viewing the command homepage (no folder selected, no active search filters)?
  const showHomepage = !activeWishlistId && !search;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {showHomepage ? (
        <DashboardHome
          onSelectWishlist={handleSelectWishlist}
          onOpenCreateDialog={() => setCreateOpen(true)}
          onOpenAddProductDialog={() => setAddOpen(true)}
        />
      ) : (
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/40 dark:border-neutral-800/40">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 premium-gradient-text">
                      {activeWishlist ? activeWishlist.name : 'All Curated Products'}
                  </h1>
                  {activeWishlist?.isDefault && (
                      <div className="bg-neutral-900/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 rounded-full p-2 border border-neutral-200/10" title="Default Wishlist">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                  )}
               </div>
               <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                  {activeWishlist ? 'A beautifully curated custom collection.' : `Everything you've saved from across the web.`}
               </p>
            </div>

            <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="rounded-2xl gap-2 shadow-sm px-4 h-11 hover:scale-[1.02] active:scale-[0.98] transition-all bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
                {activeWishlist && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl gap-2 border-neutral-200 dark:border-neutral-800 shadow-sm px-4 h-11 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings2 className="h-4 w-4 text-neutral-500" />
                      Collection Settings
                    </Button>
                )}
            </div>
          </header>

          <Toolbar />
          <ProductGrid />
        </div>
      )}

      {/* Controlled Dialog components */}
      {activeWishlist && (
          <WishlistSettingsDialog
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              wishlist={activeWishlist}
          />
      )}

      <CreateWishlistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <AddProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultWishlistId={activeWishlistId}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          </div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  );
}
