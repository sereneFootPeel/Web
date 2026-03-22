import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type CommentCardData = {
  id: number
  body: string
  createdAt: string | null
  user?: { id: number; username: string }
}

type CommentCardProps = {
  comment: CommentCardData
  authorName?: string
  dateText?: string
  fallbackAuthor: string
  linkTo?: string
  subtitle?: ReactNode
  canDelete?: boolean
  deleteTitle?: string
  onDelete?: (commentId: number, e: MouseEvent<HTMLButtonElement>) => void
  compact?: boolean
  className?: string
  style?: CSSProperties
}

export function CommentCard({
  comment,
  authorName,
  dateText,
  fallbackAuthor,
  linkTo,
  subtitle,
  canDelete = false,
  deleteTitle = 'Delete',
  onDelete,
  compact = false,
  className = '',
  style,
}: CommentCardProps) {
  const resolvedAuthor = authorName ?? comment.user?.username ?? fallbackAuthor
  const wrapperClass = `group relative rounded-lg ${compact ? 'p-3' : 'p-4'} ${className}`.trim()

  const body = (
    <div className={canDelete ? 'pr-8' : ''}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: '#111827' }}>
          {resolvedAuthor}
        </span>
        {dateText && (
          <span className="text-xs" style={{ color: '#6b7280' }}>
            {dateText}
          </span>
        )}
      </div>
      <p className={`whitespace-pre-wrap ${compact ? 'text-sm' : 'text-sm'}`} style={{ color: '#374151' }}>
        {comment.body}
      </p>
      {subtitle && <div className="mt-1.5">{subtitle}</div>}
    </div>
  )

  return (
    <div className={wrapperClass} style={style}>
      {linkTo ? (
        <Link to={linkTo} className="block hover:opacity-90">
          {body}
        </Link>
      ) : (
        body
      )}
      {canDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => onDelete(comment.id, e)}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-opacity duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-red-100"
          style={{ color: '#6b7280' }}
          title={deleteTitle}
        >
          <i className="fa fa-trash-alt text-sm" />
        </button>
      )}
    </div>
  )
}
