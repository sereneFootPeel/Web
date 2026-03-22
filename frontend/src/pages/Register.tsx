import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeCooldown, setCodeCooldown] = useState(0)
  const { register, sendCode } = useAuth()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('请输入邮箱')
      return
    }
    setError('')
    const result = await sendCode(email)
    if (result.success) {
      setCodeCooldown(60)
      const t = setInterval(() => {
        setCodeCooldown((c) => {
          if (c <= 1) clearInterval(t)
          return c - 1
        })
      }, 1000)
    } else {
      setError(result.message || '发送失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register({ username, email, password, verificationCode: code })
    setLoading(false)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setError(result.message || '注册失败')
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        注册
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            用户名
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
            邮箱
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded border"
              style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
              required
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={codeCooldown > 0}
              className="px-4 py-2 rounded text-sm whitespace-nowrap disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              {codeCooldown > 0 ? `${codeCooldown}秒` : '获取验证码'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            验证码
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            密码（至少6位）
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded border"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded font-medium text-white disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        已有账号？ <Link to="/login" className="underline">去登录</Link>
      </p>
    </div>
  )
}
