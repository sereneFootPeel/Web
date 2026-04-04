import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  philosophyApi,
  type SearchCategory,
  type SearchContentItem,
  type SearchPhilosopherItem,
  type SearchSchoolItem,
} from '../api/philosophy'
import { ContentCard } from '../components/ContentCard'
import { PhilosopherCard } from '../components/PhilosopherCard'
import { useLanguage } from '../contexts/LanguageContext'

type SearchResult = {
  philosophers: SearchPhilosopherItem[]
  schools: SearchSchoolItem[]
  contents: SearchContentItem[]
}

type SearchTotals = Record<SearchCategory, number>
type SearchLoadingMap = Record<SearchCategory, boolean>

const SEARCH_PAGE_SIZE = 5
const EMPTY_TOTALS: SearchTotals = { philosophers: 0, schools: 0, contents: 0 }
const EMPTY_LOADING_MORE: SearchLoadingMap = { philosophers: false, schools: false, contents: false }

function mergeById<T extends { id: number }>(current: T[], incoming: T[]) {
  const seen = new Set(current.map((item) => item.id))
  const merged = [...current]
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }
  return merged
}

/** 可折叠分类区块，复用布局 */
function SearchResultSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string
  count: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:opacity-90 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
      >
        <span className="font-semibold">{title}</span>
        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>{count}</span>
          <i
            className="fa fa-chevron-down text-xs transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </span>
      </button>
      {expanded && <div className="px-4 pb-4 pt-0 space-y-4">{children}</div>}
    </section>
  )
}

/** 哲学家/流派链接卡片，与 ContentCard 风格一致 */
function EntityLinkCard({ to, name }: { to: string; name: string }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border p-4 transition-all duration-300 hover:shadow-md hover:border-opacity-80"
      style={{
        borderColor: 'var(--border-primary)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <span className="hover:underline" style={{ color: 'var(--color-primary)' }}>
        {name}
      </span>
    </Link>
  )
}

export function Search() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = (searchParams.get('q') ?? '').trim()
  const [query, setQuery] = useState(qFromUrl)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [totals, setTotals] = useState<SearchTotals>(EMPTY_TOTALS)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState<SearchLoadingMap>(EMPTY_LOADING_MORE)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    philosophers: true,
    schools: true,
    contents: true,
  })
  const toggleSection = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  // URL 中的 q 变化时（含从 Footer 跳转、直接访问、表单提交）自动执行搜索
  useEffect(() => {
    const q = qFromUrl
    setQuery(q)
    if (!q) {
      setResults(null)
      setTotals(EMPTY_TOTALS)
      setError(null)
      setLoading(false)
      setLoadingMore(EMPTY_LOADING_MORE)
      return
    }
    setQuery(q)
    let cancelled = false
    setLoading(true)
    setError(null)
    setResults(null)
    setTotals(EMPTY_TOTALS)
    setLoadingMore(EMPTY_LOADING_MORE)
    philosophyApi
      .search(q)
      .then((res) => {
        if (cancelled) return
        setResults({
          philosophers: Array.isArray(res.philosophers) ? res.philosophers : [],
          schools: Array.isArray(res.schools) ? res.schools : [],
          contents: Array.isArray(res.contents) ? res.contents : [],
        })
        setTotals({
          philosophers: res.philosopherTotalCount ?? res.philosophers.length,
          schools: res.schoolTotalCount ?? res.schools.length,
          contents: res.contentTotalCount ?? res.contents.length,
        })
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : t('搜索失败', 'Search failed'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [qFromUrl, t])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setSearchParams({})
      return
    }
    setSearchParams({ q: trimmed }) // 更新 URL 会触发 useEffect 执行搜索
  }

  const handleLoadMore = async <K extends SearchCategory>(category: K) => {
    if (!results || !qFromUrl || loadingMore[category]) return
    const loadedCount = results[category].length
    if (loadedCount >= totals[category]) return

    setLoadingMore((prev) => ({ ...prev, [category]: true }))
    try {
      const nextPage = Math.floor(loadedCount / SEARCH_PAGE_SIZE)
      const res = await philosophyApi.searchPaged<SearchResult[K][number]>(category, qFromUrl, nextPage, SEARCH_PAGE_SIZE)
      setResults((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          [category]: mergeById(prev[category], Array.isArray(res.results) ? res.results : []),
        }
      })
      setTotals((prev) => ({ ...prev, [category]: res.totalCount ?? prev[category] }))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('加载更多失败', 'Failed to load more results'))
    } finally {
      setLoadingMore((prev) => ({ ...prev, [category]: false }))
    }
  }

  const renderLoadMore = (category: SearchCategory) => {
    if (!results || results[category].length >= totals[category]) {
      return null
    }
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => void handleLoadMore(category)}
          disabled={loadingMore[category]}
          className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-secondary, var(--bg-primary))',
            color: 'var(--text-primary)',
          }}
        >
          {loadingMore[category]
            ? t('加载中...', 'Loading...')
            : t('加载更多', 'Load more')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('搜索', 'Search')}
      </h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('输入关键词...', 'Enter keywords...')}
          className="flex-1 px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-black focus:ring-opacity-30"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'black' }}
        >
          {loading ? t('搜索中...', 'Searching...') : t('搜索', 'Search')}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{t('正在获取搜索结果...', 'Fetching search results...')}</p>}
      {results && (
        <div className="space-y-4">
          {(totals.philosophers + totals.schools + totals.contents > 0) && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('共找到', 'Found')} {totals.philosophers + totals.schools + totals.contents} {t('条结果', 'results')}
            </p>
          )}
          {results.philosophers.length > 0 && (
            <SearchResultSection
              title={t('哲学家', 'Philosophers')}
              count={`${results.philosophers.length}/${totals.philosophers}`}
              expanded={expanded.philosophers}
              onToggle={() => toggleSection('philosophers')}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {results.philosophers.map((p) => (
                  <PhilosopherCard key={p.id} philosopher={p} />
                ))}
              </div>
              {renderLoadMore('philosophers')}
            </SearchResultSection>
          )}
          {results.schools.length > 0 && (
            <SearchResultSection
              title={t('流派', 'Schools')}
              count={`${results.schools.length}/${totals.schools}`}
              expanded={expanded.schools}
              onToggle={() => toggleSection('schools')}
            >
              <div className="space-y-3">
                {results.schools.map((s) => (
                  <EntityLinkCard
                    key={s.id}
                    to={`/schools?schoolId=${s.id}`}
                    name={s.displayName ?? s.name ?? s.nameEn ?? String(s.id)}
                  />
                ))}
              </div>
              {renderLoadMore('schools')}
            </SearchResultSection>
          )}
          {results.contents.length > 0 && (
            <SearchResultSection
              title={t('内容', 'Contents')}
              count={`${results.contents.length}/${totals.contents}`}
              expanded={expanded.contents}
              onToggle={() => toggleSection('contents')}
            >
              {results.contents.map((item) => (
                <ContentCard key={item.id} item={item} showSchool={true} showLikeButton={true} t={t} />
              ))}
              {renderLoadMore('contents')}
            </SearchResultSection>
          )}
          {results.philosophers.length === 0 &&
            results.schools.length === 0 &&
            results.contents.length === 0 && (
              <p className="text-gray-500 py-4">{t('未找到相关结果', 'No results found')}</p>
            )}
        </div>
      )}
    </div>
  )
}
