const API_BASE = '/api'
const AUTH_TOKEN_STORAGE_KEY = 'philosophy_jwt'

export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  [key: string]: unknown
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return getStorage()?.getItem(AUTH_TOKEN_STORAGE_KEY) ?? null
}

export function setAuthToken(token: string | null) {
  const storage = getStorage()
  if (!storage) return

  if (token && token.trim()) {
    storage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    return
  }

  storage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function clearAuthToken() {
  setAuthToken(null)
}

async function buildSecureHeaders(headers?: HeadersInit) {
  const next = new Headers(headers)

  const token = getAuthToken()
  if (token && !next.has('Authorization')) {
    next.set('Authorization', `Bearer ${token}`)
  }

  return next
}

export async function fetchWithCredentials(input: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const method = (options?.method ?? 'GET').toUpperCase()
  const headers = await buildSecureHeaders(options?.headers)

  return fetch(input, {
    ...options,
    method,
    headers,
    credentials: options?.credentials ?? 'include',
  })
}

export async function apiGet<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetchWithCredentials(`${API_BASE}${path}`, {
    ...options,
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetchWithCredentials(`${API_BASE}${path}`, {
    ...options,
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
