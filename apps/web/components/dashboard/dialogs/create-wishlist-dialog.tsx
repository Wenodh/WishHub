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

export function CreateWishlistDialog() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const createWishlist = useCreateWishlist();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWishlist.mutateAsync({ name: name.trim() });
      setName('');
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start gap-3 rounded-xl px-4 py-6 shadow-sm" variant="outline">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus className="h-4 w-4" />
          </div>
          <span className="font-bold">New Wishlist</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Create Wishlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Wishlist Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Summer Outfits, Home Tech..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg focus-visible:ring-primary"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-lg"
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
