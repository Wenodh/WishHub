'use client';

import { useWishlists } from '@wishhub/api-client';
import { Button, Skeleton } from '@wishhub/ui';
import {
  Layers,
  List,
  Star,
  Plus,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@wishhub/utils';
import { CreateWishlistDialog } from '../dialogs/create-wishlist-dialog';
import { Suspense } from 'react';

interface WishlistSidebarProps {
  onClose?: () => void;
}

function SidebarNav({ onClose }: WishlistSidebarProps) {
  const { data: wishlists, isLoading } = useWishlists();
  const searchParams = useSearchParams();
  const activeWishlistId = searchParams.get('wishlist');

  const defaultWishlist = wishlists?.find(w => w.isDefault);
  const customWishlists = wishlists?.filter(w => !w.isDefault);

  const NavItem = ({
    href,
    icon: Icon,
    label,
    count,
    isActive,
    isDefault
  }: any) => (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3 truncate">
        <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {isDefault && <Star className={cn("h-3 w-3 fill-current", isActive ? "text-primary-foreground" : "text-primary")} />}
        {count !== undefined && (
          <span className={cn(
            "text-[10px] font-bold",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground/60"
          )}>
            {count}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <nav className="flex-1 space-y-8">
      <div className="space-y-1">
        <NavItem
          href="/dashboard"
          icon={Layers}
          label="All Products"
          isActive={!activeWishlistId}
        />

        {isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-8 w-full" />
          </div>
        ) : defaultWishlist && (
          <NavItem
            href={`/dashboard?wishlist=${defaultWishlist.id}`}
            icon={List}
            label={defaultWishlist.name}
            count={defaultWishlist.itemCount}
            isActive={activeWishlistId === defaultWishlist.id}
            isDefault
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Custom Wishlists
          </h3>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : customWishlists?.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground italic">No custom wishlists yet.</p>
          ) : (
            customWishlists?.map((w) => (
              <NavItem
                key={w.id}
                href={`/dashboard?wishlist=${w.id}`}
                icon={List}
                label={w.name}
                count={w.itemCount}
                isActive={activeWishlistId === w.id}
              />
            ))
          )}
        </div>
      </div>
    </nav>
  );
}

export function WishlistSidebar({ onClose }: WishlistSidebarProps) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 px-2 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">WishHub</span>
        </Link>
      </div>

      <Suspense fallback={<div className="flex-1 space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>}>
        <SidebarNav onClose={onClose} />
      </Suspense>

      <div className="mt-auto border-t pt-4">
        <CreateWishlistDialog />
      </div>
    </div>
  );
}
