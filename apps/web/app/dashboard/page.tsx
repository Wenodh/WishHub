'use client';

import { useState, useMemo } from 'react';
import {
    useProducts,
    useDeleteProduct,
    useWishlists,
    useCreateWishlist,
    useUpdateWishlist,
    useDeleteWishlist
} from '@wishhub/api-client';
import {
    Button,
    Spinner,
    Input,
    Select,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    Label,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@wishhub/ui';
import {
    Trash2,
    ExternalLink,
    Search,
    Copy,
    Check,
    Plus,
    MoreVertical,
    Settings,
    Star,
    List,
    Layers,
    MoveHorizontal
} from 'lucide-react';
import { cn } from '@wishhub/ui';

export default function DashboardPage() {
  const { data: productData, isLoading: productsLoading } = useProducts();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

  const [search, setSearch] = useState('');
  const [activeWishlistId, setActiveWishlistId] = useState<string | null>(null); // null = All Products
  const [sortBy, setSortBy] = useState('newest');

  const deleteProduct = useMutationDelete();
  const createWishlist = useCreateWishlist();

  // Computed data
  const activeWishlist = useMemo(() =>
    activeWishlistId ? wishlists?.find((w: any) => w.id === activeWishlistId) : null
  , [activeWishlistId, wishlists]);

  const filteredProducts = useMemo(() => {
    if (!productData?.products) return [];

    let filtered = [...productData.products];

    // Filter by wishlist
    if (activeWishlistId) {
        filtered = filtered.filter((p: any) =>
            p.wishlistItems?.some((item: any) => item.wishlistId === activeWishlistId)
        );
    }

    // Search
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const name = p.catalogProduct?.name || p.name || '';
        const store = p.catalogProduct?.storeName || p.storeName || '';
        return name.toLowerCase().includes(term) || store.toLowerCase().includes(term);
      });
    }

    // Sorting
    filtered.sort((a: any, b: any) => {
      const nameA = a.catalogProduct?.name || a.name || '';
      const nameB = b.catalogProduct?.name || b.name || '';
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'name') return nameA.localeCompare(nameB);
      return 0;
    });

    return filtered;
  }, [productData?.products, search, activeWishlistId, sortBy]);

  if (productsLoading || wishlistsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
            <h2 className="font-bold text-xl flex items-center gap-2 text-primary">
                <Star className="h-6 w-6 fill-primary" />
                WishHub
            </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1">
            <button
                onClick={() => setActiveWishlistId(null)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    !activeWishlistId ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
            >
                <Layers className="h-4 w-4" />
                All Products
            </button>

            <div className="pt-6 pb-2 px-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">My Wishlists</p>
            </div>

            {wishlists?.map((wishlist: any) => (
                <button
                    key={wishlist.id}
                    onClick={() => setActiveWishlistId(wishlist.id)}
                    className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                        activeWishlistId === wishlist.id ? "bg-primary/10 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                >
                    <div className="flex items-center gap-3 truncate">
                        <List className="h-4 w-4" />
                        <span className="truncate">{wishlist.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {wishlist.isDefault && <Star className="h-3 w-3 fill-primary text-primary flex-shrink-0" />}
                        <span className="text-xs opacity-60 group-hover:opacity-100">{wishlist._count?.items || 0}</span>
                    </div>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t">
            <CreateWishlistDialog />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{activeWishlist?.name || 'All Products'}</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search your collection..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-72 h-11"
                        />
                    </div>

                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-44 h-11">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                    </Select>

                    {activeWishlist && (
                        <WishlistSettingsDialog wishlist={activeWishlist} />
                    )}
                </div>
            </header>

            {filteredProducts.length === 0 ? (
                <div className="p-32 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                    <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">Your collection is empty</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        {search ? "No matches for your search. Try different keywords!" : "Start adding products using the browser extension."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product: any) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onDelete={() => deleteProduct.mutate(product.id)}
                            isDeleting={deleteProduct.isPendingId === product.id}
                            wishlists={wishlists}
                            currentWishlistId={activeWishlistId}
                        />
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

function ProductCard({ product, onDelete, isDeleting, wishlists, currentWishlistId }: any) {
  const [isCopied, setIsCopied] = useState(false);
  const updateWishlist = useUpdateWishlist(); // Note: We need a dedicated "Move" or "Remove item" hook if we want it perfect
  // For simplicity here, we'll assume there will be API for these actions

  if (isDeleting) return null;

  const name = product.catalogProduct?.name || product.name;
  const image = product.catalogProduct?.images?.[0]?.url || product.images?.[0]?.url;
  const store = product.catalogProduct?.storeName || product.storeName || 'Unknown';
  const price = product.catalogProduct?.price || product.price;
  const currency = product.catalogProduct?.currency || product.currency;
  const url = product.catalogProduct?.canonicalUrl || product.url;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="border rounded-2xl overflow-hidden flex flex-col bg-card hover:shadow-xl transition-all duration-300 group border-muted/60 relative">
      <div className="aspect-square relative bg-muted/30 overflow-hidden">
        {image && (
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur" onClick={handleCopy}>
            {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </Button>

           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                        <MoveHorizontal className="h-4 w-4" />
                        Move to Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete from Collection
                    </DropdownMenuItem>
                </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
                {store}
            </span>
        </div>
        <h2 className="font-bold line-clamp-2 mb-3 text-base leading-tight min-h-[2.5rem] group-hover:text-primary transition-colors">{name}</h2>

        <div className="mt-auto pt-4 flex items-center justify-between">
            {price ? (
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Price</span>
                    <span className="font-black text-lg text-foreground">
                        {currency} {price}
                    </span>
                </div>
            ) : <div />}

            <Button variant="outline" size="sm" asChild className="rounded-full px-4 border-muted-foreground/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                View Site
                </a>
            </Button>
        </div>
      </div>
    </div>
  );
}

function CreateWishlistDialog() {
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const create = useCreateWishlist();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await create.mutateAsync({ name });
        setName('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full justify-start gap-3 h-11 px-4 rounded-xl" variant="default">
                    <Plus className="h-5 w-5" />
                    New Wishlist
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create Wishlist</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Wishlist Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Dream Home, Gift Ideas..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 text-lg"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={!name.trim() || create.isPending}>
                            {create.isPending ? 'Creating...' : 'Create Wishlist'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function WishlistSettingsDialog({ wishlist }: { wishlist: any }) {
    const [name, setName] = useState(wishlist.name);
    const [open, setOpen] = useState(false);
    const update = useUpdateWishlist();
    const del = useDeleteWishlist();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await update.mutateAsync({ id: wishlist.id, name });
        setOpen(false);
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${wishlist.name}"? items will remain in your "All Products" collection.`)) {
            await del.mutateAsync(wishlist.id);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Wishlist Settings</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rename Wishlist</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 text-lg"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button type="submit" className="h-12 text-lg font-bold" disabled={!name.trim() || update.isPending || name === wishlist.name}>
                            Save Changes
                        </Button>
                        <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-12" onClick={handleDelete} disabled={del.isPending}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Wishlist
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Custom hook for optimistic delete
function useMutationDelete() {
  const { mutate, isPending } = useDeleteProduct();
  const [pendingId, setPendingId] = useState<string | null>(null);

  return {
    mutate: (id: string) => {
      setPendingId(id);
      mutate(id, {
        onSettled: () => setPendingId(null),
      });
    },
    isPending,
    isPendingId: pendingId
  };
}
