import { Link } from 'react-router-dom'

export type PhilosopherCardData = {
  id: number
  displayName?: string
  name?: string
  nameEn?: string | null
  dateRange?: string | null
}

type PhilosopherCardProps = {
  philosopher: PhilosopherCardData
}

export function PhilosopherCard({ philosopher }: PhilosopherCardProps) {
  const name = philosopher.displayName ?? philosopher.name ?? philosopher.nameEn ?? String(philosopher.id)
  const to = `/philosophers?philosopherId=${philosopher.id}`

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
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            opacity: 0.9,
          }}
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="font-semibold block truncate hover:underline"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </span>
          {philosopher.dateRange && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {philosopher.dateRange}
            </p>
          )}
        </div>
        <i
          className="fa fa-chevron-right flex-shrink-0 mt-1 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        />
      </div>
    </Link>
  )
}
