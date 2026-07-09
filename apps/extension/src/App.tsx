import React, { useEffect, useState } from 'react'
import { WishHubSDK } from '@wishhub/sdk'
import { type ExtractionResult } from '@wishhub/scraper'
import { type WishlistSummary } from '@wishhub/contracts'
import {
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ShieldAlert,
  WifiOff,
  Plus,
  ChevronDown
} from 'lucide-react'

const sdk = new WishHubSDK((import.meta as any).env.VITE_API_URL || 'http://localhost:3000')

type State =
  | 'extracting'
  | 'preview'
  | 'saving'
  | 'success'
  | 'duplicate'
  | 'offline'
  | 'unauthorized'
  | 'failed'

function App() {
  const [state, setState] = useState<State>('extracting')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [wishlists, setWishlists] = useState<WishlistSummary[]>([])
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.onLine) {
        setState('offline')
        return
    }
    initialize()
  }, [])

  const initialize = async () => {
    setState('extracting')
    try {
      // 1. Fetch Wishlists
      const lists = await sdk.wishlists.list()
      setWishlists(lists)

      // 2. Determine initial wishlist (last used or default)
      const storage = await chrome.storage.local.get('lastUsedWishlistId')
      const initialId = (storage.lastUsedWishlistId as string) || lists.find(l => l.isDefault)?.id || lists[0]?.id
      setSelectedWishlistId(initialId || null)

      // 3. Extract Product
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error('No active tab')

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PRODUCT' })
      if (!response) throw new Error('Extraction failed')

      setResult(response)
      setState('preview')
    } catch (err: any) {
      if (err.message?.includes('401') || err.status === 401) {
        setState('unauthorized')
      } else {
        setError(err.message)
        setState('failed')
      }
    }
  }

  const save = async () => {
    if (!result) return
    setState('saving')
    try {
      // Save last used wishlist
      if (selectedWishlistId) {
        await chrome.storage.local.set({ lastUsedWishlistId: selectedWishlistId })
      }

      const response = await sdk.products.save({
        name: result.product.title,
        url: result.product.originalUrl,
        images: result.product.images,
        price: result.product.price,
        currency: result.product.currency,
        storeName: result.product.store,
        description: result.product.description,
        rawMetadata: result.product.rawMetadata,
        wishlistId: selectedWishlistId,
      } as any) // Type cast for custom fields

      if (response.duplicate) {
        setState('duplicate')
      } else {
        setState('success')
      }
    } catch (err: any) {
      if (err.status === 401) {
        setState('unauthorized')
      } else {
        setError(err.message)
        setState('failed')
      }
    }
  }

  const openDashboard = () => {
    window.open(`${sdk.products['baseUrl']}/dashboard`, '_blank')
  }

  const openLogin = () => {
    window.open(`${sdk.products['baseUrl']}/login`, '_blank')
  }

  if (state === 'offline') return (
    <div className="p-6 flex flex-col items-center text-center w-80">
      <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="font-bold text-lg">You are offline</h2>
      <p className="text-sm text-muted-foreground mt-2">Please check your internet connection and try again.</p>
    </div>
  )

  if (state === 'unauthorized') return (
    <div className="p-6 flex flex-col items-center text-center w-80">
      <ShieldAlert className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="font-bold text-lg">Please Sign In</h2>
      <p className="text-sm text-muted-foreground mt-2">You need to be logged in to save products to WishHub.</p>
      <button onClick={openLogin} className="mt-4 w-full bg-black text-white py-2 rounded-md font-medium">
        Sign In
      </button>
    </div>
  )

  if (state === 'extracting') return (
    <div className="p-8 flex flex-col items-center justify-center w-80">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="font-medium animate-pulse">Initializing WishHub...</p>
    </div>
  )

  if (state === 'failed') return (
    <div className="p-6 flex flex-col items-center text-center w-80">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="font-bold text-lg text-destructive">Oops!</h2>
      <p className="text-sm text-muted-foreground mt-2">{error || "Something went wrong."}</p>
      <button onClick={initialize} className="mt-4 w-full border border-input py-2 rounded-md font-medium hover:bg-accent">
        Retry
      </button>
    </div>
  )

  if ((state === 'success' || state === 'duplicate')) return (
    <div className="p-6 flex flex-col items-center text-center w-80">
      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
      <h2 className="font-bold text-lg">{state === 'duplicate' ? 'Already Saved!' : 'Product Saved!'}</h2>
      <p className="text-sm text-muted-foreground mt-2">
        {state === 'duplicate'
            ? "This product is already in your list."
            : "Successfully added to your wishlist."}
      </p>
      <button onClick={openDashboard} className="mt-6 w-full bg-black text-white py-2 rounded-md font-medium flex items-center justify-center">
        <ExternalLink className="h-4 w-4 mr-2" />
        View Dashboard
      </button>
    </div>
  )

  if ((state === 'preview' || state === 'saving') && result) {
    const { product, confidence } = result
    const confidenceColor = confidence > 0.8 ? 'text-green-500' : confidence > 0.5 ? 'text-amber-500' : 'text-red-500'

    return (
      <div className="w-80 flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-4 border-b">
            <h1 className="font-bold text-base line-clamp-2 leading-tight">{product.title}</h1>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    {product.store || 'Unknown Store'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${confidenceColor}`}>
                    {Math.round(confidence * 100)}% Confidence
                </span>
            </div>
        </div>

        <div className="p-4">
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-4 border">
                {product.images?.[0] && (
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                )}
                {product.price && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                        {product.currency} {product.price}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 block">Save to wishlist</label>
                <div className="relative">
                    <select
                        value={selectedWishlistId || ''}
                        onChange={(e) => setSelectedWishlistId(e.target.value)}
                        className="w-full bg-muted border-none rounded-md py-2 px-3 text-sm font-medium appearance-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                        {wishlists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.name} {list.isDefault ? '(Default)' : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <button
                onClick={save}
                disabled={state === 'saving'}
                className="w-full bg-black text-white py-2.5 rounded-lg font-bold flex items-center justify-center hover:bg-black/90 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {state === 'saving' ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Plus className="h-4 w-4 mr-2" />
                        Save to WishHub
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
