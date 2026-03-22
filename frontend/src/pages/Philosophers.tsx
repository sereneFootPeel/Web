import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { philosophyApi, type PhilosopherNameItem, type PhilosopherData } from '../api/philosophy'
import { ContentCard } from '../components/ContentCard'

export function Philosophers() {
  const [searchParams] = useSearchParams()
  const philosopherId = searchParams.get('philosopherId')
  const [names, setNames] = useState<PhilosopherNameItem[]>([])
  const [selected, setSelected] = useState<PhilosopherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const loadNames = useCallback(async (off = 0) => {
    if (off > 0) setLoadingMore(true)
    try {
      const res = await philosophyApi.philosopherNames(off, 30)
      setNames((prev) => (off === 0 ? res.items : [...prev, ...res.items]))
      setHasMore(res.hasMore)
      setOffset(off + res.items.length)
    } finally {
      setLoadingMore(false)
    }
  }, [])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el || !hasMore || loadingMore) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadNames(offset)
    }
  }, [hasMore, loadingMore, offset, loadNames])

  const loadPhilosopher = async (id: number) => {
    setLoading(true)
    try {
      const res = await philosophyApi.philosopher(id)
      setSelected(res.philosopher)
    } catch {
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNames(0)
  }, [])

  const defaultId = names[0]?.id
  useEffect(() => {
    const id = philosopherId ? parseInt(philosopherId, 10) : defaultId
    if (id && !isNaN(id)) loadPhilosopher(id)
  }, [philosopherId, defaultId])

  return (
    <div className="flex gap-6">
      <aside className="w-48 flex-shrink-0 flex flex-col">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: 'calc(100vh - 10rem)' }}
        >
          {names.map((n) => (
            <button
              key={n.id}
              onClick={() => loadPhilosopher(n.id)}
              className={`block w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${selected?.id === n.id ? 'font-bold' : ''}`}
              style={{
                color: selected?.id === n.id ? '#111827' : 'var(--text-secondary)',
              }}
            >
              {n.displayName}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {loading ? (
          <p>加载中...</p>
        ) : selected ? (
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {selected.displayName}
            </h1>
            <p className="text-sm opacity-75 mb-4">{selected.dateRange}</p>
            <p className="mb-6 whitespace-pre-wrap">{selected.displayBiography}</p>
            <div className="space-y-4">
              {selected.contents.map((c) => (
                <ContentCard
                  key={c.id}
                  item={{
                    id: c.id,
                    title: c.title,
                    content: c.content,
                    likeCount: c.likeCount,
                    school: c.school
                      ? { id: c.school.id, displayName: c.school.displayName }
                      : null,
                    philosopher: {
                      id: selected.id,
                      displayName: selected.displayName,
                      dateRange: selected.dateRange,
                    },
                  }}
                  showSchool={true}
                  showLikeButton={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>请选择一位哲学家</p>
        )}
      </div>
    </div>
  )
}
