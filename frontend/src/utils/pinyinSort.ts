const pinyinCollator = new Intl.Collator('zh-CN-u-co-pinyin', {
  sensitivity: 'base',
  numeric: true,
})

function normalizeSortText(value?: string | null) {
  return (value ?? '').trim()
}

export function comparePinyinText(left?: string | null, right?: string | null) {
  const a = normalizeSortText(left)
  const b = normalizeSortText(right)

  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1

  const compared = pinyinCollator.compare(a, b)
  if (compared !== 0) {
    return compared
  }

  return a.localeCompare(b, 'zh-CN', { sensitivity: 'base', numeric: true })
}

export function upsertById<T extends { id: number }>(items: T[], nextItem: T) {
  const index = items.findIndex((item) => item.id === nextItem.id)
  if (index === -1) {
    return [...items, nextItem]
  }

  const next = [...items]
  next[index] = nextItem
  return next
}

export function removeById<T extends { id: number }>(items: T[], id: number) {
  return items.filter((item) => item.id !== id)
}

export function sortList<T>(items: T[], compare: (left: T, right: T) => number) {
  return [...items].sort(compare)
}

