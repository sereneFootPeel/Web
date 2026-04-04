import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/** 公元前：无公元 0 年，时间轴连续 */
export const YEAR_BCE_START = -3000
export const YEAR_CE_END = 2100
const PX_PER_YEAR = 1.16
const TRACK_LEFT = 56
const TOP_GUTTER = 28
const BOTTOM_GUTTER = 28

function totalTimelineYears(): number {
  return -YEAR_BCE_START + YEAR_CE_END
}

/** 日历年在时间轴上的纵向偏移（px），y=0 非法 */
export function yearOffsetPx(y: number): number {
  if (y < 0) return (y - YEAR_BCE_START) * PX_PER_YEAR
  return (-YEAR_BCE_START + y - 1) * PX_PER_YEAR
}

function formatYearLabel(y: number): string {
  if (y < 0) return `${-y} BC`
  return String(y)
}

type Tick = { y: number; kind: 'major' | 'mid' | 'minor' }

export type YearRulerProps = {
  className?: string
  /** 当前时间轴年份（由父组件持有） */
  year: number
  onYearChange: (y: number) => void
  onYearSelect?: (y: number) => void
  /** 递增时强制将视口滚动到当前 `year`（用于越界纠偏） */
  scrollSyncNonce?: number
}

export function YearRuler({ className = '', year, onYearChange, onYearSelect, scrollSyncNonce = 0 }: YearRulerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const snapTimerRef = useRef<number | null>(null)
  const onYearChangeRef = useRef(onYearChange)
  onYearChangeRef.current = onYearChange
  const [centerYear, setCenterYear] = useState<number | null>(null)
  const [edgePadding, setEdgePadding] = useState(0)

  const { heightPx, ticks } = useMemo(() => {
    const h = totalTimelineYears() * PX_PER_YEAR
    const list: Tick[] = []
    for (let y = YEAR_BCE_START; y <= YEAR_CE_END; y += 10) {
      if (y === 0) continue
      let kind: Tick['kind'] = 'minor'
      if (y % 100 === 0) kind = 'major'
      else if (y % 50 === 0) kind = 'mid'
      list.push({ y, kind })
    }
    const last = YEAR_CE_END % 10 === 0 ? null : YEAR_CE_END
    if (last != null) list.push({ y: last, kind: 'minor' })
    return { heightPx: h, ticks: list }
  }, [])

  const topBase = TOP_GUTTER + edgePadding

  const labeledTickTops = useMemo(() => {
    return ticks
      .filter((t) => t.kind === 'major')
      .map((t) => ({
        y: t.y,
        top: yearOffsetPx(t.y) + topBase,
      }))
  }, [ticks, topBase])

  const scrollToYear = useCallback(
    (y: number) => {
      const el = scrollerRef.current
      if (!el) return
      const top = yearOffsetPx(y) + topBase
      const rawTarget = top - el.clientHeight / 2
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      const target = Math.min(maxScroll, Math.max(0, rawTarget))
      if (snapTimerRef.current != null) {
        window.clearTimeout(snapTimerRef.current)
        snapTimerRef.current = null
      }
      el.scrollTo({ top: target, behavior: 'smooth' })
    },
    [topBase],
  )

  useLayoutEffect(() => {
    scrollToYear(year)
    // 仅首帧对齐到父级初始年份
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollSyncNonce <= 0) return
    scrollToYear(year)
  }, [scrollSyncNonce, year, scrollToYear])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const updateEdgePadding = () => {
      const visibleHeight = window.innerHeight > 0 ? Math.min(el.clientHeight, window.innerHeight) : el.clientHeight
      const halfViewport = visibleHeight / 2
      setEdgePadding(Math.max(0, Math.round(halfViewport - 18)))
    }

    updateEdgePadding()
    const ro = new ResizeObserver(() => updateEdgePadding())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || labeledTickTops.length === 0) return

    const closestLabeledYear = (centerTop: number) => {
      let closest = labeledTickTops[0]
      let minDist = Math.abs(closest.top - centerTop)
      for (let i = 1; i < labeledTickTops.length; i += 1) {
        const dist = Math.abs(labeledTickTops[i].top - centerTop)
        if (dist < minDist) {
          minDist = dist
          closest = labeledTickTops[i]
        }
      }
      return closest.y
    }

    const updateCenterTick = () => {
      const centerTop = el.scrollTop + el.clientHeight / 2
      setCenterYear(closestLabeledYear(centerTop))
    }

    const snapToCenterTick = () => {
      const centerTop = el.scrollTop + el.clientHeight / 2
      let closest = labeledTickTops[0]
      let minDist = Math.abs(closest.top - centerTop)
      for (let i = 1; i < labeledTickTops.length; i += 1) {
        const dist = Math.abs(labeledTickTops[i].top - centerTop)
        if (dist < minDist) {
          minDist = dist
          closest = labeledTickTops[i]
        }
      }

      const rawTarget = closest.top - el.clientHeight / 2
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      const target = Math.min(maxScroll, Math.max(0, rawTarget))
      if (Math.abs(el.scrollTop - target) > 1) {
        el.scrollTo({ top: target, behavior: 'smooth' })
      }
      onYearChangeRef.current(closest.y)
    }

    const onScroll = () => {
      updateCenterTick()
      if (snapTimerRef.current != null) {
        window.clearTimeout(snapTimerRef.current)
      }
      snapTimerRef.current = window.setTimeout(() => {
        snapToCenterTick()
      }, 72)
    }

    updateCenterTick()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (snapTimerRef.current != null) {
        window.clearTimeout(snapTimerRef.current)
      }
    }
  }, [labeledTickTops])

  return (
    <div
      ref={scrollerRef}
      className={`h-full w-full max-w-[12.5rem] overflow-y-auto overflow-x-hidden bg-transparent overscroll-y-contain touch-pan-y pl-0 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className}`.trim()}
      style={{
        overscrollBehaviorY: 'contain',
      }}
      aria-label="Year timeline"
    >
      <div
        className="relative bg-transparent select-none"
        style={{ height: heightPx + TOP_GUTTER + BOTTOM_GUTTER + edgePadding * 2, minHeight: '100%' }}
      >
        <div
          className="absolute rounded-full bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300"
          style={{
            left: TRACK_LEFT,
            top: topBase,
            width: 1,
            height: heightPx,
          }}
        />
        {ticks.map(({ y, kind }) => {
          const top = yearOffsetPx(y) + topBase
          const isCenterTick = y === centerYear
          const w = kind === 'major' ? 26 : kind === 'mid' ? 16 : 9
          const showLabel = kind === 'major'
          const rowClass =
            'absolute inset-x-0 flex min-h-8 flex-row items-center justify-start bg-transparent py-1 pl-2 pr-3'
          const lineClass = `shrink-0 transition-all duration-100 ${isCenterTick ? 'h-[2px] bg-slate-800' : `h-px ${kind === 'major' ? 'bg-slate-600' : kind === 'mid' ? 'bg-slate-500' : 'bg-slate-400'}`}`
          const labelClass = `ml-2 shrink-0 leading-none tabular-nums whitespace-nowrap transition-all duration-100 ${isCenterTick ? 'text-lg text-slate-800 font-bold' : 'text-sm text-slate-600 font-medium'}`

          if (showLabel) {
            return (
              <button
                key={y}
                type="button"
                className={`${rowClass} cursor-pointer border-0 text-left appearance-none outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 rounded-sm`}
                style={{ top, transform: 'translateY(-50%)' }}
                onClick={() => {
                  scrollToYear(y)
                  onYearChangeRef.current(y)
                  onYearSelect?.(y)
                }}
              >
                <div className="shrink-0" style={{ width: TRACK_LEFT }} />
                <div className={lineClass} style={{ width: w }} />
                <span className={labelClass}>{formatYearLabel(y)}</span>
              </button>
            )
          }

          return (
            <div
              key={y}
              className={`${rowClass} pointer-events-none`}
              style={{ top, transform: 'translateY(-50%)' }}
            >
              <div className="shrink-0" style={{ width: TRACK_LEFT }} />
              <div className={lineClass} style={{ width: w }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
