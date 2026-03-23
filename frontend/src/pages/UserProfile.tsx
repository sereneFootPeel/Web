import { useEffect, useState, useCallback, type MouseEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { ContentCard } from '../components/ContentCard'
import { apiDeleteComment } from '../api/philosophy'
import { CommentCard } from '../components/CommentCard'

type ContentItem = {
  id: number
  title: string
  content: string
  likeCount: number
  isLiked?: boolean
}

type MyCommentItem = {
  id: number
  body: string
  contentId: number | null
  contentTitle: string | null
  createdAt: string | null
}

type Profile = {
  id: number
  username: string
  email: string
  role: string
  contents?: ContentItem[]
  likedContents?: ContentItem[]
  commentCount?: number
  myComments?: MyCommentItem[]
}

export function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { logout, user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = !id

  const fetchProfile = useCallback(() => {
    setLoading(true)
    setError(null)
    const url = id ? `/api/user/profile/${id}` : '/api/user/profile'
    fetch(url, { credentials: 'include' })
      .then(async (r) => {
        if (r.redirected && r.url.includes('/login')) {
          navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
          return null
        }
        if (r.status === 401) {
          navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
          return null
        }
        if (!r.ok) {
          setError('load_failed')
          return null
        }
        const contentType = r.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          setError('load_failed')
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (data) setProfile(data)
      })
      .catch(() => {
        setError('network_error')
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleLanguageSwitch = async (lang: 'zh' | 'en') => {
    await setLanguage(lang)
    fetchProfile()
  }

  const refreshLikedInProfile = (contentId: number, nowLiked: boolean, newLikeCount: number) => {
    setProfile((p) => {
      if (!p) return p
      const contents = (p.contents ?? []).map((c) =>
        c.id === contentId ? { ...c, isLiked: nowLiked, likeCount: newLikeCount } : c
      )
      if (!isOwnProfile) return { ...p, contents }
      const liked = p.likedContents ?? []
      if (nowLiked) {
        const item = p.contents?.find((c) => c.id === contentId)
        if (item && !liked.some((c) => c.id === contentId)) {
          return { ...p, contents, likedContents: [...liked, { ...item, isLiked: true, likeCount: newLikeCount }] }
        }
      }
      return { ...p, contents, likedContents: liked.filter((c) => c.id !== contentId) }
    })
  }

  const errorMessage = error === 'load_failed' ? t('加载失败', 'Failed to load') : error === 'network_error' ? t('网络错误', 'Network error') : error

  if (loading) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('加载中...', 'Loading...')}</div>
  if (error) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{errorMessage}</div>
  if (!profile) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('用户不存在', 'User not found')}</div>

  const likedContents = profile.likedContents ?? []
  const myComments = profile.myComments ?? []

  const formatCommentDate = (s: string | null) => {
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

  const handleDeleteComment = async (commentId: number, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(t('确定要删除这条评论吗？', 'Are you sure you want to delete this comment?'))) return
    try {
      await apiDeleteComment(commentId)
      setProfile((p) => {
        if (!p?.myComments) return p
        return { ...p, myComments: p.myComments.filter((c) => c.id !== commentId), commentCount: Math.max(0, (p.commentCount ?? 0) - 1) }
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : t('删除失败', 'Delete failed'))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {profile.username}
          {profile.role === 'ADMIN' && <span className="ml-2 text-sm text-amber-600">{t('管理员', 'Admin')}</span>}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {isOwnProfile && (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                >
                  <i className="fa fa-cog" />
                  <span>{t('管理后台', 'Admin Panel')}</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout().then(() => navigate('/'))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                <i className="fa fa-sign-out" />
                <span>{t('登出', 'Logout')}</span>
              </button>
            </>
          )}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('zh')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors outline-none focus:ring-0 ${language === 'zh' ? '' : 'opacity-70 hover:opacity-100'}`}
            style={language === 'zh' ? { color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' } : { color: 'var(--text-secondary)' }}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('en')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors outline-none focus:ring-0 ${language === 'en' ? '' : 'opacity-70 hover:opacity-100'}`}
            style={language === 'en' ? { color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' } : { color: 'var(--text-secondary)' }}
          >
            English
          </button>
        </div>
        </div>
      </div>
      <div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {profile.commentCount != null && (language === 'en' ? `${profile.commentCount} comments` : `评论 ${profile.commentCount} 条`)}
        </p>
      </div>

      {isOwnProfile && (
        <div>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('我的点赞', 'My Likes')}
          </h2>
          {likedContents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {likedContents.map((c) => (
                <ContentCard key={c.id} item={{ ...c, isLiked: true }} showSchool={true} showLikeButton={true} onLikeToggle={refreshLikedInProfile} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('您还没有点赞任何内容', "You haven't liked any content yet")}</p>
          )}
        </div>
      )}

      {isOwnProfile && (
        <div>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('我的评论', 'My Comments')}
          </h2>
          {myComments.length > 0 ? (
            <div className="space-y-3">
              {myComments.map((cm) => (
                <CommentCard
                  key={cm.id}
                  comment={{ id: cm.id, body: cm.body, createdAt: cm.createdAt }}
                  fallbackAuthor={profile.username}
                  dateText={formatCommentDate(cm.createdAt)}
                  linkTo={cm.contentId ? `/content/${cm.contentId}#comments` : undefined}
                  subtitle={
                    cm.contentTitle ? (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {t('来自', 'From')}: {cm.contentTitle}
                      </span>
                    ) : undefined
                  }
                  canDelete={isOwnProfile}
                  deleteTitle={t('删除', 'Delete')}
                  onDelete={handleDeleteComment}
                  compact={true}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('您还没有发表任何评论', "You haven't posted any comments yet")}</p>
          )}
        </div>
      )}

    </div>
  )
}
