import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatForumTime, forumApi, type ForumThreadSummary } from '../api/forum'
import { useLanguage } from '../contexts/LanguageContext'

export function Forum() {
  const { language, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page') || '1') || 1)

  const [threads, setThreads] = useState<ForumThreadSummary[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    forumApi.threads({ page: page - 1 })
      .then((res) => {
        if (cancelled) return
        setThreads(res.threads ?? [])
        setTotalPages(res.totalPages ?? 0)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setThreads([])
        setError(err instanceof Error ? err.message : t('加载失败', 'Load failed'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, t])

  const goToPage = (nextPage: number) => {
    const paramsNext = new URLSearchParams()
    if (nextPage > 1) paramsNext.set('page', String(nextPage))
    setParams(paramsNext)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex justify-end">
        <Link
          to="/forum/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <i className="fa fa-pencil" />
          <span>{t('发帖', 'New thread')}</span>
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="py-10 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {t('加载中...', 'Loading...')}
        </p>
      ) : threads.length === 0 ? (
        <p className="py-10 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {t('还没有帖子', 'No threads yet')}
        </p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id} className="border-t py-4" style={{ borderColor: 'var(--border-primary)' }}>
              <Link to={`/forum/${thread.id}`} className="block">
                <h2 className="text-[15px] font-normal leading-6" style={{ color: 'var(--text-primary)' }}>
                  {thread.pinned ? `${t('置顶', 'Pinned')} · ` : ''}
                  {thread.locked ? `${t('锁定', 'Locked')} · ` : ''}
                  {thread.title}
                </h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {thread.user?.username || t('匿名', 'Anonymous')}
                  {' · '}
                  {t(`${thread.replyCount} 回复`, `${thread.replyCount} replies`)}
                  {' · '}
                  {formatForumTime(thread.lastActivityAt, language)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="disabled:opacity-40">
            {t('上一页', 'Previous')}
          </button>
          <span>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="disabled:opacity-40">
            {t('下一页', 'Next')}
          </button>
        </div>
      )}
    </div>
  )
}
