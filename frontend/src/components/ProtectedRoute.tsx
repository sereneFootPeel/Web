import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Props = {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin }: Props) {
  const { user, loading, authenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>
  }
  if (!authenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
