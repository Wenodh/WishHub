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
    <div className="px-4 py-3 border-b flex items-center justify-between bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">W</span>
        </div>
        <span className="font-bold text-sm tracking-tight text-foreground">WishHub</span>
      </div>
      {queuedItems.length > 0 && (
        <button
            onClick={() => setState('offline_queue')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold hover:bg-amber-100 transition-colors"
        >
            <History className="h-3 w-3" />
            {queuedItems.length} {queuedItems.length === 1 ? 'item' : 'items'}
        </button>
      )}
    </div>
  )

  if (state === 'initializing' || state === 'extracting') return (
    <div className="w-80 h-[400px] flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
        <p className="font-medium text-sm animate-pulse text-foreground">
            {state === 'initializing' ? 'Checking session...' : 'Extracting product...'}
        </p>
      </div>
    </div>
  )

  if (state === 'unauthorized') return (
    <div className="w-80 flex flex-col bg-white">
      <Header />
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
        </div>
        <h2 className="font-bold text-lg text-foreground">Please Sign In</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You need to be logged in to save products to your wishlists.
        </p>
        <button
            onClick={openLogin}
            className="mt-6 w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm hover:bg-black/90 transition-colors"
        >
            Sign In to WishHub
        </button>
      </div>
    </div>
  )

  if (state === 'failed') return (
    <div className="w-80 flex flex-col bg-white">
      <Header />
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="font-bold text-lg text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {error || "We couldn't process this page."}
        </p>
        <button
            onClick={loadData}
            className="mt-6 w-full border border-gray-200 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors text-foreground"
        >
            Try Again
        </button>
      </div>
    </div>
  )

  if (state === 'success') return (
    <div className="w-80 flex flex-col bg-white animate-in fade-in duration-300">
      <Header />
      <div className="p-5 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="font-bold text-lg text-foreground leading-none">Saved!</h2>
        <p className="text-xs text-muted-foreground leading-none">
            Product successfully added to WishHub.
        </p>

        {/* AI Analysis Integration */}
        <div className="w-full border border-neutral-100 rounded-xl p-4 bg-neutral-50/50 text-left space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-foreground">AI Intelligence</span>
          </div>

          {aiStatus !== 'completed' ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
              <p className="text-xs text-neutral-500 font-semibold animate-pulse">
                AI is analyzing this product...
              </p>
            </div>
          ) : aiResult ? (
            <div className="space-y-2.5">
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                {aiResult.summary}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400">RECOMMENDATION</span>
                <span className="text-xs font-black text-green-600">
                  {aiResult.buyRecommendation}
                </span>
              </div>

              {aiResult.tags && aiResult.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-neutral-100">
                  {aiResult.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="bg-neutral-100 text-neutral-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 w-full pt-1">
            <button
                onClick={openDashboard}
                className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/90"
            >
                <ExternalLink className="h-4 w-4" />
                View Dashboard
            </button>
            <button
                onClick={() => { setAiResult(null); setAiStatus('pending'); setState('preview'); }}
                className="w-full border border-gray-200 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 text-foreground"
            >
                Save another
            </button>
        </div>
      </div>
    </div>
  )

  if (state === 'duplicate') return (
    <div className="w-80 flex flex-col bg-white">
      <Header />
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <History className="h-6 w-6 text-blue-500" />
        </div>
        <h2 className="font-bold text-lg text-foreground">Already Saved</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            This product is already in your wishlists.
        </p>

        <div className="w-full mt-6 space-y-3">
            <div className="text-left">
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block tracking-widest">Select Wishlist</label>
                <div className="relative">
                    <select
                        value={selectedWishlistId || ''}
                        onChange={(e) => setSelectedWishlistId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold appearance-none outline-none cursor-pointer pr-10 text-foreground"
                    >
                        {wishlists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <button
                    onClick={handleMoveToWishlist}
                    className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                    <ArrowRightLeft className="h-4 w-4" />
                    Move to this wishlist
                </button>
                <button
                    onClick={handleAddToAdditional}
                    className="w-full border border-black py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 text-foreground"
                >
                    <Plus className="h-4 w-4" />
                    Add to additional
                </button>
                <button
                    onClick={openDashboard}
                    className="w-full border border-gray-200 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 text-foreground"
                >
                    <ExternalLink className="h-4 w-4" />
                    View Dashboard
                </button>
            </div>
        </div>
      </div>
    </div>
  )

  if (state === 'offline_queue') return (
    <div className="w-80 flex flex-col h-[450px] bg-white">
      <Header />
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-foreground">Sync Queue</h2>
            <button
                onClick={() => setState(result ? 'preview' : 'failed')}
                className="p-1 hover:bg-gray-100 rounded text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>

        {queuedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">Queue is empty</p>
            </div>
        ) : (
            <div className="space-y-3">
                {queuedItems.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold line-clamp-1 flex-1 text-foreground">{item.product.title}</span>
                            <button onClick={() => handleDismissItem(item.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                        {item.status === 'failed' && (
                            <p className="text-[10px] text-red-500 font-medium leading-tight">
                                Error: {item.lastError}
                            </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-400">
                                {new Date(item.timestamp).toLocaleTimeString()} • {item.attempts} attempts
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.status === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                            }`}>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      <div className="p-4 border-t bg-gray-50 flex gap-2">
        <button
            disabled={isRefreshing || queuedItems.length === 0}
            onClick={handleRetryQueue}
            className="flex-1 bg-black text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Retry All
        </button>
      </div>
    </div>
  )

  if ((state === 'preview' || state === 'saving') && result) {
    const { product, confidence } = result
    const confidenceColor = confidence > 0.8 ? 'text-green-600' : confidence > 0.5 ? 'text-amber-600' : 'text-red-600'

    return (
      <div className="w-80 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white">
        <Header />

        <div className="p-4">
            <div className="aspect-video relative bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100 group">
                {product.images?.[0] ? (
                    <img src={product.images[0]} className="w-full h-full object-contain" alt={product.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Plus className="h-8 w-8 text-gray-200" />
                    </div>
                )}
                {product.price && (
                    <div className="absolute bottom-3 right-3 bg-black text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-lg">
                        {product.currency} {product.price}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h1 className="font-bold text-sm line-clamp-2 leading-snug mb-2 text-foreground">{product.title}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 bg-gray-100 rounded uppercase tracking-wider">
                        {product.store || 'Unknown'}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${confidenceColor}`}>
                        {Math.round(confidence * 100)}% Match
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-2 block tracking-widest">Target Wishlist</label>
                <div className="relative">
                    <select
                        value={selectedWishlistId || ''}
                        onChange={(e) => setSelectedWishlistId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold appearance-none focus:ring-2 focus:ring-black outline-none cursor-pointer transition-all pr-10 text-foreground"
                    >
                        {wishlists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.name} {list.isDefault ? ' (Default)' : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <button
                onClick={save}
                disabled={state === 'saving'}
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-black/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-black/10"
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
