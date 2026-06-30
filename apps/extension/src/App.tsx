import React, { useEffect, useState } from 'react'
import { WishHubSDK } from '@wishhub/sdk'
import { type ExtractionResult } from '@wishhub/scraper'

const sdk = new WishHubSDK(import.meta.env.VITE_API_URL || 'http://localhost:3000')

type State = 'idle' | 'extracting' | 'preview' | 'saving' | 'saved' | 'error'

function App() {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    extract()
  }, [])

  const extract = async () => {
    setState('extracting')
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error('No active tab')

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PRODUCT' })
      if (!response) throw new Error('Extraction failed')

      setResult(response)
      setState('preview')
    } catch (err: any) {
      setError(err.message)
      setState('error')
    }
  }

  const save = async () => {
    if (!result) return
    setState('saving')
    try {
      await sdk.products.save(result.product)
      setState('saved')
    } catch (err: any) {
      setError(err.message)
      setState('error')
    }
  }

  if (state === 'extracting') return <div className="p-4">Extracting product details...</div>

  if (state === 'error') return (
    <div className="p-4">
      <h2 className="text-red-500 font-bold">Error</h2>
      <p>{error}</p>
      <button onClick={extract} className="mt-2">Retry</button>
    </div>
  )

  if (state === 'saved') return (
    <div className="p-4 text-center">
      <h2 className="text-green-500 font-bold mb-2">Saved!</h2>
      <a href={`${sdk.products['baseUrl']}/dashboard`} target="_blank" className="text-blue-500 underline">
        View in Dashboard
      </a>
    </div>
  )

  if (state === 'preview' && result) {
    return (
      <div className="p-4 w-72">
        <h1 className="font-bold text-lg mb-2 line-clamp-2">{result.product.name}</h1>
        {result.product.imageUrl && (
          <img src={result.product.imageUrl} className="w-full aspect-square object-cover rounded mb-4" />
        )}
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">{result.product.storeName}</span>
          {result.product.price && (
            <span className="font-bold">{result.product.currency} {result.product.price}</span>
          )}
        </div>
        <button
          onClick={save}
          disabled={state === 'saving'}
          className="w-full bg-black text-white py-2 rounded font-bold"
        >
          {state === 'saving' ? 'Saving...' : 'Save to WishHub'}
        </button>
      </div>
    )
  }

  return <div className="p-4">Initializing WishHub...</div>
}

export default App
