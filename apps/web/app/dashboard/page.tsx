'use client';

import { useState, useMemo } from 'react';
import { useProducts, useDeleteProduct } from '@wishhub/api-client';
import { Button, Spinner, Input, Select } from '@wishhub/ui';
import { Trash2, ExternalLink, Search, Copy, Check } from 'lucide-react';

export default function DashboardPage() {
  const { data: productData, isLoading, error } = useProducts();
  const deleteProduct = useMutationDelete();

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stores = useMemo(() => {
    if (!productData?.products) return [];
    const uniqueStores = new Set(productData.products.map(p => p.storeName).filter(Boolean));
    return Array.from(uniqueStores).sort() as string[];
  }, [productData?.products]);

  const filteredProducts = useMemo(() => {
    if (!productData?.products) return [];

    let filtered = [...productData.products];

    // Search
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.storeName?.toLowerCase().includes(term)
      );
    }

    // Store Filter
    if (storeFilter !== 'all') {
      filtered = filtered.filter(p => p.storeName === storeFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });

    return filtered;
  }, [productData?.products, search, storeFilter, sortBy]);

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Saved Products</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="w-full md:w-40"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-40"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
          {search || storeFilter !== 'all'
            ? "No products match your filters."
            : "No products saved yet. Use the extension to save your first product!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={() => deleteProduct.mutate(product.id)}
              onCopy={() => copyToClipboard(product.id, product.url)}
              isCopied={copiedId === product.id}
              isDeleting={deleteProduct.isPendingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onDelete, onCopy, isCopied, isDeleting }: any) {
  if (isDeleting) return null; // Optimistic delete: hide immediately

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col bg-card hover:shadow-md transition-shadow group">
      <div className="aspect-square relative bg-muted overflow-hidden">
        {product.images?.[0]?.url && (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={onCopy}
           >
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-semibold line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h2>
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-muted-foreground truncate max-w-[120px]">
            {product.storeName || 'Unknown Store'}
          </span>
          {product.price && (
            <span className="font-bold text-foreground">
              {product.currency} {product.price}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={product.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Custom hook for optimistic delete
function useMutationDelete() {
  const { mutate, isPending } = useDeleteProduct();
  const [pendingId, setPendingId] = useState<string | null>(null);

  return {
    mutate: (id: string) => {
      setPendingId(id);
      mutate(id, {
        onSettled: () => setPendingId(null),
      });
    },
    isPending,
    isPendingId: pendingId
  };
}
