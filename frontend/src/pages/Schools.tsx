import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  philosophyApi,
  type SchoolNode,
  type SchoolDetail,
  type SchoolContentItem,
} from '../api/philosophy'
import { useLanguage } from '../contexts/LanguageContext'
import { ContentCard } from '../components/ContentCard'

function buildTree(nodes: SchoolNode[]): SchoolNode[] {
  const byParent = new Map<number | null, SchoolNode[]>()
  for (const n of nodes) {
    const key = n.parentId ?? 0
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(n)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''))
  }
  return byParent.get(0) ?? []
}

function TreeNode({
  node,
  nodes,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  t,
  level = 0,
}: {
  node: SchoolNode
  nodes: SchoolNode[]
  selectedId: number | null
  expandedIds: Set<number>
  onToggle: (id: number) => void
  onSelect: (id: number, expandNode?: boolean) => void
  t: (zh: string, en: string) => string
  level?: number
}) {
  const children = nodes.filter((n) => n.parentId === node.id)
  const open = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const hasChildren = children.length > 0

  return (
    <div className="pl-2" style={{ marginLeft: level * 12 }}>
      <div className="flex w-full items-start justify-between gap-2 rounded py-1 text-left">
        <button
          onClick={() => {
            if (hasChildren) {
              if (isSelected) {
                onToggle(node.id)
                return
              }
              onSelect(node.id, true)
              return
            }
            onSelect(node.id)
          }}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={`block whitespace-normal break-words text-left text-sm leading-5 ${isSelected ? 'font-bold' : ''}`}
            style={{ color: isSelected ? '#111827' : 'var(--text-secondary)' }}
          >
            {node.displayName}
          </span>
        </button>
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="shrink-0 rounded px-1 py-0.5 hover:bg-black/5 cursor-pointer"
            title={open ? t('收起', 'Collapse') : t('展开', 'Expand')}
          >
            <span
              className="text-xs inline-block"
              style={{
                color: isSelected ? '#111827' : 'var(--text-secondary)',
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              {'>'}
            </span>
          </button>
        ) : null}
      </div>
      {open && hasChildren && (
        <div className="mt-1 space-y-1">
          {children.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              nodes={nodes}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              t={t}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function collectAncestorIds(id: number, nodes: SchoolNode[]): number[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const result: number[] = []
  let cur = byId.get(id)
  while (cur?.parentId) {
    result.push(cur.parentId)
    cur = byId.get(cur.parentId)
  }
  return result
}

export function Schools() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const skipNextUrlSync = useRef(false)
  const [nodes, setNodes] = useState<SchoolNode[]>([])
  const [detail, setDetail] = useState<SchoolDetail | null>(null)
  const [contents, setContents] = useState<SchoolContentItem[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingContents, setLoadingContents] = useState(false)

  const byParent = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const n of nodes) {
      const key = n.parentId ?? 0
      const old = map.get(key) || []
      map.set(key, [...old, n.id])
    }
    return map
  }, [nodes])

  const collectDescendantIds = (id: number): number[] => {
    const result: number[] = []
    const stack = [...(byParent.get(id) || [])]
    while (stack.length > 0) {
      const cur = stack.pop()!
      result.push(cur)
      const children = byParent.get(cur) || []
      for (const child of children) stack.push(child)
    }
    return result
  }

  const selectNode = (id: number, expandNode = false) => {
    setSelectedId(id)
    skipNextUrlSync.current = true
    setSearchParams({ schoolId: String(id) })
    if (expandNode) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        collectAncestorIds(id, nodes).forEach((aid) => next.add(aid))
        return next
      })
    }
  }

  const toggleNode = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        const descendants = collectDescendantIds(id)
        next.delete(id)
        for (const d of descendants) next.delete(d)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    philosophyApi
      .schoolNodes()
      .then((data) => {
        setNodes(data)
        const schoolIdParam = searchParams.get('schoolId')
        const schoolId = schoolIdParam ? parseInt(schoolIdParam, 10) : NaN
        const targetExists = !isNaN(schoolId) && data.some((n) => n.id === schoolId)
        if (targetExists) {
          setSelectedId(schoolId)
          setExpandedIds(new Set(collectAncestorIds(schoolId, data)))
        } else {
          const top = buildTree(data)
          if (top[0]) {
            setSelectedId(top[0].id)
            setSearchParams({ schoolId: String(top[0].id) })
            setExpandedIds(new Set())
          }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // 当通过链接进入时响应 URL 中 schoolId 的变化（例如从内容卡片点击流派链接）
  useEffect(() => {
    if (nodes.length === 0) return
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }
    const schoolIdParam = searchParams.get('schoolId')
    const schoolId = schoolIdParam ? parseInt(schoolIdParam, 10) : NaN
    const targetExists = !isNaN(schoolId) && nodes.some((n) => n.id === schoolId)
    if (targetExists && schoolId !== selectedId) {
      setSelectedId(schoolId)
      setExpandedIds(new Set(collectAncestorIds(schoolId, nodes)))
    }
  }, [searchParams, nodes, selectedId])

  useEffect(() => {
    if (!selectedId) return
    setLoadingDetail(true)
    philosophyApi
      .schoolDetail(selectedId)
      .then(setDetail)
      .finally(() => setLoadingDetail(false))

    setLoadingContents(true)
    philosophyApi
      .schoolContents(selectedId, 0, 10)
      .then((res) => {
        setContents(res.contents || [])
        setHasMore(Boolean(res.hasMore))
        setPage(0)
      })
      .finally(() => setLoadingContents(false))
  }, [selectedId])

  const tree = buildTree(nodes)

  const loadMore = async () => {
    if (!selectedId || loadingContents || !hasMore) return
    const nextPage = page + 1
    setLoadingContents(true)
    try {
      const res = await philosophyApi.schoolContents(selectedId, nextPage, 10)
      setContents((prev) => [...prev, ...(res.contents || [])])
      setHasMore(Boolean(res.hasMore))
      setPage(nextPage)
    } finally {
      setLoadingContents(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <aside className="md:col-span-1 self-start">
        <div
          className="sticky top-20 rounded-lg border p-4 overflow-y-auto"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-primary)',
            maxHeight: 'calc(100vh - 6rem)',
          }}
        >
          {loading ? (
            <p className="text-sm">{t('加载中...', 'Loading...')}</p>
          ) : (
            <div className="space-y-1">
              {tree.map((n) => (
                <TreeNode
                  key={n.id}
                  node={n}
                  nodes={nodes}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onToggle={toggleNode}
                  onSelect={selectNode}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className="md:col-span-2 min-w-0">
        {selectedId && !loadingDetail && detail ? (
          <div className="rounded-lg border p-5 mb-6" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {detail.displayName}
            </h1>
            <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {detail.description || t('暂无描述', 'No description yet')}
            </p>
          </div>
        ) : selectedId && loadingDetail ? (
          <p className="text-sm mb-6">{t('加载流派信息中...', 'Loading school detail...')}</p>
        ) : (
          <p className="text-sm mb-6">{t('请从左侧选择流派', 'Select a school from the left')}</p>
        )}

        {selectedId ? (
          <div>
            {loadingContents && contents.length === 0 ? (
              <p className="text-sm">{t('加载内容中...', 'Loading contents...')}</p>
            ) : contents.length > 0 ? (
              <div className="space-y-4">
                {contents.map((item) => (
                  <ContentCard key={item.id} item={item} showSchool={true} showLikeButton={true} t={t} />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingContents}
                    className="px-4 py-2 rounded border text-sm"
                    style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  >
                    {loadingContents ? t('加载中...', 'Loading...') : t('加载更多', 'Load more')}
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border p-8 text-center text-sm" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                {t('该流派（含子流派）暂无可展示内容', 'No visible contents for this school and descendants')}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
