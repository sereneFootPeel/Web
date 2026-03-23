import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { philosophyApi, type PhilosopherNameItem, type PhilosopherData } from '../api/philosophy'
import { ContentCard } from '../components/ContentCard'

export function Philosophers() {
  const [searchParams, setSearchParams] = useSearchParams()
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
      return res
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

  // 导航到上一个/下一个哲学家（参考 Philosophy Website）
  const navigatePhilosopher = useCallback(
    async (direction: -1 | 1) => {
      const currentId = selected?.id ?? (philosopherId ? parseInt(philosopherId, 10) : null)
      if (!currentId || isNaN(currentId)) return

      let ids = names.map((n) => n.id)
      let currentIndex = ids.indexOf(currentId)
      let nextOffset = offset

      // 若当前哲学家不在已加载列表中，尝试加载更多直到找到
      while (currentIndex === -1 && hasMore && !loadingMore) {
        const res = await loadNames(nextOffset)
        if (!res?.items?.length) break
        ids = [...ids, ...res.items.map((n) => n.id)]
        currentIndex = ids.indexOf(currentId)
        nextOffset += res.items.length
        if (!res.hasMore) break
      }

      if (currentIndex === -1 || ids.length === 0) return

      let targetId: number | null = null
      if (direction < 0) {
        targetId = currentIndex <= 0 ? ids[ids.length - 1] ?? null : ids[currentIndex - 1] ?? null
      } else {
        if (currentIndex < ids.length - 1) {
          targetId = ids[currentIndex + 1] ?? null
        } else if (hasMore && !loadingMore) {
          const res = await loadNames(nextOffset)
          targetId = res?.items?.[0]?.id ?? ids[0] ?? null
        } else {
          targetId = ids[0] ?? null
        }
      }
      if (targetId) setSearchParams({ philosopherId: String(targetId) })
    },
    [selected?.id, philosopherId, names, offset, hasMore, loadingMore, loadNames, setSearchParams],
  )

  useEffect(() => {
    loadNames(0)
  }, [])

  const defaultId = names[0]?.id
  useEffect(() => {
    const id = philosopherId ? parseInt(philosopherId, 10) : defaultId
    if (id && !isNaN(id)) loadPhilosopher(id)
  }, [philosopherId, defaultId])

  const showNavButtons = selected && names.length > 0

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
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

      {/* 右下角固定按钮：上一个/下一个哲学家（参考 Philosophy Website） */}
      {showNavButtons && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 sm:gap-4 z-40">
          <button
            type="button"
            onClick={() => navigatePhilosopher(-1)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            style={{ backgroundColor: 'var(--color-primary)', color: 'black' }}
            title="上一位哲学家"
            aria-label="上一位哲学家"
          >
            <i className="fa fa-chevron-up text-lg sm:text-xl" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigatePhilosopher(1)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            style={{ backgroundColor: 'var(--color-primary)', color: 'black' }}
            title="下一位哲学家"
            aria-label="下一位哲学家"
          >
            <i className="fa fa-chevron-down text-lg sm:text-xl" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
