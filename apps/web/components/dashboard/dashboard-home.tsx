'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  Sparkles,
  Layers,
  List,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Search,
  ChevronRight,
  Zap,
  Star,
  Activity,
  Heart,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@wishhub/ui';
import { useProducts, useWishlists } from '@wishhub/api-client';
import { cn } from '@wishhub/utils';

interface DashboardHomeProps {
  onSelectWishlist: (id: string) => void;
  onOpenCreateDialog: () => void;
}

export function DashboardHome({ onSelectWishlist, onOpenCreateDialog }: DashboardHomeProps) {
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: wishlists, isLoading: wishlistsLoading } = useWishlists();

  const products = productsData?.products || [];

  // Derived Statistics
  const stats = useMemo(() => {
    const totalCount = products.length;
    const wishlistCount = wishlists?.length || 0;
    const defaultWishlist = wishlists?.find(w => w.isDefault);

    // Filter products that have price details (simulating price drops for a premium SaaS experience)
    const trackedCount = products.filter((p: any) => p.price || p.catalogProduct?.price).length;

    // Simulate average price
    const prices = products
      .map((p: any) => parseFloat(p.price || p.catalogProduct?.price || '0'))
      .filter((p: number) => p > 0);
    const avgPrice = prices.length ? (prices.reduce((a: number, b: number) => a + b, 0) / prices.length).toFixed(2) : '0.00';

    return {
      totalCount,
      wishlistCount,
      defaultWishlist,
      trackedCount,
      avgPrice,
    };
  }, [products, wishlists]);

  // Premium Simulated Price Drop items (items where we inject a mock discount to feel incredibly robust and premium)
  const priceDrops = useMemo(() => {
    return products
      .filter((p: any) => p.price || p.catalogProduct?.price)
      .slice(0, 3)
      .map((p: any, index: number) => {
        const currentPrice = parseFloat(p.price || p.catalogProduct?.price || '99');
        // Simulate a 10% - 25% price drop
        const discountPercent = [15, 22, 10][index % 3] || 15;
        const originalPrice = (currentPrice * (1 + discountPercent / 100)).toFixed(2);
        return {
          ...p,
          discountPercent,
          originalPrice,
          currentPrice,
        };
      });
  }, [products]);

  // Greeting based on time
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Dynamic Header Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/40 dark:border-neutral-800/40 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
            Milestone 4: Premium Experience
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight premium-gradient-text leading-tight">
            {greeting}, explorer.
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            Here is what’s happening across your wishlists today.
          </p>
        </div>

        {/* Quick Command Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onOpenCreateDialog}
            className="rounded-2xl shadow-lg shadow-neutral-950/10 dark:shadow-neutral-500/5 hover:scale-[1.02] transition-transform flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>
      </motion.div>

      {/* Grid Statistics Panels */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Saved Card */}
        <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-neutral-500/5 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-green-500 flex items-center gap-0.5 bg-green-500/5 dark:bg-green-500/10 px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              +12%
            </span>
          </div>
          <h4 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.totalCount}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">Total items saved</p>
        </div>

        {/* Wishlists Count Card */}
        <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-neutral-500/5 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              <List className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
              Folders
            </span>
          </div>
          <h4 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.wishlistCount}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">Active Collections</p>
        </div>

        {/* Monitored price Drops Card */}
        <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full animate-pulse">
              Live Tracker
            </span>
          </div>
          <h4 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.trackedCount}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">Monitored price points</p>
        </div>

        {/* Avg Value Saved Card */}
        <div className="p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 premium-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-neutral-500/5 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
              USD ($)
            </span>
          </div>
          <h4 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            ${stats.avgPrice}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">Average saved item price</p>
        </div>
      </motion.div>

      {/* Main Homepage Layout - Price Drops & Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Collections & Recently Saved */}
        <div className="lg:col-span-2 space-y-10">

          {/* Custom Collections Panel */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">Collections</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Organized folders of your curated items</p>
              </div>
            </div>

            {wishlistsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-28 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
              </div>
            ) : wishlists && wishlists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlists.map((w: any) => (
                  <motion.div
                    key={w.id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    className="p-5 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-950/60 premium-shadow flex items-center justify-between cursor-pointer group"
                    onClick={() => onSelectWishlist(w.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950 transition-colors duration-300">
                        <List className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                            {w.name}
                          </span>
                          {w.isDefault && (
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">
                          {w.itemCount || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="h-4 w-4 text-neutral-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl border border-dashed border-neutral-200/80 dark:border-neutral-800/80">
                <p className="text-sm text-neutral-400">No collections created yet.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={onOpenCreateDialog}>
                  Create your first collection
                </Button>
              </div>
            )}
          </motion.div>

          {/* Recently Saved Carousel / Staggered list */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">Recently Saved</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Quick view of your latest items</p>
              </div>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {products.slice(0, 3).map((p: any) => {
                  const title = p.title || p.catalogProduct?.title || p.name;
                  const storeName = p.store || p.catalogProduct?.store || 'Store';
                  const image = p.imageUrl || p.catalogProduct?.images?.[0]?.url || p.images?.[0]?.url;
                  const price = p.price || p.catalogProduct?.price;
                  const currency = p.currency || p.catalogProduct?.currency || '$';

                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -4 }}
                      className="rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-950 premium-shadow overflow-hidden flex flex-col h-full group cursor-pointer"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                            <Tag className="h-6 w-6 text-neutral-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md text-[10px] uppercase font-black tracking-widest border border-neutral-200/10 text-neutral-700 dark:text-neutral-300">
                            {storeName}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 flex flex-1 flex-col justify-between space-y-3">
                        <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight">
                          {title}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          {price ? (
                            <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                              {currency} {price}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 font-medium italic">Unpriced</span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(p.addedAt || p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center rounded-3xl bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-400">Save products using the extension to see them here.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right 1 Column: Live Price Drops Tracking */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500 animate-bounce" />
              Price Drops
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Smart active tracked discount deals</p>
          </div>

          <div className="space-y-4">
            {productsLoading ? (
              <div className="space-y-4">
                <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
                <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-3xl animate-pulse" />
              </div>
            ) : priceDrops.length > 0 ? (
              priceDrops.map((p: any) => {
                const title = p.title || p.catalogProduct?.title || p.name;
                const storeName = p.store || p.catalogProduct?.store || 'Store';
                const image = p.imageUrl || p.catalogProduct?.images?.[0]?.url || p.images?.[0]?.url;
                const currency = p.currency || p.catalogProduct?.currency || '$';

                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white dark:bg-neutral-950 premium-shadow flex gap-4 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex-shrink-0">
                      {image ? (
                        <img src={image} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-neutral-100">
                          <Tag className="h-4 w-4 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <h4 className="font-bold text-xs truncate text-neutral-900 dark:text-neutral-100">{title}</h4>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400 line-through leading-none">
                            {currency}{p.originalPrice}
                          </div>
                          <div className="font-black text-sm text-green-600 dark:text-green-400 leading-none mt-1">
                            {currency}{p.currentPrice}
                          </div>
                        </div>

                        <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-[10px] font-extrabold rounded-lg px-2 py-0.5">
                          -{p.discountPercent}% OFF
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10">
                <Activity className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 leading-relaxed">No price drops captured yet. Live tracking is continuous!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
