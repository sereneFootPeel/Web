import { apiGet, fetchWithCredentials } from './client'

export type ForumUser = { id: number; username: string }

export type ForumCategory = {
  id: number
  slug: string
  name: string
  nameEn: string
  description?: string | null
  descriptionEn?: string | null
}

export type ForumThreadSummary = {
  id: number
  title: string
  excerpt: string
  replyCount: number
  viewCount: number
  pinned: boolean
  locked: boolean
  createdAt: string | null
  lastActivityAt: string | null
  user?: ForumUser | null
  category?: ForumCategory | null
}

export type ForumReply = {
  id: number
  body: string
  createdAt: string | null
  updatedAt: string | null
  edited: boolean
  parentId: number | null
  user?: ForumUser | null
  replies: ForumReply[]
}

export type ForumThreadDetail = ForumThreadSummary & {
  body: string
  updatedAt: string | null
  edited: boolean
  replies: ForumReply[]
}

export type ForumThreadPage = {
  success: boolean
  threads: ForumThreadSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasMore: boolean
}

async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetchWithCredentials(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data as { success?: boolean }).success === false) {
    throw new Error((data as { message?: string }).message || `HTTP ${res.status}`)
  }
  return data as T
}

export const forumApi = {
  categories: () => apiGet<{ success: boolean; categories: ForumCategory[] }>('/forum/categories'),
  threads: (params: { categoryId?: number; page?: number; size?: number }) => {
    const search = new URLSearchParams()
    if (params.categoryId) search.set('categoryId', String(params.categoryId))
    search.set('page', String(params.page ?? 0))
    search.set('size', String(params.size ?? 20))
    return apiGet<ForumThreadPage>(`/forum/threads?${search.toString()}`)
  },
  thread: (id: number, countView = true) =>
    apiGet<{ success: boolean; thread: ForumThreadDetail }>(`/forum/threads/${id}?countView=${countView ? 'true' : 'false'}`),
  createThread: (body: { categoryId: number; title: string; body: string }) =>
    send<{ success: boolean; id: number; message?: string }>('/forum/threads', 'POST', body),
  updateThread: (id: number, body: { categoryId: number; title: string; body: string }) =>
    send<{ success: boolean; message?: string }>(`/forum/threads/${id}`, 'PUT', body),
  deleteThread: (id: number) => send<{ success: boolean; message?: string }>(`/forum/threads/${id}`, 'DELETE'),
  createReply: (threadId: number, body: { body: string; parentId?: number | null }) =>
    send<{ success: boolean; id: number; message?: string }>(`/forum/threads/${threadId}/replies`, 'POST', body),
  updateReply: (id: number, body: string) =>
    send<{ success: boolean; message?: string }>(`/forum/replies/${id}`, 'PUT', { body }),
  deleteReply: (id: number) => send<{ success: boolean; message?: string }>(`/forum/replies/${id}`, 'DELETE'),
  pinThread: (id: number, pinned: boolean) =>
    send<{ success: boolean; message?: string }>(`/forum/threads/${id}/pin`, 'POST', { pinned }),
  lockThread: (id: number, locked: boolean) =>
    send<{ success: boolean; message?: string }>(`/forum/threads/${id}/lock`, 'POST', { locked }),
}

export function categoryLabel(category: ForumCategory | null | undefined, language: 'zh' | 'en') {
  if (!category) return ''
  return language === 'en' ? category.nameEn || category.name : category.name
}

export function formatForumTime(value: string | null, language: 'zh' | 'en') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const locale = language === 'en' ? 'en-US' : 'zh-CN'
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
