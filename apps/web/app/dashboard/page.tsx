'use client';

import { useSearchParams } from 'next/navigation';
import { useWishlists } from '@wishhub/api-client';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { Toolbar } from '@/components/dashboard/toolbar/toolbar';
import { ProductGrid } from '@/components/dashboard/product/product-grid';
import { Button } from '@wishhub/ui';
import { Settings2, Star } from 'lucide-react';
import { useState, Suspense } from 'react';
import { WishlistSettingsDialog } from '@/components/dashboard/dialogs/wishlist-settings-dialog';

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');
  const { data: wishlists } = useWishlists();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeWishlist = wishlists?.find(w => w.id === activeWishlistId);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                  {activeWishlist ? activeWishlist.name : 'All Products'}
              </h1>
              {activeWishlist?.isDefault && (
                  <div className="bg-primary/10 text-primary rounded-full p-1.5" title="Default Wishlist">
                      <Star className="h-4 w-4 fill-primary" />
                  </div>
              )}
           </div>
           <p className="text-muted-foreground font-medium">
              {activeWishlist ? 'Organized collection' : 'Everything you have saved'}
           </p>
        </div>

        <div className="flex items-center gap-3">
            {activeWishlist && (
                <Button
                  variant="outline"
                  className="h-11 rounded-xl gap-2 border-muted-foreground/20 shadow-sm"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Button>
            )}
        </div>
      </header>

      <Toolbar />
      <ProductGrid />

      {activeWishlist && (
          <WishlistSettingsDialog
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              wishlist={activeWishlist}
          />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-10">Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  );
}
