import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { fetchWithCredentials } from '../api/client'

export type User = {
  id: number
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  language?: 'zh' | 'en'
  theme?: string
}

type AuthState = {
  user: User | null
  loading: boolean
  authenticated: boolean
}

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  register: (data: { username: string; email: string; password: string; verificationCode: string }) => Promise<{ success: boolean; message?: string }>
  sendCode: (email: string) => Promise<{ success: boolean; message?: string }>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, authenticated: false })

  const refresh = useCallback(async () => {
    try {
      const res = await fetchWithCredentials('/api/auth/me')
      const data = await res.json()
      setState({
        user: data.authenticated && data.user ? data.user : null,
        loading: false,
        authenticated: !!data.authenticated,
      })
    } catch {
      setState({ user: null, loading: false, authenticated: false })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetchWithCredentials('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.success) {
      setState({ user: data.user, loading: false, authenticated: true })
      return { success: true }
    }
    return { success: false, message: data.message || '登录失败' }
  }, [])

  const logout = useCallback(async () => {
    await fetchWithCredentials('/api/auth/logout', { method: 'POST' })
    setState({ user: null, loading: false, authenticated: false })
  }, [])

  const register = useCallback(async (d: { username: string; email: string; password: string; verificationCode: string }) => {
    const res = await fetchWithCredentials('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    })
    const data = await res.json()
    if (data.success) {
      setState({ user: data.user, loading: false, authenticated: true })
      return { success: true }
    }
    return { success: false, message: data.message || '注册失败' }
  }, [])

  const sendCode = useCallback(async (email: string) => {
    const res = await fetchWithCredentials('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (data.success) return { success: true }
    return { success: false, message: data.message || '发送失败' }
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    sendCode,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
