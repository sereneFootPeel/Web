export function normalizeToHistoryCenturyAnchor(year: number): number {
  const safeYear = year === 0 ? 1 : year
  if (safeYear > 0) {
    return Math.ceil(safeYear / 100) * 100
  }
  return Math.floor(safeYear / 100) * 100
}

