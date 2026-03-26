import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(username, password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.message || t('登录失败', 'Login failed'))
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('登录', 'Login')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            {t('用户名', 'Username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            {t('密码', 'Password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded font-medium disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'black' }}
        >
          {loading ? t('登录中...', 'Logging in...') : t('登录', 'Login')}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('还没有账号？', "Don't have an account?")}{' '}
        <Link to="/register" className="underline">
          {t('立即注册', 'Register now')}
        </Link>
      </p>
    </div>
  )
}
