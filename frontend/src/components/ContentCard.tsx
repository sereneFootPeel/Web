import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export type ContentCardData = {
  id: number
  title?: string | null
  content?: string | null
  contentEn?: string | null
  likeCount?: number
  isLiked?: boolean
  school?: {
    id?: number
    displayName?: string
    name?: string
    nameEn?: string | null
    parent?: {
      id?: number
      displayName?: string
      name?: string
      nameEn?: string | null
    } | null
  } | null
  philosopher?: {
    id?: number
    displayName?: string
    name?: string
    nameEn?: string | null
    dateRange?: string | null
  } | null
}

type ContentCardProps = {
  item: ContentCardData
  showLikeButton?: boolean
  onLikeToggle?: (contentId: number, isLiked: boolean, likeCount: number) => void
  t?: (zh: string, en: string) => string
  showSchool?: boolean
}

function getLocalizedName(
  entity: { displayName?: string; name?: string; nameEn?: string | null } | null | undefined,
  language: 'zh' | 'en'
) {
  if (!entity) return ''
  if (language === 'en' && entity.nameEn) return entity.nameEn
  return entity.displayName || entity.name || ''
}

function getLocalizedText(data: ContentCardData, language: 'zh' | 'en') {
  if (language === 'en' && data.contentEn) return data.contentEn
  return data.content || data.contentEn || ''
}

export function ContentCard({
  item,
  showLikeButton = false,
  onLikeToggle,
  t = (zh) => zh,
  showSchool = false,
}: ContentCardProps) {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(item.isLiked ?? false)
  const [loading, setLoading] = useState(false)
  const localizedText = getLocalizedText(item, language).trim()

  const handleCardClick = () => {
    navigate(`/content/${item.id}`)
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: `entityType=CONTENT&entityId=${item.id}`,
      })
      const data = await res.json()
      if (data.success) {
        setIsLiked(data.isLiked)
        onLikeToggle?.(item.id, data.isLiked, data.likeCount)
      } else if (data.message === '请先登录' || data.message?.includes('login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className="group relative rounded-lg border p-4 transition-all duration-300 hover:shadow-md cursor-pointer"
      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
    >
      {showLikeButton && (
        <button
          type="button"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-opacity duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-red-50"
          onClick={handleLikeClick}
          title={isLiked ? t('取消点赞', 'Unlike') : t('点赞', 'Like')}
          disabled={loading}
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin text-sm text-gray-400" />
          ) : (
            <i
              className={
                isLiked
                  ? 'fa-solid fa-heart text-red-500'
                  : 'fa-regular fa-heart text-gray-400 hover:text-red-500 transition-colors duration-200'
              }
            />
          )}
        </button>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {item.school?.parent && (
          item.school.parent.id != null ? (
            <Link
              to={`/schools?schoolId=${item.school.parent.id}`}
              className="text-xs hover:underline"
              style={{ color: 'var(--text-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {getLocalizedName(item.school.parent, language)}
            </Link>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              {getLocalizedName(item.school.parent, language)}
            </span>
          )
        )}
        {(showSchool || item.school?.parent) && item.school && (
          item.school.id != null ? (
            <Link
              to={`/schools?schoolId=${item.school.id}`}
              className="text-xs hover:underline"
              style={{ color: 'var(--text-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {getLocalizedName(item.school, language)}
            </Link>
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              {getLocalizedName(item.school, language)}
            </span>
          )
        )}
      </div>

      {item.title && (
        <h4 className={`font-semibold mb-2 ${showLikeButton ? 'pr-10' : ''}`}>
          {item.title}
        </h4>
      )}
      <p className={`text-sm whitespace-pre-wrap ${showLikeButton && !item.title ? 'pr-10' : ''}`}>
        {localizedText || t('暂无内容', 'No content yet')}
      </p>
      {item.philosopher && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
          {item.philosopher.id != null ? (
            <Link
              to={`/philosophers?philosopherId=${item.philosopher.id}`}
              className="hover:underline hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {getLocalizedName(item.philosopher, language)}
            </Link>
          ) : (
            getLocalizedName(item.philosopher, language)
          )}
          {item.philosopher.dateRange ? ` · ${item.philosopher.dateRange}` : ''}
        </p>
      )}
    </article>
  )
}
