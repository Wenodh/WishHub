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
  Check,
  Calendar,
  Sparkles,
  Tag
} from 'lucide-react';
import { cn } from '@wishhub/utils';
import { useDeleteProduct, useRemoveProductFromWishlist } from '@wishhub/api-client';
import { useSearchParams } from 'next/navigation';
import { MoveProductDialog } from '../dialogs/move-product-dialog';
import { EditProductDialog } from '../dialogs/edit-product-dialog';
import { ProductDetailDrawer } from './product-detail-drawer';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: any;
  view: string;
}

export function ProductCard({ product, view }: ProductCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');

  const deleteProduct = useDeleteProduct();
  const removeProduct = useRemoveProductFromWishlist();

  const title = product.title || product.catalogProduct?.title || product.name || 'Saved Product';
  const store = product.store || product.catalogProduct?.storeName || product.catalogProduct?.store || product.storeName || 'Store';
  const image = product.imageUrl || product.catalogProduct?.images?.[0]?.url || product.images?.[0]?.url;
  const price = product.price || product.catalogProduct?.price;
  const currency = product.currency || product.catalogProduct?.currency || '$';
  const url = product.url || product.catalogProduct?.canonicalUrl;
  const addedAt = product.addedAt || product.createdAt;

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeWishlistId) {
        await removeProduct.mutateAsync({
            wishlistId: activeWishlistId,
            savedProductId: product.savedProductId || product.id
        });
    } else {
        await deleteProduct.mutateAsync(product.id);
    }
    setDetailOpen(false);
  };

  const handleCardClick = () => {
    setDetailOpen(true);
  };

  if (view === 'list') {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          transition={{ duration: 0.2 }}
          onClick={handleCardClick}
          className="group relative flex items-center gap-5 overflow-hidden p-4 transition-all duration-300 hover:shadow-lg rounded-3xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-950 cursor-pointer premium-shadow"
        >
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/10 dark:border-neutral-800/10">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-300">
                <Tag className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">{store}</Badge>
            </div>
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-950 dark:group-hover:text-white transition-colors text-base">{title}</h3>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Saved on {new Date(addedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 pr-2">
              {price && (
                  <div className="text-xl font-black text-neutral-900 dark:text-white">
                      {currency} {price}
                  </div>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-50 dark:bg-neutral-900" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                      </a>
                  </Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                              <MoreVertical className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
                           <DropdownMenuItem onClick={handleCopy} className="rounded-xl cursor-pointer">
                              {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500 animate-pulse" /> : <Copy className="h-4 w-4 mr-2 text-neutral-400" />}
                              Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMoveOpen(true); }} className="rounded-xl cursor-pointer">
                              <MoveHorizontal className="h-4 w-4 mr-2 text-neutral-400" />
                              Move to Wishlist
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-900 my-1" />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleRemove}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {activeWishlistId ? 'Remove from Wishlist' : 'Delete Product'}
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </div>
        </motion.div>

        {/* Moving folder dialog */}
        <MoveProductDialog
            open={moveOpen}
            onOpenChange={setMoveOpen}
            product={product}
        />

        {/* Editing product dialog */}
        <EditProductDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            product={product}
        />

        {/* Visual detailed right side slideover */}
        <ProductDetailDrawer
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          product={product}
          onMove={() => setMoveOpen(true)}
          onDelete={handleRemove}
          onEdit={() => setEditOpen(true)}
          isCopied={isCopied}
          onCopy={handleCopy}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleCardClick}
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl rounded-3xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-950 flex flex-col h-full cursor-pointer premium-shadow"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-neutral-300">
              <Tag className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick float panel overlay on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
              <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                           <Button
                              variant="secondary"
                              size="icon"
                              className="h-9 w-9 rounded-full shadow-lg bg-white/90 dark:bg-neutral-950/90 backdrop-blur border border-neutral-200/10 dark:border-neutral-800/10 hover:scale-110 active:scale-95 transition-transform"
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
                          className="h-9 w-9 rounded-full shadow-lg bg-white/90 dark:bg-neutral-950/90 backdrop-blur border border-neutral-200/10 dark:border-neutral-800/10 hover:scale-110 active:scale-95 transition-transform"
                      >
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
                      <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={(e) => { e.stopPropagation(); setMoveOpen(true); }}>
                          <MoveHorizontal className="h-4 w-4 mr-2 text-neutral-400" />
                          Move to Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-900 my-1" />
                      <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
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
                  <Badge className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black text-xs px-3 py-1.5 shadow-xl rounded-xl border border-white/10 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      {currency} {price}
                  </Badge>
              </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500 block">{store}</span>
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-neutral-950 dark:group-hover:text-white transition-colors text-sm min-h-[2.5rem]">{title}</h3>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(addedAt).toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" asChild className="rounded-xl h-8 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all text-[11px] font-bold px-3">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      Visit
                  </a>
              </Button>
          </div>
        </div>
      </motion.div>

      {/* Moving dialog */}
      <MoveProductDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          product={product}
      />

      {/* Editing product dialog */}
      <EditProductDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          product={product}
      />

      {/* Slide detail visual drawer panel */}
      <ProductDetailDrawer
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        product={product}
        onMove={() => setMoveOpen(true)}
        onDelete={handleRemove}
        onEdit={() => setEditOpen(true)}
        isCopied={isCopied}
        onCopy={handleCopy}
      />
    </>
  );
}
