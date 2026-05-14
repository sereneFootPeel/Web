import { useEffect, useRef } from 'react'

type UseAutoLoadMoreOptions = {
  enabled?: boolean
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void | Promise<unknown>
  rootMargin?: string
  threshold?: number
}

export function useAutoLoadMore({
  enabled = true,
  hasMore,
  loading,
  onLoadMore,
  rootMargin = '0px 0px 320px 0px',
  threshold = 0,
}: UseAutoLoadMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  const triggerLockedRef = useRef(false)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!loading) {
      triggerLockedRef.current = false
    }
  }, [loading])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !enabled || loading || !hasMore) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      triggerLockedRef.current = true
      void Promise.resolve(onLoadMoreRef.current()).finally(() => {
        triggerLockedRef.current = false
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible || triggerLockedRef.current) {
          return
        }

        triggerLockedRef.current = true
        void Promise.resolve(onLoadMoreRef.current()).finally(() => {
          if (!loading) {
            triggerLockedRef.current = false
          }
        })
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, hasMore, loading, rootMargin, threshold])

  return sentinelRef
}
