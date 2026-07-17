'use client';

import { useWishlists } from '@wishhub/api-client';
import { Button, Skeleton } from '@wishhub/ui';
import {
  Layers,
  List,
  Star,
  Plus,
  ChevronRight,
  Sparkles,
  Command,
  Compass,
  FolderHeart,
  Grid
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@wishhub/utils';
import { CreateWishlistDialog } from '../dialogs/create-wishlist-dialog';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

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
        "group relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
        isActive
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md shadow-black/5 dark:shadow-white/5 scale-[1.02]"
          : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
      )}
    >
      <div className="flex items-center gap-3 truncate">
        <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-105", isActive ? "text-white dark:text-neutral-950" : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-50")} />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {isDefault && <Star className={cn("h-3 w-3 fill-yellow-400 text-yellow-400", isActive ? "" : "animate-pulse")} />}
        {count !== undefined && (
          <span className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded-md",
            isActive
              ? "bg-white/20 dark:bg-black/10 text-white dark:text-neutral-950"
              : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500"
          )}>
            {count}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <nav className="flex-1 space-y-8">
      <div className="space-y-1.5">
        <div className="px-3 mb-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Navigation
          </h3>
        </div>
        <NavItem
          href="/dashboard"
          icon={Grid}
          label="Home Dashboard"
          isActive={!activeWishlistId}
        />

        {isLoading ? (
          <div className="space-y-2 py-1 px-1">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : defaultWishlist && (
          <NavItem
            href={`/dashboard?wishlist=${defaultWishlist.id}`}
            icon={Compass}
            label={defaultWishlist.name}
            count={defaultWishlist.itemCount}
            isActive={activeWishlistId === defaultWishlist.id}
            isDefault
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Custom Wishlists
          </h3>
        </div>

        <div className="space-y-1.5">
          {isLoading ? (
            <div className="space-y-2 px-1">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : customWishlists?.length === 0 ? (
            <p className="px-4 py-4 text-xs text-neutral-400 dark:text-neutral-500 italic font-medium">No custom folders yet.</p>
          ) : (
            customWishlists?.map((w) => (
              <NavItem
                key={w.id}
                href={`/dashboard?wishlist=${w.id}`}
                icon={FolderHeart}
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
    <div className="flex h-full flex-col p-6">
      {/* Brand Logo Header */}
      <div className="mb-10 px-2 py-3">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-lg transition-transform duration-500 group-hover:rotate-12">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-black tracking-tight text-neutral-950 dark:text-white flex items-center gap-1.5">
            WishHub
            <span className="text-[9px] font-black bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 px-1.5 py-0.5 rounded-md text-neutral-500">v4.0</span>
          </span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      }>
        <SidebarNav onClose={onClose} />
      </Suspense>

      <div className="mt-auto border-t border-neutral-100 dark:border-neutral-900 pt-6">
        <CreateWishlistDialog />
      </div>
    </div>
  );
}
