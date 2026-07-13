'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@wishhub/ui';
import {
  ExternalLink,
  MoreVertical,
  MoveHorizontal,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@wishhub/utils';
import { useDeleteProduct, useRemoveProductFromWishlist } from '@wishhub/api-client';
import { useSearchParams } from 'next/navigation';
import { MoveProductDialog } from '../dialogs/move-product-dialog';

interface ProductCardProps {
  product: any;
  view: string;
}

export function ProductCard({ product, view }: ProductCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');

  const deleteProduct = useDeleteProduct();
  const removeProduct = useRemoveProductFromWishlist();

  const title = product.title || product.catalogProduct?.title || product.name;
  const store = product.store || product.catalogProduct?.storeName || product.storeName || 'Unknown Store';
  const image = product.imageUrl || product.catalogProduct?.images?.[0]?.url || product.images?.[0]?.url;
  const price = product.price || product.catalogProduct?.price;
  const currency = product.currency || product.catalogProduct?.currency;
  const url = product.url || product.catalogProduct?.canonicalUrl;
  const addedAt = product.addedAt || product.createdAt;

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRemove = async () => {
    if (activeWishlistId) {
        await removeProduct.mutateAsync({
            wishlistId: activeWishlistId,
            savedProductId: product.savedProductId || product.id
        });
    } else {
        await deleteProduct.mutateAsync(product.id);
    }
  };

  if (view === 'list') {
    return (
      <Card className="group relative flex items-center gap-4 overflow-hidden p-3 transition-all hover:shadow-md rounded-2xl border-muted-foreground/10">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50">
          {image && (
            <img src={image} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold uppercase tracking-widest">{store}</Badge>
          </div>
          <h3 className="font-bold truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Added on {new Date(addedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pr-2">
            {price && (
                <div className="text-lg font-black text-foreground">
                    {currency} {price}
                </div>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={handleCopy}>
                            {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMoveOpen(true)}>
                            <MoveHorizontal className="h-4 w-4 mr-2" />
                            Move to Wishlist
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleRemove}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {activeWishlistId ? 'Remove from Wishlist' : 'Delete Product'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <MoveProductDialog
            open={moveOpen}
            onOpenChange={setMoveOpen}
            product={product}
        />
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl rounded-2xl border-muted-foreground/10 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {image && (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 rounded-full shadow-lg bg-background/90 backdrop-blur"
                            onClick={handleCopy}
                        >
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Copy URL</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 rounded-full shadow-lg bg-background/90 backdrop-blur"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuItem className="rounded-lg" onClick={() => setMoveOpen(true)}>
                        <MoveHorizontal className="h-4 w-4 mr-2" />
                        Move to Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive rounded-lg"
                        onClick={handleRemove}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {activeWishlistId ? 'Remove from Wishlist' : 'Delete Product'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {price && (
            <div className="absolute bottom-3 left-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <Badge className="bg-primary text-primary-foreground font-black text-sm px-3 py-1.5 shadow-xl">
                    {currency} {price}
                </Badge>
            </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{store}</span>
        </div>
        <h3 className="font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5rem]">{title}</h3>

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-muted/50">
            <span className="text-[10px] font-medium text-muted-foreground">
                {new Date(addedAt).toLocaleDateString()}
            </span>
            <Button variant="outline" size="sm" asChild className="rounded-full h-8 border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Visit Site
                </a>
            </Button>
        </div>
      </div>
      <MoveProductDialog
            open={moveOpen}
            onOpenChange={setMoveOpen}
            product={product}
        />
    </Card>
  );
}
