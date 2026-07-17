'use client';

import { useWishlists, useAddProductToWishlist, useRemoveProductFromWishlist } from '@wishhub/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Select
} from '@wishhub/ui';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Move, FolderPlus } from 'lucide-react';

interface MoveProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export function MoveProductDialog({ open, onOpenChange, product }: MoveProductDialogProps) {
  const { data: wishlists } = useWishlists();
  const searchParams = useSearchParams();
  const currentWishlistId = searchParams.get('wishlist');
  const [targetWishlistId, setTargetWishlistId] = useState('');

  const add = useAddProductToWishlist();
  const remove = useRemoveProductFromWishlist();

  const otherWishlists = wishlists?.filter(w => w.id !== currentWishlistId) || [];

  const handleMove = async () => {
    if (!targetWishlistId) return;

    try {
        const savedProductId = product.savedProductId || product.id;

        // 1. Add to new wishlist
        await add.mutateAsync({
            wishlistId: targetWishlistId,
            savedProductId
        });

        // 2. If we are currently in a wishlist view, remove it from the old one
        if (currentWishlistId) {
            await remove.mutateAsync({
                wishlistId: currentWishlistId,
                savedProductId
            });
        }

        onOpenChange(false);
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Move className="h-5 w-5 text-neutral-500" />
            Move to Wishlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <FolderPlus className="h-3 w-3" /> Select Destination
            </Label>
            {otherWishlists.length === 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold bg-neutral-100/50 dark:bg-neutral-900/50 p-5 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    You don't have any other collections created to move this curated item to.
                </p>
            ) : (
                <Select
                    value={targetWishlistId}
                    onChange={(e) => setTargetWishlistId(e.target.value)}
                    className="h-12 text-sm rounded-2xl"
                >
                    <option value="" className="font-semibold text-neutral-400">Select a wishlist...</option>
                    {otherWishlists.map((w) => (
                        <option key={w.id} value={w.id} className="font-semibold">{w.name}</option>
                    ))}
                </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full h-12 text-sm font-extrabold shadow-lg shadow-black/5 rounded-2xl transition-all hover:scale-[1.01]"
            disabled={!targetWishlistId || add.isPending || remove.isPending}
            onClick={handleMove}
          >
            {add.isPending || remove.isPending ? 'Moving item...' : 'Move Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
