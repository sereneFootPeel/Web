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
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const mobileListRef = useRef<HTMLDivElement>(null)

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

  const handleMobileListScroll = useCallback(() => {
    const el = mobileListRef.current
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

  const selectPhilosopher = (id: number) => {
    loadPhilosopher(id)
    setMobileListOpen(false)
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
    <div className="flex flex-col md:flex-row gap-6">
      {/* 移动端：点击展开的目录 */}
      <div className="md:hidden w-full">
        <button
          type="button"
          onClick={() => setMobileListOpen(!mobileListOpen)}
          className="w-full px-4 py-3 text-base border rounded-lg bg-white flex items-center justify-between gap-2 min-h-[44px] touch-manipulation transition-colors"
          style={{
            borderColor: 'var(--border-primary)',
            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <span className="truncate">
            {selected ? selected.displayName : '选择哲学家'}
          </span>
          <i
            className={`fa fa-chevron-${mobileListOpen ? 'up' : 'down'} text-sm flex-shrink-0`}
            aria-hidden="true"
          />
        </button>
        {mobileListOpen && (
          <div
            ref={mobileListRef}
            onScroll={handleMobileListScroll}
            className="mt-2 space-y-1 overflow-y-auto rounded-lg border p-2 max-h-[50vh]"
            style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}
          >
            {names.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => selectPhilosopher(n.id)}
                className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation ${selected?.id === n.id ? 'font-bold' : ''}`}
                style={{
                  color: selected?.id === n.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: selected?.id === n.id ? 'var(--color-primary-dark)' : 'transparent',
                }}
              >
                {n.displayName}
              </button>
            ))}
            {loadingMore && (
              <p className="py-2 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                加载中…
              </p>
            )}
          </div>
        )}
      </div>

      {/* 桌面端：左侧哲学家列表 */}
      <aside className="hidden md:flex w-48 flex-shrink-0 flex-col">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: 'calc(100vh - 10rem)' }}
        >
          {names.map((n) => (
            <button
              key={n.id}
              type="button"
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
