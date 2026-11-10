import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { formatForumTime, forumApi, type ForumReply, type ForumThreadDetail } from '../api/forum'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export function ForumThread() {
  const { id } = useParams<{ id: string }>()
  const threadId = id ? Number(id) : NaN
  const navigate = useNavigate()
  const location = useLocation()
  const { authenticated, user } = useAuth()
  const { language, t } = useLanguage()

  const [thread, setThread] = useState<ForumThreadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyParentId, setReplyParentId] = useState<number | null>(null)
  const [replyToName, setReplyToName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editReplyBody, setEditReplyBody] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const owns = (authorId?: number) => !!user && user.id === authorId
  const canEditPost = !!thread && (isAdmin || (!thread.locked && owns(thread.user?.id)))
  const canDeletePost = !!thread && (isAdmin || owns(thread.user?.id))

  const load = async (countView = false) => {
    if (!threadId || Number.isNaN(threadId)) {
      setError(t('帖子不存在', 'Thread not found'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const threadRes = await forumApi.thread(threadId, countView)
      if (!threadRes.success || !threadRes.thread) {
        setError(t('帖子不存在', 'Thread not found'))
        setThread(null)
        return
      }
      setThread(threadRes.thread)
      setEditTitle(threadRes.thread.title)
      setEditBody(threadRes.thread.body)
      setEditCategoryId(String(threadRes.thread.category?.id ?? ''))
    } catch (err) {
      const message = err instanceof Error ? err.message : t('加载失败', 'Load failed')
      setError(message.includes('404') ? t('帖子不存在', 'Thread not found') : message)
      setThread(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(true)
  }, [threadId])

  const requireLogin = () => {
    navigate('/login', { state: { from: location } })
  }

  const startReply = (parentId: number | null, username?: string) => {
    if (!authenticated) {
      requireLogin()
      return
    }
    setReplyParentId(parentId)
    setReplyToName(username ?? null)
    if (username) {
      const mention = `@${username} `
      setReplyText((current) => (current.startsWith(mention) ? current : `${mention}${current}`))
    }
    document.getElementById('forum-reply')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const cancelReplyTarget = () => {
    if (replyToName) {
      const mention = `@${replyToName} `
      setReplyText((current) => (current.startsWith(mention) ? current.slice(mention.length) : current))
    }
    setReplyParentId(null)
    setReplyToName(null)
  }

  const submitReply = async (event: FormEvent) => {
    event.preventDefault()
    if (!authenticated) {
      requireLogin()
      return
    }
    const text = replyText.trim()
    if (!text) return
    setSubmitting(true)
    setError(null)
    try {
      await forumApi.createReply(threadId, { body: text, parentId: replyParentId })
      setReplyText('')
      setReplyParentId(null)
      setReplyToName(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('回复失败', 'Reply failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const savePost = async () => {
    if (!thread) return
    setSubmitting(true)
    setError(null)
    try {
      await forumApi.updateThread(thread.id, {
        categoryId: Number(editCategoryId || thread.category?.id),
        title: editTitle.trim(),
        body: editBody.trim(),
      })
      setEditingPost(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('保存失败', 'Save failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const removePost = async () => {
    if (!thread) return
    if (!window.confirm(t('确定删除这篇帖子？回复会一起删除。', 'Delete this thread and its replies?'))) return
    try {
      await forumApi.deleteThread(thread.id)
      navigate('/forum')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('删除失败', 'Delete failed'))
    }
  }

  const saveReply = async (replyId: number) => {
    setSubmitting(true)
    setError(null)
    try {
      await forumApi.updateReply(replyId, editReplyBody.trim())
      setEditingReplyId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('保存失败', 'Save failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const removeReply = async (replyId: number) => {
    if (!window.confirm(t('确定删除这条回复？', 'Delete this reply?'))) return
    try {
      await forumApi.deleteReply(replyId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('删除失败', 'Delete failed'))
    }
  }

  const togglePin = async () => {
    if (!thread) return
    try {
      await forumApi.pinThread(thread.id, !thread.pinned)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('操作失败', 'Action failed'))
    }
  }

  const toggleLock = async () => {
    if (!thread) return
    try {
      await forumApi.lockThread(thread.id, !thread.locked)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('操作失败', 'Action failed'))
    }
  }

  if (loading && !thread) {
    return <p className="py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>{t('加载中...', 'Loading...')}</p>
  }

  if (!thread) {
    return (
      <div className="mx-auto max-w-2xl">
        <p style={{ color: 'var(--text-secondary)' }}>{error || t('帖子不存在', 'Thread not found')}</p>
        <Link to="/forum" className="mt-4 inline-block text-sm underline">{t('返回', 'Back')}</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/forum" className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
        {t('返回', 'Back')}
      </Link>

      <article className="mt-6">
        {(thread.pinned || thread.locked) && (
          <p className="mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {thread.pinned ? t('置顶', 'Pinned') : ''}
            {thread.pinned && thread.locked ? ' · ' : ''}
            {thread.locked ? t('已锁定', 'Locked') : ''}
          </p>
        )}

        {editingPost ? (
          <div className="space-y-3">
            <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={80} className="w-full px-3 py-2" />
            <textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} rows={8} maxLength={8000} className="w-full px-3 py-2" />
            <div className="flex gap-3 text-sm">
              <button type="button" disabled={submitting} onClick={() => void savePost()} className="font-medium">{t('保存', 'Save')}</button>
              <button type="button" onClick={() => setEditingPost(false)} style={{ color: 'var(--text-tertiary)' }}>{t('取消', 'Cancel')}</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-normal tracking-wide" style={{ color: 'var(--text-primary)' }}>{thread.title}</h1>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {thread.user?.username || t('匿名', 'Anonymous')}
              {' · '}
              {formatForumTime(thread.createdAt, language)}
              {thread.edited ? ` · ${t('已编辑', 'Edited')}` : ''}
              {' · '}
              {t(`${thread.replyCount} 回复`, `${thread.replyCount} replies`)}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7" style={{ color: 'var(--text-secondary)' }}>{thread.body}</p>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {!thread.locked && (
            <button type="button" onClick={() => startReply(null)} style={{ color: 'var(--text-secondary)' }}>
              {t('回复', 'Reply')}
            </button>
          )}
          {canEditPost && !editingPost && (
            <button type="button" onClick={() => setEditingPost(true)} style={{ color: 'var(--text-secondary)' }}>{t('编辑', 'Edit')}</button>
          )}
          {canDeletePost && (
            <button type="button" onClick={() => void removePost()} style={{ color: 'var(--text-secondary)' }}>{t('删除', 'Delete')}</button>
          )}
          {isAdmin && (
            <>
              <button type="button" onClick={() => void togglePin()} style={{ color: 'var(--text-secondary)' }}>
                {thread.pinned ? t('取消置顶', 'Unpin') : t('置顶', 'Pin')}
              </button>
              <button type="button" onClick={() => void toggleLock()} style={{ color: 'var(--text-secondary)' }}>
                {thread.locked ? t('解锁', 'Unlock') : t('锁定', 'Lock')}
              </button>
            </>
          )}
        </div>
      </article>

      <section className="mt-10">
        {thread.replies.length === 0 ? (
          <p className="border-t py-6 text-sm" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-tertiary)' }}>
            {t('还没有回复', 'No replies yet')}
          </p>
        ) : (
          <ol className="space-y-5">
            {thread.replies.map((reply, index) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                floor={index + 1}
                language={language}
                t={t}
                canModify={(authorId) => isAdmin || (!thread.locked && owns(authorId))}
                canDelete={(authorId) => isAdmin || owns(authorId)}
                editingReplyId={editingReplyId}
                editReplyBody={editReplyBody}
                submitting={submitting}
                onEditBody={setEditReplyBody}
                onStartEdit={(item) => {
                  setEditingReplyId(item.id)
                  setEditReplyBody(item.body)
                }}
                onCancelEdit={() => setEditingReplyId(null)}
                onSave={(replyId) => void saveReply(replyId)}
                onDelete={(replyId) => void removeReply(replyId)}
                onReply={(item) => startReply(reply.id, item.user?.username)}
                locked={thread.locked}
              />
            ))}
          </ol>
        )}
      </section>

      <section id="forum-reply" className="mt-10">
        {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
        {thread.locked ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{t('已锁定', 'Locked')}</p>
        ) : (
          <form onSubmit={submitReply} className="space-y-3">
            {replyToName && (
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <span>{replyToName}</span>
                <button type="button" onClick={cancelReplyTarget}>{t('取消', 'Cancel')}</button>
              </div>
            )}
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              rows={4}
              maxLength={5000}
              placeholder={authenticated ? t('回复', 'Reply') : t('登录后回复', 'Log in to reply')}
              className="w-full px-3 py-2 text-sm"
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <button type="submit" disabled={submitting} className="text-sm disabled:opacity-50" style={{ color: 'var(--text-primary)' }}>
              {submitting ? t('发送中...', 'Sending...') : t('回复', 'Reply')}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

function ReplyItem({
  reply,
  floor,
  language,
  t,
  canModify,
  canDelete,
  editingReplyId,
  editReplyBody,
  submitting,
  onEditBody,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onReply,
  locked,
}: {
  reply: ForumReply
  floor: number
  language: 'zh' | 'en'
  t: (zh: string, en: string) => string
  canModify: (authorId?: number) => boolean
  canDelete: (authorId?: number) => boolean
  editingReplyId: number | null
  editReplyBody: string
  submitting: boolean
  onEditBody: (value: string) => void
  onStartEdit: (reply: ForumReply) => void
  onCancelEdit: () => void
  onSave: (id: number) => void
  onDelete: (id: number) => void
  onReply: (reply: ForumReply) => void
  locked: boolean
}) {
  const editing = editingReplyId === reply.id
  return (
    <li className="border-t py-4" style={{ borderColor: 'var(--border-primary)' }}>
      <p className="mb-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {reply.user?.username || t('匿名', 'Anonymous')}
        {' · '}
        {formatForumTime(reply.createdAt, language)}
        {reply.edited ? ` · ${t('已编辑', 'Edited')}` : ''}
        {' · '}
        {floor}
      </p>
      {editing ? (
        <div className="space-y-2">
          <textarea value={editReplyBody} onChange={(event) => onEditBody(event.target.value)} rows={4} maxLength={5000} className="w-full px-3 py-2" />
          <div className="flex gap-3 text-sm">
            <button type="button" disabled={submitting} onClick={() => onSave(reply.id)}>{t('保存', 'Save')}</button>
            <button type="button" onClick={onCancelEdit} style={{ color: 'var(--text-tertiary)' }}>{t('取消', 'Cancel')}</button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{reply.body}</p>
      )}
      <div className="mt-2 flex gap-3 text-xs">
        {!locked && <button type="button" onClick={() => onReply(reply)} style={{ color: 'var(--text-tertiary)' }}>{t('回复', 'Reply')}</button>}
        {canModify(reply.user?.id) && !editing && (
          <button type="button" onClick={() => onStartEdit(reply)} style={{ color: 'var(--text-tertiary)' }}>{t('编辑', 'Edit')}</button>
        )}
        {canDelete(reply.user?.id) && (
          <button type="button" onClick={() => onDelete(reply.id)} style={{ color: 'var(--text-tertiary)' }}>{t('删除', 'Delete')}</button>
        )}
      </div>
      {reply.replies.length > 0 && (
        <ul className="mt-3 space-y-3 border-l pl-3" style={{ borderColor: 'var(--border-primary)' }}>
          {reply.replies.map((child) => (
            <li key={child.id}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {child.user?.username || t('匿名', 'Anonymous')}
                {' · '}
                {formatForumTime(child.createdAt, language)}
                {child.edited ? ` · ${t('已编辑', 'Edited')}` : ''}
              </p>
              {editingReplyId === child.id ? (
                <div className="mt-1 space-y-2">
                  <textarea value={editReplyBody} onChange={(event) => onEditBody(event.target.value)} rows={3} maxLength={5000} className="w-full px-3 py-2" />
                  <div className="flex gap-3 text-sm">
                    <button type="button" disabled={submitting} onClick={() => onSave(child.id)}>{t('保存', 'Save')}</button>
                    <button type="button" onClick={onCancelEdit} style={{ color: 'var(--text-tertiary)' }}>{t('取消', 'Cancel')}</button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{child.body}</p>
              )}
              <div className="mt-1 flex gap-3 text-xs">
                {!locked && (
                  <button type="button" onClick={() => onReply(child)} style={{ color: 'var(--text-tertiary)' }}>{t('回复', 'Reply')}</button>
                )}
                {canModify(child.user?.id) && editingReplyId !== child.id && (
                  <button type="button" onClick={() => onStartEdit(child)} style={{ color: 'var(--text-tertiary)' }}>{t('编辑', 'Edit')}</button>
                )}
                {canDelete(child.user?.id) && (
                  <button type="button" onClick={() => onDelete(child.id)} style={{ color: 'var(--text-tertiary)' }}>{t('删除', 'Delete')}</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
