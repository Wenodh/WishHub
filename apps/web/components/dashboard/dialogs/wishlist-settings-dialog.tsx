'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label
} from '@wishhub/ui';
import { Trash2, Star } from 'lucide-react';
import { useUpdateWishlist, useDeleteWishlist, useSetDefaultWishlist } from '@wishhub/api-client';
import { useRouter } from 'next/navigation';

interface WishlistSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlist: any;
}

export function WishlistSettingsDialog({ open, onOpenChange, wishlist }: WishlistSettingsDialogProps) {
  const [name, setName] = useState(wishlist.name);
  const update = useUpdateWishlist();
  const del = useDeleteWishlist();
  const setDefault = useSetDefaultWishlist();
  const router = useRouter();

  useEffect(() => {
    setName(wishlist.name);
  }, [wishlist]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === wishlist.name) return;

    try {
      await update.mutateAsync({ id: wishlist.id, name: name.trim() });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await del.mutateAsync(wishlist.id);
      router.push('/dashboard');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefault.mutateAsync(wishlist.id);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Wishlist Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          <form onSubmit={handleUpdate} className="space-y-2">
            <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Rename Wishlist
            </Label>
            <div className="flex gap-2">
                <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-lg focus-visible:ring-primary flex-1"
                />
                <Button type="submit" className="h-12 px-6 font-bold" disabled={!name.trim() || update.isPending || name === wishlist.name}>
                    Save
                </Button>
            </div>
          </form>

          {!wishlist.isDefault && (
              <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preferences</Label>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group"
                    onClick={handleSetDefault}
                    disabled={setDefault.isPending}
                  >
                    <Star className="h-4 w-4 text-primary group-hover:fill-primary" />
                    Set as Default Wishlist
                  </Button>
              </div>
          )}

          <div className="space-y-2 pt-4 border-t border-muted/50">
             <Label className="text-[10px] font-bold uppercase tracking-widest text-destructive/70">Danger Zone</Label>
             <p className="text-xs text-muted-foreground mb-4">
                Deleting a wishlist will not delete the products. They will still be available in "All Products".
             </p>
             <Button
                variant="ghost"
                className="w-full h-12 justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={handleDelete}
                disabled={del.isPending}
            >
                <Trash2 className="h-4 w-4" />
                Delete Wishlist Permanently
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
