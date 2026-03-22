import { apiGet } from './client'

export type HealthResponse = { success: boolean; timestamp: string }

export type PhilosopherNameItem = { id: number; displayName: string }
export type PhilosopherNamesResponse = {
  success: boolean
  items: PhilosopherNameItem[]
  totalCount: number
  offset: number
  limit: number
  hasMore: boolean
}

export type QuoteItem = { id: number; contentText: string; philosopherName: string }
export type SchoolNode = {
  id: number
  parentId: number | null
  displayName: string
  name: string
  nameEn: string | null
  hasChildren: boolean
  sortKey: string
}
export type SchoolDetail = {
  id: number
  name: string
  nameEn: string | null
  displayName: string
  description: string
  parentId: number | null
}
export type SchoolContentItem = {
  id: number
  title: string | null
  content: string | null
  contentEn?: string | null
  likeCount?: number
  isLiked?: boolean
  school?: {
    id: number
    displayName: string
    name?: string
    nameEn?: string | null
    parent?: {
      id: number
      displayName: string
      name?: string
      nameEn?: string | null
    } | null
  } | null
  philosopher?: {
    id: number
    displayName: string
    name?: string
    nameEn?: string | null
    dateRange?: string | null
  } | null
}
export type SchoolContentsPageResponse = {
  success: boolean
  contents: SchoolContentItem[]
  hasMore: boolean
  totalElements?: number
  currentPage?: number
}

export type PhilosopherData = {
  id: number
  name: string
  nameEn: string | null
  displayName: string
  displayBiography: string
  dateRange: string
  schools: { id: number; displayName: string }[]
  contents: Array<{
    id: number
    title: string
    content: string
    likeCount: number
    isLiked?: boolean
    commentCount: number
    school?: { id: number; displayName: string }
  }>
  hasMore?: boolean
}

export const philosophyApi = {
  health: () => apiGet<HealthResponse>('/health'),
  philosopherNames: (offset = 0, limit = 30) =>
    apiGet<PhilosopherNamesResponse>(`/philosophers/names?offset=${offset}&limit=${limit}`),
  philosopher: (id: number) => apiGet<{ success: boolean; philosopher: PhilosopherData; hasMore: boolean }>(`/philosophers/${id}`),
  randomQuotes: (count = 12, excludeIds?: string) =>
    apiGet<QuoteItem[]>(`/quotes/random?count=${count}${excludeIds ? `&excludeIds=${excludeIds}` : ''}`),
  schoolNodes: () => apiGet<SchoolNode[]>('/schools/nodes'),
  schoolDetail: (id: number) => apiGet<SchoolDetail>('/schools/detail?id=' + id),
  schoolContents: (id: number, page = 0, size = 10) =>
    apiGet<SchoolContentsPageResponse>(`/schools/contents/more?id=${id}&page=${page}&size=${size}`),
  search: (query: string) =>
    apiGet<{
      success: boolean
      query: string
      philosophers: unknown[]
      schools: unknown[]
      contents: unknown[]
      totalResults: number
    }>(`/search?query=${encodeURIComponent(query)}`),
  contentById: (id: number) =>
    apiGet<{
      success: boolean
      content: {
        id: number
        title?: string | null
        content?: string | null
        contentEn?: string | null
        likeCount: number
        commentCount: number
        isLiked: boolean
        school?: { id: number; displayName: string; parent?: { id: number; displayName: string } }
        philosopher?: { id: number; displayName: string; dateRange?: string }
      }
    }>(`/contents/${id}`),
  commentsByContentId: (contentId: number) =>
    apiGet<{
      success: boolean
      comments: Array<{
        id: number
        body: string
        createdAt: string | null
        parentId: number | null
        user?: { id: number; username: string }
        replies: Array<{ id: number; body: string; createdAt: string | null; user?: { id: number; username: string } }>
      }>
    }>(`/comments/content/${contentId}`),
}

export async function apiPostComment(contentId: number, body: string, parentId?: number) {
  const res = await fetch(`/api/comments/content/${contentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ body, parentId: parentId ?? null }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '评论失败')
  return data
}

export async function apiDeleteComment(commentId: number) {
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '删除失败')
  return data
}
