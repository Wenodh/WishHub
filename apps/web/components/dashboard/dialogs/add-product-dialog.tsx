'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Loader2, Link2, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useSaveProduct, useAddProductToWishlist, useWishlists } from '@wishhub/api-client';

interface AddProductDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultWishlistId?: string | null;
}

export function AddProductDialog({ open: controlledOpen, onOpenChange, defaultWishlistId }: AddProductDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  const { data: wishlists } = useWishlists();
  const saveProduct = useSaveProduct();
  const addProductToWishlist = useAddProductToWishlist();

  // Dialog Steps: 'url' | 'loading' | 'preview'
  const [step, setStep] = useState<'url' | 'loading' | 'preview'>('url');
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields for Preview/Manual
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [imageUrl, setImageUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('');
  const [extractionFailed, setExtractionFailed] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('url');
      setUrl('');
      setErrorMsg(null);
      setTitle('');
      setPrice('');
      setCurrency('USD');
      setImageUrl('');
      setStoreName('');
      setDescription('');
      setNotes('');
      setExtractionFailed(false);
    } else {
      // Set default selected wishlist if provided
      if (defaultWishlistId) {
        setSelectedWishlistId(defaultWishlistId);
      } else if (wishlists && wishlists.length > 0) {
        // Select the default folder if available, else the first folder
        const defaultList = wishlists.find((w: any) => w.isDefault);
        setSelectedWishlistId(defaultList ? defaultList.id : (wishlists[0]?.id || ''));
      }
    }
  }, [open, defaultWishlistId, wishlists]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Fast local URL validation
    try {
      new URL(url.trim());
    } catch {
      setErrorMsg('Please enter a valid URL including http:// or https://');
      return;
    }

    setStep('loading');
    setErrorMsg(null);
    setExtractionFailed(false);

    try {
      const res = await fetch('/api/products/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const payload = data.data;
        const prod = payload.product;

        setTitle(prod.title || '');
        setPrice(prod.price !== undefined ? prod.price.toString() : '');
        setCurrency(prod.currency || 'USD');
        setStoreName(prod.store || prod.storeName || '');
        setDescription(prod.description || '');

        if (prod.images && prod.images.length > 0) {
          setImageUrl(prod.images[0] || '');
        } else if (prod.imageUrl) {
          setImageUrl(prod.imageUrl);
        } else {
          setImageUrl('');
        }

        if (!payload.extracted) {
          setExtractionFailed(true);
        }
      } else {
        // Graceful extraction failure fallback
        setExtractionFailed(true);
        setTitle('');
        setPrice('');
        setCurrency('USD');
        setImageUrl('');
        setStoreName('');
        setDescription('');
      }
      setStep('preview');
    } catch (err: any) {
      // Gracefully fall back to manual form
      setExtractionFailed(true);
      setStep('preview');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const saveResult = await saveProduct.mutateAsync({
        name: title.trim(),
        url: url.trim() || `https://wishhub-manual-entry.com/${Date.now()}`,
        imageUrl: imageUrl.trim() || undefined,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        price: price.trim() ? parseFloat(price) : undefined,
        currency,
        storeName: storeName.trim() || undefined,
        description: description.trim() || undefined,
        metadataVersion: 1,
      });

      const savedProductId = saveResult?.product?.id;

      if (savedProductId && selectedWishlistId) {
        await addProductToWishlist.mutateAsync({
          wishlistId: selectedWishlistId,
          savedProductId,
        });
      }

      setOpen?.(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="rounded-2xl gap-2 shadow-lg shadow-neutral-950/10 dark:shadow-neutral-500/5 hover:scale-[1.02] active:scale-[0.98] transition-all bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-5 h-11 text-sm font-bold">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
            Add to Wishlist
          </DialogTitle>
        </DialogHeader>

        {step === 'url' && (
          <form onSubmit={handleExtract} className="space-y-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Product URL
              </Label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="url"
                  placeholder="https://amazon.com/dp/B08N5WRWNW..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 pl-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-2xl"
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-lg shadow-neutral-950/10 rounded-2xl"
                disabled={!url.trim()}
              >
                Extract details
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-neutral-900 dark:text-neutral-50" />
            <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
              Curating details from the web...
            </p>
          </div>
        )}

        {step === 'preview' && (
          <form onSubmit={handleSave} className="space-y-5 py-2 max-h-[75vh] overflow-y-auto pr-1">
            {extractionFailed && (
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-400 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-bold">We couldn't automatically find product details.</p>
                  <p className="opacity-90 font-medium">Please enter them manually to save normally.</p>
                </div>
              </div>
            )}

            {imageUrl && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Product Title
                </Label>
                <Input
                  id="title"
                  placeholder="MacBook Air M1, Nike Sneakers..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    Price (Optional)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="299.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    placeholder="USD"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Store / Merchant (Optional)
                </Label>
                <Input
                  id="store"
                  placeholder="Amazon, Sephora, Target..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-11 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imageUrlInput" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Image URL (Optional)
                </Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="imageUrlInput"
                    placeholder="https://example.com/image.jpg..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-11 pl-10 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wishlistSelect" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Select Wishlist
                </Label>
                <select
                  id="wishlistSelect"
                  value={selectedWishlistId}
                  onChange={(e) => setSelectedWishlistId(e.target.value)}
                  className="w-full h-11 px-3 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300"
                  required
                >
                  <option value="" disabled>Select a folder</option>
                  {wishlists?.map((w: any) => (
                    <option key={w.id} value={w.id}>
                      {w.name} {w.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  My Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Why do you want this item? Sizing details, color preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                onClick={() => setStep('url')}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 text-xs font-bold shadow-lg shadow-neutral-950/10 rounded-xl"
                disabled={!title.trim() || saveProduct.isPending}
              >
                {saveProduct.isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
