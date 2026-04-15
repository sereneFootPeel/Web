import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { geoEqualEarth, geoPath, type GeoProjection } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection } from 'geojson'
import { useLanguage } from '../contexts/LanguageContext'

const WORLD_TOPO_URL = `${import.meta.env.BASE_URL}maps/countries-110m.json`

const MAP_W = 960
const MAP_H = 480
const MARKER_SCALE = 2 / 3

/** 不依赖外网拓扑即可得到与历史钉点一致的投影。 */
function createWorldProjection(): GeoProjection {
  /* d3 接受 GeoJSON Sphere；标准 GeoJSON 类型未收录 */
  return geoEqualEarth().fitExtent(
    [
      [4, 4],
      [MAP_W - 4, MAP_H - 4],
    ],
    { type: 'Sphere' } as Parameters<ReturnType<typeof geoEqualEarth>['fitExtent']>[1],
  )
}

export type WorldMapMarker = {
  regionId: number
  lon: number
  lat: number
  label?: string | null
}

type WorldMapProps = {
  markers?: WorldMapMarker[]
  selectedRegionId?: number | null
  onMarkerClick?: (regionId: number) => void
}

function markerLonLat(m: WorldMapMarker): [number, number] | null {
  const lon = Number(m.lon)
  const lat = Number(m.lat)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null
  return [lon, lat]
}

function projectToPixel(
  proj: GeoProjection,
  lon: number,
  lat: number,
): [number, number] | null {
  const ll: [number, number] = [lon, lat]
  let raw: unknown
  try {
    raw = proj(ll)
  } catch {
    return null
  }
  if (raw == null || !Array.isArray(raw) || raw.length < 2) return null
  const x = Number(raw[0])
  const y = Number(raw[1])
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return [x, y]
}

export function WorldMap({
  markers = [],
  selectedRegionId = null,
  onMarkerClick,
}: WorldMapProps) {
  const { t } = useLanguage()
  const safeMarkers = Array.isArray(markers) ? markers : []
  const projection = useMemo(() => createWorldProjection(), [])
  const [paths, setPaths] = useState<string[]>([])
  const [outlineFailed, setOutlineFailed] = useState(false)
  const [outlineLoading, setOutlineLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setOutlineLoading(true)
    setOutlineFailed(false)
    ;(async () => {
      try {
        const res = await fetch(WORLD_TOPO_URL)
        if (!res.ok) {
          if (!cancelled) {
            setPaths([])
            setOutlineFailed(true)
          }
          return
        }
        const raw = (await res.json()) as Parameters<typeof feature>[0]
        const geojson = feature(
          raw,
          raw.objects.countries as Parameters<typeof feature>[1],
        ) as unknown as FeatureCollection
        const pathGen = geoPath(projection)
        const next: string[] = []
        for (const f of geojson.features) {
          try {
            const d = pathGen(f as Feature)
            if (d) next.push(d)
          } catch {
            /* 跳过拓扑/坐标异常的要素 */
          }
        }
        if (!cancelled) {
          setPaths(next)
          setOutlineFailed(false)
        }
      } catch {
        if (!cancelled) {
          setPaths([])
          setOutlineFailed(true)
        }
      } finally {
        if (!cancelled) setOutlineLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [projection])

  const projectedMarkers = useMemo(() => {
    return safeMarkers
      .map((m) => {
        const ll = markerLonLat(m)
        if (!ll) return null
        const p = projectToPixel(projection, ll[0], ll[1])
        if (!p) return null
        return { ...m, x: p[0], y: p[1] }
      })
      .filter((x): x is WorldMapMarker & { x: number; y: number } => x != null)
  }, [safeMarkers, projection])

  const shell = (body: ReactNode) => (
    <div
      className="flex flex-1 flex-col min-h-0 h-full w-full"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        width: '100%',
      }}
    >
      {body}
    </div>
  )

  return shell(
    <div className="relative flex flex-1 min-h-0 flex-col">
      {outlineFailed ? (
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded px-2 py-1 text-xs shadow-sm"
          style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-primary)',
          }}
          role="status"
        >
          {t('地图轮廓加载失败', 'Map outline failed')}
        </div>
      ) : null}
      {outlineLoading && !outlineFailed ? (
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded px-2 py-1 text-xs opacity-80"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {t('地图轮廓加载中…', 'Loading map outline…')}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full min-h-0 flex-1 block"
        style={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          flex: 1,
          display: 'block',
        }}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={t('世界地图', 'World map')}
      >
        <rect
          x={0}
          y={0}
          width={MAP_W}
          height={MAP_H}
          fill="var(--bg-secondary)"
        />
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="var(--bg-quaternary)"
            stroke="var(--text-tertiary)"
            strokeOpacity={0.35}
            strokeWidth={0.35}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <g aria-label={t('历史地区标记', 'History region markers')}>
          {projectedMarkers.map((m) => {
            const selected = selectedRegionId != null && m.regionId === selectedRegionId
            return (
              <g key={m.regionId} transform={`translate(${m.x},${m.y})`}>
                <circle
                  r={19 * MARKER_SCALE}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => onMarkerClick?.(m.regionId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onMarkerClick?.(m.regionId)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={m.label || t('地区向导标', 'Region marker')}
                />
                <g transform={`scale(${MARKER_SCALE})`} className="pointer-events-none">
                  <path
                    d="M0,8.2 C-7,-2 -10,-5.9 -10,-10 A 10 10 0 1 1 10,-10 C10,-5.9 7,-2 0,8.2 Z"
                    fill={selected ? '#1f1f1f' : '#9a9a9a'}
                    stroke={selected ? '#000000' : '#f3f4f6'}
                    strokeWidth={selected ? 1.7 : 1.4}
                  />
                  <circle
                    cx="0"
                    cy="-10"
                    r="3.4"
                    fill={selected ? '#fafafa' : '#ffffff'}
                  />
                </g>
              </g>
            )
          })}
        </g>
      </svg>
    </div>,
  )
}
