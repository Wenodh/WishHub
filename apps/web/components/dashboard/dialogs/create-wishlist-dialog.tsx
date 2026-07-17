'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Button,
  Input,
  Label
} from '@wishhub/ui';
import { Plus } from 'lucide-react';
import { useCreateWishlist } from '@wishhub/api-client';

interface CreateWishlistDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWishlistDialog({ open: controlledOpen, onOpenChange }: CreateWishlistDialogProps) {
  const [name, setName] = useState('');
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const createWishlist = useCreateWishlist();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWishlist.mutateAsync({ name: name.trim() });
      setName('');
      setOpen?.(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="w-full justify-start gap-3 rounded-2xl px-4 py-6 shadow-sm border border-neutral-200 dark:border-neutral-800 bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-all duration-300 active:scale-[0.98]" variant="outline">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-bold">New Wishlist</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Create Wishlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Wishlist Name
            </Label>
            <Input
              id="name"
              placeholder="Summer Outfits, Dream Home Tech..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-2xl"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-neutral-950/10 rounded-2xl"
              disabled={!name.trim() || createWishlist.isPending}
            >
              {createWishlist.isPending ? 'Creating...' : 'Create Wishlist'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
