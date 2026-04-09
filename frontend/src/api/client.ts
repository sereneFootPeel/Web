const API_BASE = '/api'

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  [key: string]: unknown
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${encodeURIComponent(name)}=`
  const matched = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  if (!matched) return null
  return decodeURIComponent(matched.slice(prefix.length))
}

function isMutationMethod(method?: string) {
  const upper = (method ?? 'GET').toUpperCase()
  return upper === 'POST' || upper === 'PUT' || upper === 'PATCH' || upper === 'DELETE'
}

async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE_NAME)
  if (existing) return existing

  const res = await fetch(`${API_BASE}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null
  return readCookie(CSRF_COOKIE_NAME)
}

async function buildSecureHeaders(headers?: HeadersInit, method?: string) {
  const next = new Headers(headers)

  if (isMutationMethod(method) && !next.has(CSRF_HEADER_NAME)) {
    const token = await ensureCsrfToken()
    if (token) {
      next.set(CSRF_HEADER_NAME, token)
    }
  }

  return next
}

export async function fetchWithCredentials(input: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const method = (options?.method ?? 'GET').toUpperCase()
  const headers = await buildSecureHeaders(options?.headers, method)

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
