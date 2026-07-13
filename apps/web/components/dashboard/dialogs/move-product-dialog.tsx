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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Move to Wishlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Destination</Label>
            {otherWishlists.length === 0 ? (
                <p className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-xl border border-dashed">
                    You don't have any other wishlists to move this item to.
                </p>
            ) : (
                <Select
                    value={targetWishlistId}
                    onChange={(e) => setTargetWishlistId(e.target.value)}
                    className="h-12 text-lg rounded-xl"
                >
                    <option value="">Select a wishlist...</option>
                    {otherWishlists.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full h-12 text-lg font-bold shadow-lg"
            disabled={!targetWishlistId || add.isPending || remove.isPending}
            onClick={handleMove}
          >
            {add.isPending || remove.isPending ? 'Moving...' : 'Move Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
