import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Dashboard = {
  philosophersCount: number
  schoolsCount: number
  contentsCount: number
  usersCount: number
}

export function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">加载中...</div>
  if (!data) return <div className="p-8 text-red-500">无权限或加载失败</div>

  const cards = [
    { label: '哲学家', count: data.philosophersCount },
    { label: '流派', count: data.schoolsCount },
    { label: '内容', count: data.contentsCount },
    { label: '用户', count: data.usersCount },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        管理后台
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
        <Link to="/admin/users" className="hover:underline" style={{ color: 'var(--text-primary)' }}>用户管理</Link>
        {' · '}
        <Link to="/admin/philosophers" className="hover:underline" style={{ color: 'var(--text-primary)' }}>哲学家管理</Link>
      </div>
    </div>
  )
}
