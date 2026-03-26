import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { philosophyApi } from '../api/philosophy'
import { ContentCard } from '../components/ContentCard'
import { PhilosopherCard } from '../components/PhilosopherCard'
import { useLanguage } from '../contexts/LanguageContext'

type PhilosopherSearchItem = {
  id: number
  displayName?: string
  name?: string
  nameEn?: string | null
  dateRange?: string | null
}

type SearchResult = {
  philosophers: PhilosopherSearchItem[]
  schools: { id: number; displayName?: string; name?: string }[]
  contents: Array<{
    id: number
    title?: string | null
    content?: string | null
    contentEn?: string | null
    likeCount?: number
    isLiked?: boolean
    school?: { id: number; displayName: string } | null
    philosopher?: { id: number; displayName: string } | null
  }>
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
  count: number
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
  const qFromUrl = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(qFromUrl)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
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
    const q = (searchParams.get('q') ?? '').trim()
    if (!q) return
    setQuery(q)
    let cancelled = false
    setLoading(true)
    setError(null)
    setResults(null)
    philosophyApi
      .search(q)
      .then((res) => {
        if (cancelled) return
        const rawPhilosophers = res.philosophers
        const philosophersList = Array.isArray(rawPhilosophers)
          ? rawPhilosophers.filter((p): p is PhilosopherSearchItem => p != null && typeof (p as { id?: unknown }).id === 'number')
          : []
        setResults({
          philosophers: philosophersList,
          schools: (Array.isArray(res.schools) ? res.schools : []) as SearchResult['schools'],
          contents: (Array.isArray(res.contents) ? res.contents : []) as SearchResult['contents'],
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
  }, [searchParams.get('q') ?? ''])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchParams({ q: query.trim() }) // 更新 URL 会触发 useEffect 执行搜索
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
      {results && (
        <div className="space-y-4">
          {results.philosophers.length > 0 && (
            <SearchResultSection
              title={t('哲学家', 'Philosophers')}
              count={results.philosophers.length}
              expanded={expanded.philosophers}
              onToggle={() => toggleSection('philosophers')}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {results.philosophers.map((p) => (
                  <PhilosopherCard key={p.id} philosopher={p} />
                ))}
              </div>
            </SearchResultSection>
          )}
          {results.schools.length > 0 && (
            <SearchResultSection
              title={t('流派', 'Schools')}
              count={results.schools.length}
              expanded={expanded.schools}
              onToggle={() => toggleSection('schools')}
            >
              {results.schools.map((s) => (
                <EntityLinkCard
                  key={s.id}
                  to={`/schools?schoolId=${s.id}`}
                  name={s.displayName ?? s.name ?? String(s.id)}
                />
              ))}
            </SearchResultSection>
          )}
          {results.contents.length > 0 && (
            <SearchResultSection
              title={t('内容', 'Contents')}
              count={results.contents.length}
              expanded={expanded.contents}
              onToggle={() => toggleSection('contents')}
            >
              {results.contents.map((item) => (
                <ContentCard key={item.id} item={item} showSchool={true} showLikeButton={true} t={t} />
              ))}
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
