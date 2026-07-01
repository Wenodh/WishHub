'use client';

import { useProducts, useDeleteProduct } from '@wishhub/api-client';
import { Button, Spinner } from '@wishhub/ui';
import { Trash2, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { data: products, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();

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

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No products saved yet. Use the extension to save your first product!
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Saved Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden flex flex-col bg-card">
            <div className="aspect-square relative bg-muted">
              {product.images?.[0]?.url && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold line-clamp-2 mb-2">{product.name}</h2>
              <div className="text-sm text-muted-foreground mb-4">
                {product.storeName && <span>{product.storeName}</span>}
                {product.price && (
                  <span className="ml-2 font-medium text-foreground">
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
                  onClick={() => deleteProduct.mutate(product.id)}
                  disabled={deleteProduct.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
