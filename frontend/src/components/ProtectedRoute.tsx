import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { signalDenied } from '../archiveTone'

type Props = {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin }: Props) {
  const { user, loading, authenticated } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const denied = !loading && (!authenticated || !user || (requireAdmin === true && user.role !== 'ADMIN'))

  useEffect(() => {
    if (denied) signalDenied()
  }, [denied, location.pathname])

  if (loading) {
    return <div className="p-8 text-center">{t('加载中...', 'Loading...')}</div>
  }
  if (!authenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
