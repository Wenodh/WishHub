'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label
} from '@wishhub/ui';
import { Trash2, Star, Edit3, Settings, ShieldAlert } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[450px] p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-neutral-500" />
            Wishlist Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Rename Section */}
          <form onSubmit={handleUpdate} className="space-y-2">
            <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Edit3 className="h-3 w-3" /> Rename Wishlist
            </Label>
            <div className="flex gap-2">
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-2xl flex-1 text-sm font-semibold"
              />
              <Button
                type="submit"
                className="h-12 px-6 font-extrabold rounded-2xl shadow-md active:scale-95 transition-all text-xs"
                disabled={!name.trim() || update.isPending || name === wishlist.name}
              >
                Save
              </Button>
            </div>
          </form>

          {/* Preferences Section */}
          {!wishlist.isDefault && (
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
                Preferences
              </Label>
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3 rounded-2xl border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all font-bold text-xs"
                onClick={handleSetDefault}
                disabled={setDefault.isPending}
              >
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                Set as Default Wishlist
              </Button>
            </div>
          )}

          {/* Danger Zone Section */}
          <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-900">
             <Label className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-1.5">
               <ShieldAlert className="h-4 w-4" /> Danger Zone
             </Label>
             <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                Deleting a wishlist will not delete the products. They will still be available in your core workspace feed.
             </p>
             <Button
                variant="destructive"
                className="w-full h-12 justify-start gap-3 rounded-2xl text-xs font-bold shadow-md hover:scale-[1.01] transition-transform"
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
