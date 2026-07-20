'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Calendar,
  Tag,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowRight,
  Move,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { Button, Badge, Avatar, Skeleton } from '@wishhub/ui';
import { useProductInsights, useProductSimilar, useRegenerateProductInsights } from '@wishhub/api-client';
import { cn } from '@wishhub/utils';

interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onMove: () => void;
  onDelete: () => void;
  isCopied: boolean;
  onCopy: () => void;
}

export function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onMove,
  onDelete,
  isCopied,
  onCopy
}: ProductDetailDrawerProps) {
  const { data: insightsData } = useProductInsights(product?.id);
  const { data: similarData, isLoading: similarLoading } = useProductSimilar(product?.id);
  const regenerateMutation = useRegenerateProductInsights();

  if (!product) return null;

  const isGenerating = insightsData?.status === 'generating' || insightsData?.status === 'pending';
  const insight = insightsData?.insight;
  const tags = insightsData?.tags || [];

  const title = product.title || product.catalogProduct?.title || product.name || 'Curated Product';
  const store = product.store || product.catalogProduct?.storeName || product.storeName || 'Store';
  const image = product.imageUrl || product.catalogProduct?.images?.[0]?.url || product.images?.[0]?.url;
  const price = product.price || product.catalogProduct?.price;
  const currency = product.currency || product.catalogProduct?.currency || '$';
  const url = product.url || product.catalogProduct?.canonicalUrl;
  const addedAt = product.addedAt || product.createdAt;


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-md"
          />

          {/* Premium Right Side Slide-over Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white/95 dark:bg-neutral-950/95 border-l border-neutral-200/60 dark:border-neutral-800/60 shadow-2xl backdrop-blur-3xl overflow-y-auto flex flex-col"
          >
            {/* Header Sticky Panel */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-widest text-[10px] rounded-lg">
                  {store}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all hover:scale-105 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Drawer Area */}
            <div className="flex-1 p-6 space-y-8 pb-12">

              {/* Product Visual Center */}
              <div className="space-y-4">
                <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-3xl overflow-hidden border border-neutral-200/30 dark:border-neutral-800/30 bg-neutral-100 dark:bg-neutral-900 premium-shadow">
                  {image ? (
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-300">
                      <Tag className="h-12 w-12" />
                    </div>
                  )}
                  {price && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black text-sm px-4 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 border border-white/10">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                        {currency} {price}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
                    {title}
                  </h2>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-semibold text-[10px] rounded-lg px-2.5 py-0.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    Originally saved from <span className="underline font-semibold">{store}</span>. Continuous real-time updates monitor this pricing model.
                  </p>
                </div>
              </div>

              {/* Action Toolbar buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={onCopy}
                  className="rounded-2xl gap-2 h-11 border-neutral-200 dark:border-neutral-800 transition-all active:scale-95 text-xs font-bold"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onMove}
                  className="rounded-2xl gap-2 h-11 border-neutral-200 dark:border-neutral-800 transition-all active:scale-95 text-xs font-bold"
                >
                  <Move className="h-4 w-4" />
                  Move to
                </Button>

                <Button
                  variant="default"
                  asChild
                  className="rounded-2xl gap-2 h-11 transition-all active:scale-95 text-xs font-bold col-span-2 sm:col-span-2"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Visit Official Site
                  </a>
                </Button>
              </div>

              {/* AI Insights Section */}
              <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    AI Shopping Insights
                  </h3>
                </div>

                {isGenerating ? (
                  <div className="p-6 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/40 dark:bg-neutral-900/10 space-y-4 animate-pulse">
                    <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                    <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                  </div>
                ) : insight ? (
                  <div className="space-y-6">
                    {/* Summary Block */}
                    <div className="p-6 rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-white dark:bg-neutral-950/40 shadow-sm leading-relaxed text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                      {insight.summary}
                    </div>

                    {/* Buy Recommendation */}
                    <div className="p-6 rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/30 dark:bg-neutral-900/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Recommendation</span>
                        <Badge className={cn(
                          "font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg",
                          insight.buyRecommendation === 'Good Buy' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                          insight.buyRecommendation === 'Consider Waiting' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                          'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'
                        )}>
                          {insight.buyRecommendation}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-neutral-900 dark:text-white">
                          {Math.round((insight.confidenceScore || 0) * 100)}%
                        </span>
                        <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Match Confidence</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                        {insight.reasoning}
                      </p>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-3xl border border-green-500/10 bg-green-500/5 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400">Pros</h4>
                        <ul className="space-y-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {Array.isArray(insight.pros) && insight.pros.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 rounded-3xl border border-red-500/10 bg-red-500/5 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">Cons</h4>
                        <ul className="space-y-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {Array.isArray(insight.cons) && insight.cons.map((con: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Regenerate Trigger Button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={regenerateMutation.isPending}
                        onClick={() => regenerateMutation.mutate(product.id)}
                        className="rounded-xl font-bold text-xs gap-2"
                      >
                        <Clock className={cn("h-4 w-4", regenerateMutation.isPending && "animate-spin")} />
                        {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate AI Analysis'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/5">
                    <Sparkles className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-medium">No AI Insights generated yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={regenerateMutation.isPending}
                      onClick={() => regenerateMutation.mutate(product.id)}
                      className="mt-3 rounded-xl font-bold text-xs"
                    >
                      {regenerateMutation.isPending ? 'Generating...' : 'Analyze with AI'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Similar Products */}
              <div className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Similar Products</h3>
                {similarLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <Skeleton className="h-20 w-44 rounded-2xl" />
                    <Skeleton className="h-20 w-44 rounded-2xl" />
                  </div>
                ) : similarData?.similar && similarData.similar.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {similarData.similar.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/40 dark:bg-neutral-900/10 min-w-[200px] flex-shrink-0 space-y-2"
                      >
                        <Badge variant="secondary" className="text-[8px] font-extrabold uppercase px-1.5 py-0">
                          {item.store}
                        </Badge>
                        <h4 className="font-bold text-xs truncate text-neutral-800 dark:text-neutral-200">{item.title}</h4>
                        <div className="font-extrabold text-xs text-neutral-950 dark:text-white">
                          ${(item.metadata as any)?.price || 'unspecified'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No similar products discovered in your wishlists yet.</p>
                )}
              </div>

              {/* Pricing breakdown insights */}
              {price && (
                <div className="p-5 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/40 dark:bg-neutral-900/10 space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Price Intelligence</h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Current Price</span>
                      <span className="text-lg font-black text-neutral-900 dark:text-white block">
                        {currency}{price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-900/50 p-3 rounded-2xl border border-neutral-200/10 dark:border-neutral-800/10">
                    <Clock className="h-4 w-4" />
                    Price tracking is active. No historical price changes captured yet.
                  </div>
                </div>
              )}

              {/* Activity Track Timeline */}
              <div className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Activity Timeline</h3>

                <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3.5 space-y-6">
                  {/* Event: Product Saved */}
                  <div className="relative pl-6">
                    <div className="absolute left-[-7px] top-1.5 h-3.5 w-3.5 rounded-full bg-neutral-900 dark:bg-white border-4 border-neutral-50 dark:border-neutral-950" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Product saved to workspace
                      </div>
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        Saved on {new Date(addedAt).toLocaleDateString()} at {new Date(addedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Actions Area */}
              <div className="pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="w-full gap-2 rounded-2xl h-11 hover:scale-[1.01] transition-transform text-xs font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently From Workspace
                </Button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
