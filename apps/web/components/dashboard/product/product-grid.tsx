'use client';

import { useSearchParams } from 'next/navigation';
import { useProducts, useWishlistProducts } from '@wishhub/api-client';
import { ProductCard } from './product-card';
import { cn } from '@wishhub/utils';
import { useMemo } from 'react';
import { Skeleton } from '@wishhub/ui';
import { EmptyState } from '../empty-states/empty-state';
import { LayoutGrid, Search, PackageOpen } from 'lucide-react';

export function ProductGrid() {
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const view = searchParams.get('view') || 'grid';

  const { data: allProductsData, isLoading: isLoadingAll } = useProducts();
  const { data: wishlistData, isLoading: isLoadingWishlist } = useWishlistProducts(activeWishlistId);

  const isLoading = activeWishlistId ? isLoadingWishlist : isLoadingAll;

  const products = useMemo(() => {
    let list = activeWishlistId
        ? (wishlistData?.products || [])
        : (allProductsData?.products || []);

    // Filter by search
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((p: any) =>
        (p.title || p.name || '').toLowerCase().includes(term) ||
        (p.store || p.storeName || '').toLowerCase().includes(term)
      );
    }

    // Sort
    list = [...list].sort((a: any, b: any) => {
      if (sort === 'newest') return new Date(b.addedAt || b.createdAt).getTime() - new Date(a.addedAt || a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.addedAt || a.createdAt).getTime() - new Date(b.addedAt || b.createdAt).getTime();
      if (sort === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sort === 'store') return (a.store || a.storeName || '').localeCompare(b.store || b.storeName || '');
      return 0;
    });

    return list;
  }, [activeWishlistId, allProductsData, wishlistData, search, sort]);

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6",
        view === 'grid'
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={cn(
            "rounded-2xl border bg-card p-4",
            view === 'list' && "flex gap-4"
          )}>
            <Skeleton className={cn(
              "rounded-xl",
              view === 'grid' ? "aspect-square w-full" : "h-24 w-24"
            )} />
            <div className="flex-1 space-y-2 py-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
      if (search) {
          return (
              <EmptyState
                icon={Search}
                title="No matches found"
                description={`We couldn't find anything matching "${search}". Try different keywords or clear the search.`}
              />
          );
      }

      return (
          <EmptyState
            icon={PackageOpen}
            title={activeWishlistId ? "Empty wishlist" : "No products yet"}
            description={activeWishlistId
                ? "This wishlist is empty. Move products here to stay organized."
                : "Start adding products using the WishHub browser extension."}
          />
      );
  }

  return (
    <div className={cn(
      "grid gap-6",
      view === 'grid'
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1"
    )}>
      {products.map((product: any) => (
        <ProductCard
            key={product.id || product.savedProductId}
            product={product}
            view={view}
        />
      ))}
    </div>
  );
}
