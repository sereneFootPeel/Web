import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { normalizeToHistoryCenturyAnchor } from '../utils/historyCentury'
import { ContentCard, type ContentCardData } from './ContentCard'

export type HistoryEventCard = {
  id: number
  summary?: string | null
  summaryZh?: string | null
  summaryEn?: string | null
  startYear: number
  sortDate?: number
  dateLabel?: string | null
}

export type HistoryPhilosophyCard = ContentCardData & {
  sortDate?: number
  dateLabel?: string | null
  historyPinned?: boolean
}

export type HistoryCardsPanelYearChange = {
  rawYear: number
  anchorYear: number
}

type TimelineItem =
  | ({ kind: 'event'; key: string } & HistoryEventCard)
  | ({ kind: 'philosophy'; key: string } & HistoryPhilosophyCard)

type HistoryCardsPanelProps = {
  open: boolean
  title: string
  loading: boolean
  error: string | null
  events: HistoryEventCard[]
  philosophyCards: HistoryPhilosophyCard[]
  activeYear?: number
  scrollToYearNonce?: number
  onYearChange?: (payload: HistoryCardsPanelYearChange) => void
  overlay?: boolean
}

function formatDisplayYear(year: number) {
  return year < 0 ? `${-year} BC` : String(year)
}

function extractTimelineYear(year: number) {
  return Math.abs(year) >= 10000 ? Math.trunc(year / 10000) : year
}

function historyYearDistance(a: number, b: number) {
  if ((a < 0 && b < 0) || (a > 0 && b > 0)) {
    return Math.abs(a - b)
  }
  return Math.abs(a) + Math.abs(b) - 1
}

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('a, button, input, textarea, select, label, summary, [role="button"]'))
}

export function HistoryCardsPanel({
  open,
  title,
  loading,
  error,
  events,
  philosophyCards,
  activeYear,
  scrollToYearNonce = 0,
  onYearChange,
  overlay = false,
}: HistoryCardsPanelProps) {
  const { language, t } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const hasUserScrolledRef = useRef(false)
  const lastScrollTopRef = useRef(0)
  const lastReportedYearRef = useRef<number | null>(null)
  const snapTimerRef = useRef<number | null>(null)
  const programmaticScrollTimerRef = useRef<number | null>(null)
  const isProgrammaticScrollRef = useRef(false)
  const [bottomSpacerHeight, setBottomSpacerHeight] = useState(0)

  const timelineItems: TimelineItem[] = useMemo(
    () =>
      [
        ...events.map((event) => ({
          ...event,
          kind: 'event' as const,
          key: `event-${event.id}`,
        })),
        ...philosophyCards.map((card) => ({
          ...card,
          kind: 'philosophy' as const,
          key: `content-${card.id}`,
        })),
      ].sort((a, b) => {
        const av = a.sortDate ?? (a.kind === 'event' ? a.startYear : Number.MAX_SAFE_INTEGER)
        const bv = b.sortDate ?? (b.kind === 'event' ? b.startYear : Number.MAX_SAFE_INTEGER)
        if (av !== bv) return av - bv
        if (a.kind !== b.kind) return a.kind === 'event' ? -1 : 1
        return a.id - b.id
      }),
    [events, philosophyCards],
  )

  const findTopPinnedItem = useCallback(() => {
    if (!listRef.current || !scrollerRef.current) return null

    const scroller = scrollerRef.current
    const scrollerRect = scroller.getBoundingClientRect()
    const paddingTop = Number.parseFloat(window.getComputedStyle(scroller).paddingTop || '0') || 0
    const pinTop = scrollerRect.top + paddingTop + 1
    const items = Array.from(listRef.current.querySelectorAll<HTMLElement>('.timeline-item'))

    for (const item of items) {
      const rect = item.getBoundingClientRect()
      if (rect.bottom > pinTop) {
        return item
      }
    }

    return items[items.length - 1] ?? null
  }, [])

  const reportTopPinnedEventYear = useCallback(() => {
    if (!onYearChange) return

    const topItem = findTopPinnedItem()
    if (!topItem) return
    if (topItem.getAttribute('data-kind') !== 'event') return

    const rawYear = Number.parseInt(topItem.getAttribute('data-raw-year') || '', 10)
    const anchorYear = Number.parseInt(topItem.getAttribute('data-anchor-year') || '', 10)
    if (Number.isNaN(rawYear) || Number.isNaN(anchorYear)) return

    if (!hasUserScrolledRef.current) {
      lastReportedYearRef.current = anchorYear
      return
    }
    if (lastReportedYearRef.current === anchorYear) return

    lastReportedYearRef.current = anchorYear
    onYearChange({ rawYear, anchorYear })
  }, [findTopPinnedItem, onYearChange])

  const finishProgrammaticScroll = useCallback(
    (reportAfterScroll: boolean) => {
      if (programmaticScrollTimerRef.current != null) {
        window.clearTimeout(programmaticScrollTimerRef.current)
        programmaticScrollTimerRef.current = null
      }
      isProgrammaticScrollRef.current = false
      lastScrollTopRef.current = scrollerRef.current?.scrollTop ?? lastScrollTopRef.current
      if (reportAfterScroll) {
        reportTopPinnedEventYear()
      }
    },
    [reportTopPinnedEventYear],
  )

  const scrollItemToTop = useCallback(
    (
      item: HTMLElement,
      options: { smooth?: boolean; markUserScroll?: boolean; reportAfterScroll?: boolean } = {},
    ) => {
      const scroller = scrollerRef.current
      if (!scroller) return

      const paddingTop = Number.parseFloat(window.getComputedStyle(scroller).paddingTop || '0') || 0
      const targetTop = Math.max(0, item.offsetTop - paddingTop)

      if (Math.abs(scroller.scrollTop - targetTop) <= 1) {
        lastScrollTopRef.current = scroller.scrollTop
        if (options.reportAfterScroll) {
          reportTopPinnedEventYear()
        }
        return
      }

      if (snapTimerRef.current != null) {
        window.clearTimeout(snapTimerRef.current)
        snapTimerRef.current = null
      }
      if (programmaticScrollTimerRef.current != null) {
        window.clearTimeout(programmaticScrollTimerRef.current)
      }

      isProgrammaticScrollRef.current = true
      hasUserScrolledRef.current = options.markUserScroll ?? false
      scroller.scrollTo({ top: targetTop, behavior: options.smooth === false ? 'auto' : 'smooth' })
      programmaticScrollTimerRef.current = window.setTimeout(() => {
        finishProgrammaticScroll(options.reportAfterScroll ?? false)
      }, 220)
    },
    [finishProgrammaticScroll, reportTopPinnedEventYear],
  )

  const snapToTopItem = useCallback(
    (options: { smooth?: boolean; reportAfterScroll?: boolean } = {}) => {
      const closestItem = findTopPinnedItem()
      if (!closestItem) return

      scrollItemToTop(closestItem, {
        smooth: options.smooth,
        markUserScroll: true,
        reportAfterScroll: options.reportAfterScroll,
      })
    },
    [findTopPinnedItem, scrollItemToTop],
  )

  useEffect(() => {
    hasUserScrolledRef.current = false
    lastScrollTopRef.current = scrollerRef.current?.scrollTop ?? 0
    lastReportedYearRef.current = null
  }, [timelineItems])

  useEffect(() => {
    return () => {
      if (snapTimerRef.current != null) {
        window.clearTimeout(snapTimerRef.current)
      }
      if (programmaticScrollTimerRef.current != null) {
        window.clearTimeout(programmaticScrollTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const updateBottomSpacer = () => {
      const styles = window.getComputedStyle(scroller)
      const paddingTop = Number.parseFloat(styles.paddingTop || '0') || 0
      const paddingBottom = Number.parseFloat(styles.paddingBottom || '0') || 0
      const visibleContentHeight = Math.max(0, scroller.clientHeight - paddingTop - paddingBottom)
      const lastItem = listRef.current?.querySelector<HTMLElement>('.timeline-item:last-of-type') ?? null
      const lastItemHeight = lastItem?.offsetHeight ?? 0
      setBottomSpacerHeight(Math.max(0, Math.round(visibleContentHeight - lastItemHeight)))
    }

    updateBottomSpacer()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateBottomSpacer)
      return () => {
        window.removeEventListener('resize', updateBottomSpacer)
      }
    }
    const resizeObserver = new ResizeObserver(() => updateBottomSpacer())
    resizeObserver.observe(scroller)
    if (listRef.current) {
      resizeObserver.observe(listRef.current)
    }
    window.addEventListener('resize', updateBottomSpacer)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateBottomSpacer)
    }
  }, [timelineItems])

  useEffect(() => {
    reportTopPinnedEventYear()
  }, [timelineItems, reportTopPinnedEventYear])

  useEffect(() => {
    if (
      activeYear == null ||
      !listRef.current ||
      !scrollerRef.current ||
      loading ||
      error ||
      timelineItems.length === 0
    ) {
      return
    }

    const eventItems = Array.from(
      listRef.current.querySelectorAll<HTMLElement>('.timeline-item[data-kind="event"]'),
    )
    if (eventItems.length === 0) return

    let closestItem: HTMLElement | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    eventItems.forEach((item) => {
      const rawYear = Number.parseInt(item.getAttribute('data-raw-year') || '', 10)
      if (Number.isNaN(rawYear)) return
      const distance = historyYearDistance(rawYear, activeYear)
      if (distance < closestDistance) {
        closestDistance = distance
        closestItem = item
      }
    })

    if (!closestItem) return
    scrollItemToTop(closestItem, { smooth: true, markUserScroll: false, reportAfterScroll: false })
  }, [activeYear, scrollToYearNonce, loading, error, timelineItems, scrollItemToTop])

  if (!open) return null

  const shellClass = overlay
    ? 'flex h-[min(96dvh,calc(100vh-0.5rem))] max-h-[min(96dvh,calc(100vh-0.5rem))] min-h-0 w-full max-w-[54rem] min-w-0 flex-col overflow-visible'
    : 'flex h-full min-h-0 w-full max-w-[54rem] min-w-0 flex-col justify-stretch'

  const handleTimelineScroll = () => {
    const scroller = scrollerRef.current
    if (!scroller) return

    if (isProgrammaticScrollRef.current) {
      lastScrollTopRef.current = scroller.scrollTop
      return
    }

    if (Math.abs(scroller.scrollTop - lastScrollTopRef.current) > 1) {
      hasUserScrolledRef.current = true
      lastScrollTopRef.current = scroller.scrollTop
    }
    reportTopPinnedEventYear()

    if (snapTimerRef.current != null) {
      window.clearTimeout(snapTimerRef.current)
    }
    snapTimerRef.current = window.setTimeout(() => {
      snapToTopItem({ smooth: true, reportAfterScroll: true })
    }, 90)
  }

  return (
    <div className={shellClass} aria-live="polite" aria-label={title || t('地区详情', 'Region details')}>
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-contain px-2 py-2 sm:px-3 sm:py-2.5"
        onScroll={handleTimelineScroll}
      >
        {loading ? (
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('加载中…', 'Loading…')}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          </div>
        ) : null}

        {!loading && !error ? (
          timelineItems.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-4 py-10">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('暂无时间线条目', 'No timeline items')}
              </p>
            </div>
          ) : (
            <>
              <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4" ref={listRef}>
              {timelineItems.map((item) => {
                const itemYear = item.sortDate ?? (item.kind === 'event' ? item.startYear : 0)
                const timelineYear = extractTimelineYear(itemYear)

                if (item.kind === 'philosophy') {
                  return (
                    <li
                      key={item.key}
                      data-kind="philosophy"
                      className="timeline-item"
                      onClick={(event) => {
                        if (isInteractiveElement(event.target)) return
                        scrollItemToTop(event.currentTarget, {
                          smooth: true,
                          markUserScroll: true,
                          reportAfterScroll: true,
                        })
                      }}
                    >
                      <div className="w-full">
                        <ContentCard item={item} showLikeButton={false} showSchool={true} t={t} />
                      </div>
                    </li>
                  )
                }

                const localizedSummary =
                  language === 'en'
                    ? item.summaryEn || item.summaryZh || item.summary
                    : item.summaryZh || item.summaryEn || item.summary

                return (
                  <li
                    key={item.key}
                    data-kind="event"
                    data-raw-year={timelineYear}
                    data-anchor-year={normalizeToHistoryCenturyAnchor(timelineYear)}
                    className="timeline-item"
                    onClick={(event) => {
                      if (isInteractiveElement(event.target)) return
                      scrollItemToTop(event.currentTarget, {
                        smooth: true,
                        markUserScroll: true,
                        reportAfterScroll: true,
                      })
                    }}
                  >
                    <article
                      className="group relative w-full rounded-lg border p-4 transition-all duration-300 hover:shadow-md"
                      style={{
                        borderColor: 'var(--border-primary)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {item.dateLabel || formatDisplayYear(item.startYear)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {localizedSummary || t('暂无内容', 'No content yet')}
                      </p>
                    </article>
                  </li>
                )
              })}
              </ul>
              <div
                aria-hidden="true"
                className="pointer-events-none"
                style={{ height: bottomSpacerHeight, minHeight: bottomSpacerHeight }}
              />
            </>
          )
        ) : null}
      </div>
    </div>
  )
}
