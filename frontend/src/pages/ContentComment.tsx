import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { philosophyApi, apiDeleteComment, apiPostComment } from '../api/philosophy'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { CommentCard } from '../components/CommentCard'

type ContentData = {
  id: number
  title?: string | null
  content?: string | null
  contentEn?: string | null
  likeCount: number
  commentCount: number
  isLiked: boolean
  school?: { id: number; displayName: string; parent?: { id: number; displayName: string } }
  philosopher?: { id: number; displayName: string; dateRange?: string }
}

type CommentItem = {
  id: number
  body: string
  createdAt: string | null
  parentId: number | null
  user?: { id: number; username: string }
  replies: CommentItem[]
}

type ApiCommentItem = {
  id: number
  body: string
  createdAt: string | null
  parentId?: number | null
  user?: { id: number; username: string }
  replies?: ApiCommentItem[]
}

export function ContentComment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authenticated, user } = useAuth()
  const { language, t } = useLanguage()
  const [content, setContent] = useState<ContentData | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const contentId = id ? parseInt(id, 10) : NaN

  const loadData = async () => {
    if (!contentId || isNaN(contentId)) {
      setError(t('无效的内容', 'Invalid content'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [contentRes, commentsRes] = await Promise.all([
        philosophyApi.contentById(contentId),
        philosophyApi.commentsByContentId(contentId),
      ])
      if (contentRes.success && contentRes.content) {
        setContent(contentRes.content)
        setIsLiked(contentRes.content.isLiked)
        setLikeCount(contentRes.content.likeCount)
      } else {
        setError(t('内容不存在', 'Content not found'))
      }
      if (commentsRes.success && Array.isArray(commentsRes.comments)) {
        const normalizeComment = (item: ApiCommentItem): CommentItem => ({
          id: item.id,
          body: item.body,
          createdAt: item.createdAt ?? null,
          parentId: item.parentId ?? null,
          user: item.user,
          replies: Array.isArray(item.replies) ? item.replies.map(normalizeComment) : [],
        })
        setComments((commentsRes.comments as ApiCommentItem[]).map(normalizeComment))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('加载失败', 'Load failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [contentId])

  useEffect(() => {
    if (!loading && window.location.hash === '#comments') {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [loading])

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!authenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/content/${contentId}`)}`)
      return
    }
    const text = commentText.trim()
    if (!text) return
    setSubmitting(true)
    try {
      await apiPostComment(contentId, text)
      setCommentText('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('评论失败', 'Comment failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (e: MouseEvent) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      const res = await fetch('/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: `entityType=CONTENT&entityId=${contentId}`,
      })
      const data = await res.json()
      if (data.success) {
        setIsLiked(data.isLiked)
        setLikeCount(data.likeCount)
      } else if (data.message === '请先登录' || data.message?.includes('login')) {
        navigate(`/login?redirect=${encodeURIComponent(`/content/${contentId}`)}`)
      }
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: number, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(t('确定要删除这条评论吗？', 'Are you sure you want to delete this comment?'))) return
    try {
      await apiDeleteComment(commentId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('删除失败', 'Delete failed'))
    }
  }

  const formatDate = (s: string | null) => {
    if (!s) return ''
    try {
      const d = new Date(s)
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return s
    }
  }

  const localizedContent = language === 'en' && content?.contentEn ? content.contentEn : (content?.content ?? '')

  if (loading) {
    return (
      <div
        className="max-w-2xl mx-auto py-8 min-h-[50vh] flex items-center justify-center"
        style={{ background: '#ffffff', color: '#111827' }}
      >
        <span style={{ color: '#6b7280' }}>{t('加载中...', 'Loading...')}</span>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div
        className="max-w-2xl mx-auto py-8"
        style={{ background: '#ffffff', color: '#111827' }}
      >
        <p style={{ color: '#374151' }}>{error || t('内容不存在', 'Content not found')}</p>
        <Link
          to="/"
          className="inline-block mt-4 text-sm underline"
          style={{ color: '#111827' }}
        >
          {t('返回首页', 'Back to home')}
        </Link>
      </div>
    )
  }

  return (
    <div
      className="max-w-2xl mx-auto py-6"
      style={{ background: '#ffffff', color: '#111827' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: '#374151', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <i className="fa fa-arrow-left" />
        {t('返回', 'Back')}
      </button>

      <article
        className="rounded-lg border p-5 mb-8"
        style={{ borderColor: '#e5e7eb', background: '#ffffff' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {content.school && (
              <div className="flex flex-wrap gap-2 mb-2">
                {content.school.parent?.id != null && (
                  <Link
                    to={`/schools?schoolId=${content.school.parent.id}`}
                    className="text-xs hover:underline"
                    style={{ color: '#374151' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content.school.parent.displayName}
                  </Link>
                )}
                {content.school.id != null && (
                  <Link
                    to={`/schools?schoolId=${content.school.id}`}
                    className="text-xs hover:underline"
                    style={{ color: '#374151' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content.school.displayName}
                  </Link>
                )}
              </div>
            )}
            {content.title && (
              <h1 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
                {content.title}
              </h1>
            )}
            <p className="whitespace-pre-wrap text-[15px]" style={{ color: '#374151' }}>
              {localizedContent || t('暂无内容', 'No content yet')}
            </p>
            {content.philosopher && (
              <p className="text-sm mt-3" style={{ color: '#6b7280' }}>
                {content.philosopher.id != null ? (
                  <Link
                    to={`/philosophers?philosopherId=${content.philosopher.id}`}
                    className="hover:underline"
                    style={{ color: '#111827' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content.philosopher.displayName}
                  </Link>
                ) : (
                  content.philosopher.displayName
                )}
                {content.philosopher.dateRange ? ` · ${content.philosopher.dateRange}` : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className="flex flex-col items-center gap-0.5 shrink-0 p-2 rounded-full transition-colors hover:bg-[#f3f4f6] disabled:opacity-50"
            style={{ color: '#374151' }}
            title={isLiked ? t('取消点赞', 'Unlike') : t('点赞', 'Like')}
          >
            {likeLoading ? (
              <i className="fa-solid fa-spinner fa-spin text-base" style={{ color: '#6b7280' }} />
            ) : (
              <i
                className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
                style={{ color: isLiked ? '#111827' : '#6b7280' }}
              />
            )}
            <span className="text-xs">{likeCount}</span>
          </button>
        </div>
      </article>

      <section id="comments" className="border-t pt-6" style={{ borderColor: '#e5e7eb' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t('评论', 'Comments')} ({content.commentCount})
        </h2>

        {authenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('写下你的评论...', 'Write your comment...')}
              rows={3}
              maxLength={5000}
              className="w-full px-4 py-3 rounded-lg border resize-none text-[15px] outline-none focus:ring-2 focus:ring-[#111827] focus:ring-opacity-30"
              style={{
                borderColor: '#d1d5db',
                background: '#ffffff',
                color: '#111827',
              }}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-opacity"
                style={{ background: '#111827', color: '#ffffff' }}
              >
                {submitting ? t('发送中...', 'Sending...') : t('发表评论', 'Post comment')}
              </button>
            </div>
          </form>
        ) : (
          <p className="mb-6 text-sm" style={{ color: '#6b7280' }}>
            {t('登录后可发表评论', 'Log in to leave a comment')}{' '}
            <Link to={`/login?redirect=${encodeURIComponent(`/content/${contentId}`)}`} className="underline" style={{ color: '#111827' }}>
              {t('去登录', 'Log in')}
            </Link>
          </p>
        )}

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {t('暂无评论', 'No comments yet')}
            </p>
          ) : (
            comments.map((c) => (
              <CommentCard
                key={c.id}
                comment={c}
                fallbackAuthor={t('匿名', 'Anonymous')}
                dateText={formatDate(c.createdAt)}
                canDelete={!!user && user.id === c.user?.id}
                deleteTitle={t('删除', 'Delete')}
                onDelete={handleDeleteComment}
                style={{ borderColor: '#e5e7eb', background: '#f9fafb', border: '1px solid #e5e7eb' }}
                subtitle={
                  c.replies && c.replies.length > 0 ? (
                    <div className="mt-3 pl-4 space-y-2 border-l-2" style={{ borderColor: '#e5e7eb' }}>
                      {c.replies.map((r) => (
                        <CommentCard
                          key={r.id}
                          comment={r}
                          fallbackAuthor={t('匿名', 'Anonymous')}
                          dateText={formatDate(r.createdAt)}
                          canDelete={!!user && user.id === r.user?.id}
                          deleteTitle={t('删除', 'Delete')}
                          onDelete={handleDeleteComment}
                          compact={true}
                        />
                      ))}
                    </div>
                  ) : undefined
                }
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
