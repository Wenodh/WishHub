import React, { useEffect, useState, useCallback } from 'react'
import { WishHubSDK } from '@wishhub/sdk'
import { type ExtractionResult } from '@wishhub/scraper'
import { type WishlistSummary } from '@wishhub/contracts'
import {
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  Plus,
  ChevronDown,
  History,
  X,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react'
import { getStorage, updateStorage, QueuedSave } from './lib/storage'
import { telemetry } from './lib/telemetry'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000'
const sdk = new WishHubSDK(API_URL)

type State =
  | 'initializing'
  | 'extracting'
  | 'preview'
  | 'saving'
  | 'success'
  | 'duplicate'
  | 'offline_queue'
  | 'unauthorized'
  | 'failed'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function App() {
  const [state, setState] = useState<State>('initializing')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [wishlists, setWishlists] = useState<WishlistSummary[]>([])
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [queuedItems, setQueuedItems] = useState<QueuedSave[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [duplicateProduct, setDuplicateProduct] = useState<any>(null)

  const [aiResult, setAiResult] = useState<any>(null)
  const [aiStatus, setAiStatus] = useState<string>('pending')

  const pollInsights = (productId: string) => {
    setAiStatus('pending')
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      if (attempts > 15) { // Stop after 45 seconds
        clearInterval(interval)
        return
      }
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}/insights`)
        if (res.ok) {
          const json = await res.json()
          const data = json.success && json.data !== undefined ? json.data : json
          if (data.status === 'completed') {
            setAiResult(data.insight)
            setAiStatus('completed')
            clearInterval(interval)
          } else {
            setAiStatus('generating')
          }
        }
      } catch (err) {
        console.error(err)
      }
    }, 3000)
  }

  const loadData = useCallback(async () => {
    try {
      const storage = await getStorage()
      const { wishlistsCache, lastUsedWishlistId, offlineQueue } = storage.data
      setQueuedItems(offlineQueue || [])

      // 1. Check Auth
      let session = null
      try {
        session = await sdk.auth.getSession()
      } catch (e: any) {
        if (e.status === 401) {
            setState('unauthorized')
            return
        }
        throw e
      }

      if (!session) {
        setState('unauthorized')
        return
      }

      // 2. Load Wishlists (Stale-while-revalidate)
      if (wishlistsCache && (Date.now() - wishlistsCache.timestamp < CACHE_TTL)) {
        setWishlists(wishlistsCache.items)
        const initialId = lastUsedWishlistId || wishlistsCache.items.find(l => l.isDefault)?.id || wishlistsCache.items[0]?.id
        setSelectedWishlistId(initialId || null)
      }

      // Fetch fresh wishlists in background
      setIsRefreshing(true)
      sdk.wishlists.list().then(async (freshLists) => {
        setWishlists(freshLists)
        await updateStorage(() => ({
          wishlistsCache: {
            items: freshLists,
            timestamp: Date.now()
          }
        }))
        if (!selectedWishlistId) {
          const initialId = lastUsedWishlistId || freshLists.find(l => l.isDefault)?.id || freshLists[0]?.id
          setSelectedWishlistId(initialId || null)
        }
        setIsRefreshing(false)
      }).catch(err => {
        telemetry.emit('RetryFailed', { context: 'wishlist_refresh', error: err.message });
        setIsRefreshing(false)
      })

      // 3. Extract Product
      setState('extracting')
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error('No active tab')

      // Use a timeout for message sending
      const extractionPromise = chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PRODUCT' })
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Extraction timed out')), 2000))

      const response = await Promise.race([extractionPromise, timeoutPromise]) as ExtractionResult | null
      if (!response) throw new Error('Extraction failed')

      setResult(response)
      telemetry.emit('ProductExtracted', {
        store: response.product.store,
        confidence: response.confidence
      })
      setState('preview')
    } catch (err: any) {
      if (err.message?.includes('401') || err.status === 401) {
        setState('unauthorized')
      } else {
        setError(err.message)
        setState('failed')
      }
    }
  }, [selectedWishlistId])

  useEffect(() => {
    telemetry.emit('PopupOpened')
    loadData()
  }, [])

  const save = async () => {
    if (!result) return
    setState('saving')

    const productData = {
      name: result.product.title,
      url: result.product.originalUrl,
      images: result.product.images,
      price: result.product.price,
      currency: result.product.currency,
      storeName: result.product.store,
      description: result.product.description,
      rawMetadata: result.product.rawMetadata,
      wishlistId: selectedWishlistId,
    } as any

    try {
      if (selectedWishlistId) {
        await updateStorage(() => ({ lastUsedWishlistId: selectedWishlistId }))
      }

      const response = await sdk.products.save(productData)

      if (response.duplicate) {
        setDuplicateProduct(response.product)
        setState('duplicate')
        telemetry.emit('DuplicateDetected')
      } else {
        setState('success')
        telemetry.emit('ProductSaved', { store: result.product.store })
        if (response.product?.id) {
          pollInsights(response.product.id)
        }
      }
    } catch (err: any) {
      if (err.status === 401) {
        setState('unauthorized')
      } else if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.status === 0 || err.status >= 500) {
        // Queue for offline
        const queuedItem: QueuedSave = {
          id: crypto.randomUUID(),
          product: result.product,
          wishlistId: selectedWishlistId || undefined,
          timestamp: Date.now(),
          attempts: 0,
          status: 'pending'
        }
        await updateStorage((data) => ({
          offlineQueue: [...data.offlineQueue, queuedItem]
        }))
        setQueuedItems(prev => [...prev, queuedItem])
        setState('offline_queue')
        telemetry.emit('OfflineQueued')
      } else {
        setError(err.message)
        setState('failed')
      }
    }
  }

  const handleAddToAdditional = async () => {
    if (!duplicateProduct || !selectedWishlistId) return
    setState('saving')
    try {
      await sdk.wishlists.addProduct(selectedWishlistId, duplicateProduct.id)
      setState('success')
    } catch (err: any) {
      setError(err.message)
      setState('failed')
    }
  }

  const handleMoveToWishlist = async () => {
    if (!duplicateProduct || !selectedWishlistId) return
    setState('saving')
    try {
        // Move: Add to B, then try to remove from all others where it might be.
        await sdk.wishlists.addProduct(selectedWishlistId, duplicateProduct.id)
        telemetry.emit('ProductSaved', { action: 'move', productId: duplicateProduct.id, targetWishlistId: selectedWishlistId });
        setState('success')
    } catch (err: any) {
      setError(err.message)
      setState('failed')
    }
  }

  const handleRetryQueue = async () => {
    setIsRefreshing(true)
    await chrome.runtime.sendMessage({ action: 'PROCESS_QUEUE' })
    const storage = await getStorage()
    setQueuedItems(storage.data.offlineQueue)
    setIsRefreshing(false)
  }

  const handleDismissItem = async (id: string) => {
    await chrome.runtime.sendMessage({ action: 'DISMISS_FAILED_ITEM', id })
    const storage = await getStorage()
    setQueuedItems(storage.data.offlineQueue)
  }

  const openDashboard = () => {
    window.open(`${API_URL}/dashboard`, '_blank')
  }

  const openLogin = () => {
    window.open(`${API_URL}/login`, '_blank')
  }

  // --- Render Helpers ---

  const Header = () => (
    <div className="px-4 py-3.5 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
          <Sparkles className="text-primary-foreground h-4 w-4" />
        </div>
        <span className="font-extrabold text-sm tracking-tight text-foreground">WishHub</span>
      </div>
      {queuedItems.length > 0 && (
        <button
            onClick={() => setState('offline_queue')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-extrabold hover:bg-amber-500/20 transition-all active:scale-95"
        >
            <History className="h-3 w-3" />
            {queuedItems.length} {queuedItems.length === 1 ? 'item' : 'items'}
        </button>
      )}
    </div>
  )

  if (state === 'initializing' || state === 'extracting') return (
    <div className="w-80 h-[400px] flex flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-foreground opacity-70" />
        <p className="font-bold text-xs animate-pulse text-muted-foreground uppercase tracking-widest text-center">
            {state === 'initializing' ? 'Verifying session...' : 'Extracting metadata...'}
        </p>
      </div>
    </div>
  )

  if (state === 'unauthorized') return (
    <div className="w-80 flex flex-col bg-background text-foreground">
      <Header />
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h2 className="font-black text-lg text-foreground tracking-tight">Access Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your WishHub account to capture products straight to your collections.
          </p>
        </div>
        <button
            onClick={openLogin}
            className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm hover:opacity-95 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
        >
            Connect Account
        </button>
      </div>
    </div>
  )

  if (state === 'failed') return (
    <div className="w-80 flex flex-col bg-background text-foreground">
      <Header />
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="font-black text-lg text-foreground tracking-tight">Process Failed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
              {error || "We couldn't analyze the merchant data on this page."}
          </p>
        </div>
        <button
            onClick={loadData}
            className="w-full border border-border bg-muted/30 py-3 rounded-2xl font-bold text-sm hover:bg-muted transition-all text-foreground active:scale-[0.98]"
        >
            Retry Extraction
        </button>
      </div>
    </div>
  )

  if (state === 'success') return (
    <div className="w-80 flex flex-col bg-background text-foreground animate-in fade-in duration-300">
      <Header />
      <div className="p-5 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <div className="space-y-1">
          <h2 className="font-black text-lg text-foreground tracking-tight">Saved to Curation!</h2>
          <p className="text-xs text-muted-foreground leading-none">
              Your item is safely secured.
          </p>
        </div>

        {/* AI Analysis Integration */}
        <div className="w-full border border-border rounded-2xl p-4 bg-muted/30 text-left space-y-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Intelligence Summary</span>
          </div>

          {aiStatus !== 'completed' ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-semibold animate-pulse">
                Analyzing and optimizing product pricing...
              </p>
            </div>
          ) : aiResult ? (
            <div className="space-y-2.5">
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                {aiResult.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">RECOMMENDATION</span>
                <span className="text-xs font-black text-green-500 uppercase tracking-wider">
                  {aiResult.buyRecommendation}
                </span>
              </div>

              {aiResult.tags && aiResult.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                  {aiResult.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="bg-muted text-muted-foreground text-[9px] font-bold px-2 py-0.5 rounded-lg border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
            <button
                onClick={openDashboard}
                className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
            >
                <ExternalLink className="h-4 w-4" />
                Open Dashboard
            </button>
            <button
                onClick={() => { setAiResult(null); setAiStatus('pending'); setState('preview'); }}
                className="w-full border border-border bg-muted/40 py-3 rounded-2xl font-bold text-sm hover:bg-muted text-foreground active:scale-[0.98] transition-all"
            >
                Add another item
            </button>
        </div>
      </div>
    </div>
  )

  if (state === 'duplicate') return (
    <div className="w-80 flex flex-col bg-background text-foreground">
      <Header />
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <History className="h-7 w-7 text-blue-500" />
        </div>
        <div className="space-y-1">
          <h2 className="font-black text-lg text-foreground tracking-tight">Already Saved</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
              This product is already stored in your curated collection.
          </p>
        </div>

        <div className="w-full mt-2 space-y-4">
            <div className="text-left">
                <label className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 block tracking-widest">Select target collection</label>
                <div className="relative">
                    <select
                        value={selectedWishlistId || ''}
                        onChange={(e) => setSelectedWishlistId(e.target.value)}
                        className="w-full bg-muted border border-border rounded-2xl py-2.5 px-4 text-sm font-bold appearance-none outline-none cursor-pointer pr-10 text-foreground focus:ring-1 focus:ring-foreground transition-all"
                    >
                        {wishlists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={handleMoveToWishlist}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
                >
                    <ArrowRightLeft className="h-4 w-4" />
                    Move to this collection
                </button>
                <button
                    onClick={handleAddToAdditional}
                    className="w-full border border-border bg-muted/40 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-foreground active:scale-[0.98] hover:bg-muted transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add to additional list
                </button>
                <button
                    onClick={openDashboard}
                    className="w-full border border-border bg-muted/20 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted text-foreground active:scale-[0.98] transition-all"
                >
                    <ExternalLink className="h-4 w-4" />
                    Open Dashboard
                </button>
            </div>
        </div>
      </div>
    </div>
  )

  if (state === 'offline_queue') return (
    <div className="w-80 flex flex-col h-[450px] bg-background text-foreground">
      <Header />
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="font-black text-sm text-foreground tracking-tight">Sync Queue</h2>
            <button
                onClick={() => setState(result ? 'preview' : 'failed')}
                className="p-1 hover:bg-muted rounded-xl text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>

        {queuedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs font-bold text-muted-foreground">Queue is empty</p>
            </div>
        ) : (
            <div className="space-y-3">
                {queuedItems.map(item => (
                    <div key={item.id} className="p-4 border border-border rounded-2xl bg-muted/30 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold line-clamp-1 flex-1 text-foreground">{item.product.title}</span>
                            <button onClick={() => handleDismissItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {item.status === 'failed' && (
                            <p className="text-[10px] text-destructive font-semibold leading-tight">
                                Error: {item.lastError}
                            </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {item.attempts} retries
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
                                item.status === 'pending'
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
        <button
            disabled={isRefreshing || queuedItems.length === 0}
            onClick={handleRetryQueue}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg"
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry All Queue
        </button>
      </div>
    </div>
  )

  if ((state === 'preview' || state === 'saving') && result) {
    const { product, confidence } = result
    const confidenceColor = confidence > 0.8 ? 'text-green-500' : confidence > 0.5 ? 'text-amber-500' : 'text-destructive'

    return (
      <div className="w-80 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 bg-background text-foreground">
        <Header />

        <div className="p-4 space-y-4">
            <div className="aspect-[4/3] relative bg-muted rounded-2xl overflow-hidden border border-border group shadow-inner">
                {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-contain p-2" alt={product.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Plus className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                )}
                {product.price && (
                    <div className="absolute bottom-3 right-3 bg-neutral-900/90 dark:bg-neutral-50/90 backdrop-blur text-white dark:text-neutral-950 px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                        {product.currency} {product.price}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <h1 className="font-black text-sm line-clamp-2 leading-snug text-foreground tracking-tight">{product.title}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-muted-foreground px-2 py-0.5 bg-muted rounded-lg border border-border uppercase tracking-widest">
                        {product.store || 'Unknown'}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-border" />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${confidenceColor}`}>
                        {Math.round(confidence * 100)}% Match
                    </span>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 block tracking-widest">Target Collection</label>
                <div className="relative">
                    <select
                        value={selectedWishlistId || ''}
                        onChange={(e) => setSelectedWishlistId(e.target.value)}
                        className="w-full bg-muted border border-border rounded-2xl py-2.5 px-4 text-sm font-bold appearance-none focus:ring-1 focus:ring-foreground outline-none cursor-pointer transition-all pr-10 text-foreground"
                    >
                        {wishlists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.name} {list.isDefault ? ' (★)' : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <button
                onClick={save}
                disabled={state === 'saving'}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-black text-sm flex items-center justify-center hover:opacity-95 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-primary/10"
            >
                {state === 'saving' ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving to WishHub...
                    </>
                ) : (
                    <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Wishlist
                    </>
                )}
            </button>
        </div>
      </div>
    )
  }

  return null
}

export default App
