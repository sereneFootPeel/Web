import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWithCredentials } from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'

type Dashboard = {
  philosophersCount: number
  schoolsCount: number
  contentsCount: number
  usersCount: number
}

export function AdminDashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithCredentials('/api/admin/dashboard')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">{t('加载中...', 'Loading...')}</div>
  if (!data) return <div className="p-8 text-red-500">{t('无权限或加载失败', 'No permission or failed to load')}</div>

  const cards = [
    { label: t('哲学家', 'Philosophers'), count: data.philosophersCount },
    { label: t('流派', 'Schools'), count: data.schoolsCount },
    { label: t('内容', 'Contents'), count: data.contentsCount },
    { label: t('用户', 'Users'), count: data.usersCount },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {t('管理后台', 'Admin Panel')}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-4 rounded-lg border"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.count}</p>
          </div>
        ))}
      </div>
      <div>
        <Link to="/admin/users" className="hover:underline" style={{ color: 'var(--text-primary)' }}>{t('用户管理', 'Users')}</Link>
        {' · '}
        <Link to="/admin/philosophers" className="hover:underline" style={{ color: 'var(--text-primary)' }}>{t('哲学家管理', 'Philosophers')}</Link>
      </div>
    </div>
  )
}
