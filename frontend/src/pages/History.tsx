import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  HistoryCardsPanel,
  type HistoryCardsPanelYearChange,
  type HistoryEventCard,
  type HistoryPhilosophyCard,
} from '../components/HistoryCardsPanel'
import { WorldMap, type WorldMapMarker } from '../components/WorldMap'
import { YearRuler } from '../components/YearRuler'
import { useLanguage } from '../contexts/LanguageContext'
import { normalizeToHistoryCenturyAnchor } from '../utils/historyCentury'

type ApiMarker = {
  regionId?: number
  countryId?: number
  code: string
  nameZh?: string | null
  nameEn?: string | null
  lon: number
  lat: number
}

type PanelContext =
  | { kind: 'region'; regionId: number; title: string }
  | { kind: 'period'; year: number; title: string }

function normalizeRegionYearBounds(min: number, max: number) {
  const normalizedMin = normalizeToHistoryCenturyAnchor(min)
  const normalizedMax = normalizeToHistoryCenturyAnchor(max)
  return normalizedMin <= normalizedMax
    ? { min: normalizedMin, max: normalizedMax }
    : { min: normalizedMax, max: normalizedMin }
}

function historyYearDistance(a: number, b: number) {
  if ((a < 0 && b < 0) || (a > 0 && b > 0)) {
    return Math.abs(a - b)
  }
  return Math.abs(a) + Math.abs(b) - 1
}

function formatBucketTitle(year: number) {
  if (year > 0) {
    const start = year - 99
    return `${start}–${year}`
  }
  const end = year + 99
  return `${Math.abs(year)}–${Math.abs(end)} BC`
}

export function History() {
  const { language, t } = useLanguage()
  const [year, setYear] = useState(() => normalizeToHistoryCenturyAnchor(1950))
  const [debouncedYear, setDebouncedYear] = useState(() => normalizeToHistoryCenturyAnchor(1950))
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedYear(year), 300)
    return () => clearTimeout(timer)
  }, [year])

  const [scrollSyncNonce, setScrollSyncNonce] = useState(0)
  const [cardsScrollSyncNonce, setCardsScrollSyncNonce] = useState(0)

  const [rawMarkers, setRawMarkers] = useState<ApiMarker[]>([])
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [panelContext, setPanelContext] = useState<PanelContext | null>(null)
  const [panelTitle, setPanelTitle] = useState('')
  const [regionBounds, setRegionBounds] = useState<{ min: number; max: number } | null>(null)

  const [events, setEvents] = useState<HistoryEventCard[]>([])
  const [philosophyCards, setPhilosophyCards] = useState<HistoryPhilosophyCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)

  const bumpScrollSync = useCallback(() => {
    setScrollSyncNonce((n) => n + 1)
  }, [])

  const bumpCardsScrollSync = useCallback(() => {
    setCardsScrollSyncNonce((n) => n + 1)
  }, [])

  const mapMarkers: WorldMapMarker[] = useMemo(
    () =>
      rawMarkers.map((marker) => ({
        regionId: marker.regionId ?? marker.countryId ?? 0,
        lon: marker.lon,
        lat: marker.lat,
        label:
          language === 'en'
            ? marker.nameEn || marker.nameZh || marker.code
            : marker.nameZh || marker.nameEn || marker.code,
      })),
    [rawMarkers, language],
  )

  // Get visible markers for current year
  useEffect(() => {
    const ctrl = new AbortController()
    setSnapshotLoading(true)
    const params = new URLSearchParams({ year: String(debouncedYear) })
    if (selectedRegionId != null) {
      params.set('activeRegionId', String(selectedRegionId))
    }

    fetch(`/api/history/snapshot?${params.toString()}`, {
      signal: ctrl.signal,
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        const list = (data.markers || []) as ApiMarker[]
        setRawMarkers(list)
        if (selectedRegionId != null) {
          // 当前年份段无事件时，不再强行保留旧 marker
        }
        setSnapshotError(null)
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return
        setRawMarkers([])
        setSnapshotError(t('历史数据加载失败', 'Failed to load history data'))
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setSnapshotLoading(false)
      })
    return () => ctrl.abort()
  }, [t, debouncedYear, selectedRegionId])

  useEffect(() => {
    if (selectedRegionId == null) {
      setRegionBounds(null)
      return
    }
    fetch(`/api/history/region/${selectedRegionId}/years`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        const min = data.minYear
        const max = data.maxYear
        if (typeof min === 'number' && typeof max === 'number') {
          setRegionBounds(normalizeRegionYearBounds(min, max))
        } else {
          setRegionBounds(null)
        }
      })
      .catch(() => setRegionBounds(null))
  }, [selectedRegionId])

  useEffect(() => {
    if (!regionBounds || selectedRegionId == null) return
    setYear((current) => {
      const clamped = Math.min(regionBounds.max, Math.max(regionBounds.min, current))
      if (clamped !== current) {
        requestAnimationFrame(() => {
          bumpScrollSync()
          bumpCardsScrollSync()
        })
      }
      return clamped
    })
  }, [regionBounds, selectedRegionId, bumpScrollSync, bumpCardsScrollSync])

  const resolveHistoryYear = useCallback(
    (y: number) => {
      let next = normalizeToHistoryCenturyAnchor(y)
      if (selectedRegionId != null && regionBounds) {
        if (next < regionBounds.min) next = regionBounds.min
        if (next > regionBounds.max) next = regionBounds.max
      }
      return next
    },
    [selectedRegionId, regionBounds],
  )

  const handleYearChange = useCallback(
    (y: number) => {
      const next = resolveHistoryYear(y)
      requestAnimationFrame(() => bumpCardsScrollSync())
      if (next !== y) {
        requestAnimationFrame(() => bumpScrollSync())
      }
      setYear(next)
    },
    [resolveHistoryYear, bumpScrollSync, bumpCardsScrollSync],
  )

  const handleYearSelect = useCallback(
    (y: number) => {
      const next = normalizeToHistoryCenturyAnchor(y)
      setPanelContext({
        kind: 'period',
        year: next,
        title: formatBucketTitle(next),
      })
      setPanelTitle(formatBucketTitle(next))
      setSelectedRegionId(null)
      setRegionBounds(null)
    },
    [],
  )

  const handleCardsYearChange = useCallback(
    ({ rawYear, anchorYear }: HistoryCardsPanelYearChange) => {
      setYear((current) => {
        const next = resolveHistoryYear(anchorYear)
        if (current === next) return current
        if (historyYearDistance(rawYear, current) <= 100) {
          return current
        }
        requestAnimationFrame(() => bumpScrollSync())
        return next
      })
    },
    [resolveHistoryYear, bumpScrollSync],
  )

  // Fetch cards data when panel context changes
  useEffect(() => {
    if (panelContext == null) {
      setEvents([])
      setPhilosophyCards([])
      setCardsError(null)
      setCardsLoading(false)
      return
    }

    const ctrl = new AbortController()
    setCardsLoading(true)
    setCardsError(null)

    const url =
      panelContext.kind === 'region'
        ? `/api/history/region/${panelContext.regionId}/cards`
        : `/api/history/period/cards?year=${panelContext.year}`

    fetch(url, {
      signal: ctrl.signal,
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        setEvents((data.events || []) as HistoryEventCard[])
        setPhilosophyCards((data.philosophyCards || []) as HistoryPhilosophyCard[])
        if (panelContext.kind === 'period') {
          const bucketStart = data.bucketStart
          const bucketEnd = data.bucketEnd
          if (typeof bucketStart === 'number' && typeof bucketEnd === 'number') {
            setPanelTitle(
              bucketStart > 0
                ? `${bucketStart}–${bucketEnd}`
                : `${Math.abs(bucketStart)}–${Math.abs(bucketEnd)} BC`,
            )
          } else {
            setPanelTitle(panelContext.title)
          }
        } else {
          setPanelTitle(panelContext.title)
        }
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return
        setCardsError(t('卡片加载失败', 'Failed to load cards'))
        setEvents([])
        setPhilosophyCards([])
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCardsLoading(false)
      })

    return () => ctrl.abort()
  }, [panelContext, t])

  const onMarkerClick = useCallback(
    (regionId: number) => {
      if (regionId <= 0) return
      setSelectedRegionId(regionId)
      const markerLabel = mapMarkers.find((marker) => marker.regionId === regionId)?.label || ''
      setPanelContext({ kind: 'region', regionId, title: markerLabel })
      setPanelTitle(markerLabel)
    },
    [mapMarkers, rawMarkers],
  )

  const closePanel = useCallback(() => {
    setPanelContext(null)
    setSelectedRegionId(null)
    setPanelTitle('')
    setRegionBounds(null)
    setCardsError(null)
  }, [])

  useEffect(() => {
    if (panelContext == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelContext, closePanel])

  useEffect(() => {
    if (panelContext == null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [panelContext])

  return (
    <div
      className="relative flex flex-1 min-h-0 w-full flex-col overflow-hidden"
      style={{
        position: 'relative',
        flex: 1,
        height: '100%',
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        className="absolute inset-0 z-0 flex min-h-0 flex-col overflow-hidden"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <WorldMap
          markers={mapMarkers}
          selectedRegionId={selectedRegionId}
          onMarkerClick={onMarkerClick}
        />
      </div>
      {snapshotError ? (
        <div
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs shadow"
          style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
          role="status"
        >
          {snapshotError}
        </div>
      ) : null}
      {!snapshotLoading && !snapshotError && rawMarkers.length === 0 ? (
        <div
          className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md px-3 py-2 text-center text-xs shadow"
          style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
          role="status"
        >
          {t(
            '当前时间段暂无历史数据，请先确认服务器数据库中的 history_country / history_event 已完成种子数据导入。',
            'No history data is available for the current timeline range. Verify that history_country / history_event seed data has been imported on the server.',
          )}
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-stretch"
        style={{
          position: 'absolute',
          inset: '0 auto 0 0',
          zIndex: 20,
          display: 'flex',
          alignItems: 'stretch',
          pointerEvents: 'none',
        }}
      >
        <aside
          className="pointer-events-auto my-3 ml-3 flex min-h-0 items-stretch overflow-hidden"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            height: 'calc(100% - 1.5rem)',
            minHeight: 0,
            width: 'min(12.5rem, calc(100vw - 1.5rem))',
            maxWidth: '42vw',
            alignItems: 'stretch',
          }}
        >
          <YearRuler
            year={year}
            onYearChange={handleYearChange}
            onYearSelect={handleYearSelect}
            scrollSyncNonce={scrollSyncNonce}
          />
        </aside>
      </div>
      {panelContext != null ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-3 py-0 sm:px-4 sm:py-0"
          role="dialog"
          aria-modal="true"
          aria-label={panelTitle || t('地区详情', 'Region')}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default border-0 bg-black/45 p-0"
            style={{ margin: 0 }}
            aria-label={t('关闭浮层', 'Close overlay')}
            onClick={closePanel}
          />
          <div className="relative z-10 flex min-h-0 max-h-full w-full max-w-[56rem] shrink-0 flex-col items-center justify-center overflow-visible">
            <HistoryCardsPanel
              open
              overlay
              title={panelTitle || t('地区详情', 'Region')}
              loading={cardsLoading}
              error={cardsError}
              events={events}
              philosophyCards={philosophyCards}
              activeYear={year}
              scrollToYearNonce={cardsScrollSyncNonce}
              onYearChange={handleCardsYearChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
