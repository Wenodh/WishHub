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
import { Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useUpdateProduct } from '@wishhub/api-client';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const updateProduct = useUpdateProduct();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [imageUrl, setImageUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setTitle(product.title || product.catalogProduct?.title || product.name || '');
      setPrice(product.price || product.catalogProduct?.price ? (product.price || product.catalogProduct?.price).toString() : '');
      setCurrency(product.currency || product.catalogProduct?.currency || 'USD');
      setImageUrl(product.imageUrl || product.catalogProduct?.images?.[0]?.url || product.images?.[0]?.url || '');
      setStoreName(product.store || product.catalogProduct?.storeName || product.catalogProduct?.store || product.storeName || '');
      setDescription(product.description || product.catalogProduct?.description || '');
      setErrorMsg(null);
    }
  }, [open, product]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !product) return;

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        title: title.trim(),
        price: price.trim() ? parseFloat(price) : undefined,
        currency: currency.trim() || undefined,
        store: storeName.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update product. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
            Edit Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 py-2 max-h-[75vh] overflow-y-auto pr-1">
          {imageUrl && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Product Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Product Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-currency" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Currency
                </Label>
                <Input
                  id="edit-currency"
                  placeholder="USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-store" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Store / Merchant
              </Label>
              <Input
                id="edit-store"
                placeholder="Amazon, Sephora, Target..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-imageUrlInput" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Image URL
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="edit-imageUrlInput"
                  placeholder="https://example.com/image.jpg..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 pl-10 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Description (Optional)
              </Label>
              <textarea
                id="edit-description"
                rows={2}
                placeholder="Description of the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-11 text-xs font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 text-xs font-bold shadow-lg shadow-neutral-950/10 rounded-xl"
              disabled={!title.trim() || updateProduct.isPending}
            >
              {updateProduct.isPending ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
