import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forumApi } from '../api/forum'
import { useLanguage } from '../contexts/LanguageContext'

export function ForumCompose() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    forumApi.categories()
      .then((res) => {
        if (cancelled || !res.success) return
        const items = res.categories ?? []
        const match = items.find((item) => item.slug === 'general') ?? items[0]
        if (match) setCategoryId(String(match.id))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('暂时无法发帖', 'Unable to post right now'))
      })
    return () => {
      cancelled = true
    }
  }, [t])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!categoryId) {
      setError(t('暂时无法发帖', 'Unable to post right now'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await forumApi.createThread({
        categoryId: Number(categoryId),
        title: title.trim(),
        body: body.trim(),
      })
      navigate(`/forum/${result.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('发布失败', 'Failed to publish'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/forum" className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
        {t('返回', 'Back')}
      </Link>
      <h1 className="mb-8 mt-6 text-2xl font-normal tracking-wide" style={{ color: 'var(--text-primary)' }}>
        {t('发帖', 'New thread')}
      </h1>
      <form onSubmit={submit} className="space-y-5">
        {error && <p className="text-sm text-red-700">{error}</p>}
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder={t('标题', 'Title')}
          className="w-full px-3 py-2 text-sm"
          required
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={12}
          maxLength={8000}
          placeholder={t('正文', 'Post')}
          className="w-full px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="text-sm disabled:opacity-50"
          style={{ color: 'var(--text-primary)' }}
        >
          {submitting ? t('发布中...', 'Publishing...') : t('发布', 'Publish')}
        </button>
      </form>
    </div>
  )
}
