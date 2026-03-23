import { useEffect, useState } from 'react'
import { philosophyApi, type QuoteItem } from '../api/philosophy'

export function Quotes() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMore = async () => {
    setLoading(true)
    setError(null)
    try {
      const excludeIds = quotes.map((q) => q.id).join(',')
      const next = await philosophyApi.randomQuotes(12, excludeIds || undefined)
      setQuotes((prev) => [...prev, ...next])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMore()
  }, [])

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-red-500">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-lg border"
            style={{
              background: 'var(--bg-tertiary, #f9fafb)',
              borderColor: 'var(--border-primary, #e5e7eb)',
              color: 'var(--text-primary)',
            }}
          >
            <p className="text-lg mb-2">"{q.contentText}"</p>
            <p className="text-sm opacity-75">— {q.philosopherName}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          style={{
            background: 'var(--color-primary, #1e293b)',
            color: 'white',
          }}
        >
          {loading ? '加载中...' : '换一批'}
        </button>
      </div>
    </div>
  )
}
