import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { fetchWithCredentials } from '../api/client'
import { MBTI_DIMENSIONS, getMbtiPolesLabel, getMbtiTypeDescription, type SupportedLanguage } from '../utils/mbti'

type ScoreRow =
  | { rowType: 'enneagram'; label: string; value: number; max: number }
  | { rowType: 'mbti_axis'; leftCode: string; rightCode: string; leftCount: number; rightCount: number; leftPct?: number; rightPct?: number }
  | { rowType: 'values8_axis'; leftLabel: string; rightLabel: string; leftPct: number; rightPct: number }
  | { rowType: 'kv'; key: string; value: string; numericValue?: number; max?: number }

type DetailData = {
  id: number
  testType: string
  resultSummary: string
  createdAt: string | null
  userId: number | null
  isOwner: boolean
  resultJson: string | null
  scoreRows: ScoreRow[]
}

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumberMap(value: unknown): Record<string, number> {
  if (!isObject(value)) return {}
  return Object.entries(value).reduce<Record<string, number>>((acc, [key, item]) => {
    if (typeof item === 'number' && Number.isFinite(item)) acc[key] = item
    return acc
  }, {})
}

function toStringMap(value: unknown): Record<string, string> {
  if (!isObject(value)) return {}
  return Object.entries(value).reduce<Record<string, string>>((acc, [key, item]) => {
    if (typeof item === 'string') acc[key] = item
    return acc
  }, {})
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

export function TestResultDetail() {
  const { id } = useParams()
  const { language, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DetailData | null>(null)
  const uiLanguage: SupportedLanguage = language === 'en' ? 'en' : 'zh'

  useEffect(() => {
    if (!id) {
      setError(t('记录不存在', 'Record not found'))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetchWithCredentials(`/api/test-results/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(t('加载失败', 'Failed to load'))
        const body = await r.json()
        if (!body?.success) throw new Error(body?.message || t('记录不存在或无权查看', 'Record not found or access denied'))
        return body as DetailData & { success: boolean }
      })
      .then((body) => {
        setData({
          id: body.id,
          testType: body.testType,
          resultSummary: body.resultSummary,
          createdAt: body.createdAt,
          userId: body.userId,
          isOwner: Boolean(body.isOwner),
          resultJson: typeof body.resultJson === 'string' ? body.resultJson : null,
          scoreRows: Array.isArray(body.scoreRows) ? body.scoreRows : [],
        })
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : t('加载失败', 'Failed to load'))
      })
      .finally(() => setLoading(false))
  }, [id, t])

  const profileLink = useMemo(() => {
    if (!data?.userId) return '/user/profile'
    return `/user/profile/${data.userId}`
  }, [data?.userId])

  const parsedResult = useMemo<JsonObject | null>(() => {
    if (!data?.resultJson) return null
    try {
      const parsed: unknown = JSON.parse(data.resultJson)
      return isObject(parsed) ? parsed : null
    } catch {
      return null
    }
  }, [data?.resultJson])

  const formattedRawJson = useMemo(() => {
    if (!data?.resultJson) return ''
    try {
      return JSON.stringify(JSON.parse(data.resultJson), null, 2)
    } catch {
      return data.resultJson
    }
  }, [data?.resultJson])

  const formatDate = (s: string | null) => {
    if (!s) return '-'
    try {
      const d = new Date(s)
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return s
    }
  }

  const testTypeLabel = (type: string) => {
    const tType = (type || '').toLowerCase()
    if (tType === 'mbti') return 'MBTI'
    if (tType === 'enneagram') return t('九型人格', 'Enneagram')
    if (tType === 'values8') return '8values'
    if (tType === 'bigfive') return t('大五人格', 'Big Five')
    if (tType === 'mmpi') return 'MMPI'
    return type
  }

  const retakePath = (type: string) => {
    const tType = (type || '').toLowerCase()
    if (tType === 'mbti') return '/tests/mbti'
    if (tType === 'enneagram') return '/tests/enneagram'
    if (tType === 'values8') return '/tests/values8'
    if (tType === 'bigfive') return '/tests/bigfive'
    if (tType === 'mmpi') return '/tests/mmpi'
    return '/tests'
  }

  const rowLabel = (row: ScoreRow) => {
    if (row.rowType === 'mbti_axis') {
      const dimension = MBTI_DIMENSIONS.find((item) => item.leftCode === row.leftCode && item.rightCode === row.rightCode)
      if (dimension) return getMbtiPolesLabel(dimension, uiLanguage)
      return `${row.leftCode} / ${row.rightCode}`
    }
    if (row.rowType === 'values8_axis') {
      return `${row.leftLabel} / ${row.rightLabel}`
    }
    if (row.rowType === 'enneagram') return row.label
    return row.key
  }

  const rowValue = (row: ScoreRow) => {
    if (row.rowType === 'mbti_axis') {
      return `${row.leftCode}: ${row.leftCount}    ${row.rightCode}: ${row.rightCount}`
    }
    if (row.rowType === 'values8_axis') {
      return `${row.leftPct}% / ${row.rightPct}%`
    }
    if (row.rowType === 'enneagram') return `${row.value}/${row.max}`
    return row.value
  }

  const renderFallbackTable = () => {
    if (!detail.scoreRows.length) {
      return (
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('暂无详细分数', 'No detailed scores')}
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('项目', 'Item')}</th>
              <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('得分', 'Score')}</th>
            </tr>
          </thead>
          <tbody>
            {detail.scoreRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td className="py-2 px-2" style={{ color: 'var(--text-primary)' }}>{rowLabel(row)}</td>
                <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{rowValue(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderEnneagramDetail = () => {
    const scores = toNumberMap(parsedResult?.scores)
    const typeNames = toStringMap(parsedResult?.typeNames)
    const order = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    if (!order.some((item) => String(item) in scores)) {
      return renderFallbackTable()
    }

    const sorted = [...order].sort((a, b) => {
      const aScore = scores[String(a)] ?? 0
      const bScore = scores[String(b)] ?? 0
      return bScore !== aScore ? bScore - aScore : a - b
    })
    const main = sorted[0]

    return (
      <div>
        <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {main ? `${t('第', 'Type ')}${language === 'en' ? `${main} ` : `${main}型 `}${typeNames[String(main)] ?? ''}`.trim() : ''}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left py-2 px-2">{t('类型', 'Type')}</th>
                <th className="text-left py-2 px-2">{t('名称', 'Name')}</th>
                <th className="text-right py-2 px-2">{t('得分', 'Score')}</th>
              </tr>
            </thead>
            <tbody>
              {order.map((item) => (
                <tr key={item} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item}</td>
                  <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{typeNames[String(item)] ?? ''}</td>
                  <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{scores[String(item)] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderMbtiDetail = () => {
    const scoreRows = detail.scoreRows.filter((row): row is Extract<ScoreRow, { rowType: 'mbti_axis' }> => row.rowType === 'mbti_axis')
    const scores = toNumberMap(parsedResult?.scores)
    const resultType = typeof parsedResult?.type === 'string' && parsedResult.type.trim() ? parsedResult.type.trim() : detail.resultSummary
    const description = getMbtiTypeDescription(resultType, uiLanguage)

    if (!scoreRows.length && !MBTI_DIMENSIONS.some((item) => item.leftCode in scores || item.rightCode in scores)) {
      return renderFallbackTable()
    }

    return (
      <div>
        <p className="font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('类型：', 'Type: ')}
          <strong style={{ color: 'var(--text-primary)' }}>{resultType}</strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left py-2 px-2">{t('维度', 'Dimension')}</th>
                <th className="text-left py-2 px-2">{t('两极', 'Poles')}</th>
                <th className="text-right py-2 px-2">{t('得分', 'Score')}</th>
              </tr>
            </thead>
            <tbody>
              {MBTI_DIMENSIONS.map((item) => {
                const matchedRow = scoreRows.find((row) => row.leftCode === item.leftCode && row.rightCode === item.rightCode)
                const leftScore = matchedRow?.leftCount ?? scores[item.leftCode] ?? 0
                const rightScore = matchedRow?.rightCount ?? scores[item.rightCode] ?? 0

                return (
                  <tr key={item.dimension} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item.dimension}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{getMbtiPolesLabel(item, uiLanguage)}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {item.leftCode}: {leftScore} &nbsp; {item.rightCode}: {rightScore}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {description && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
    )
  }

  const renderValues8Detail = () => {
    const scores = toNumberMap(parsedResult?.scores)
    const labels = isObject(parsedResult?.labels) ? parsedResult.labels : {}
    const axes = ['econ', 'dipl', 'govt', 'scty']

    if (!axes.some((axis) => axis in scores)) {
      return renderFallbackTable()
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <th className="text-left py-2 px-2">{t('轴', 'Axis')}</th>
              <th className="text-right py-2 px-2">{t('得分', 'Score')}</th>
            </tr>
          </thead>
          <tbody>
            {axes.map((axis) => {
              const raw = scores[axis] ?? 0
              const leftPct = axis === 'econ' || axis === 'govt' ? raw : round1(100 - raw)
              const rightPct = round1(100 - leftPct)
              const rawLabels = Array.isArray(labels[axis]) ? labels[axis] : []
              const leftLabel = typeof rawLabels[0] === 'string' ? rawLabels[0] : axis
              const rightLabel = typeof rawLabels[1] === 'string' ? rawLabels[1] : ''

              return (
                <tr key={axis} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{leftLabel} ↔ {rightLabel}</td>
                  <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>
                    {leftLabel} {leftPct}% &nbsp; {rightLabel} {rightPct}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderDetailContent = () => {
    const tType = (detail.testType || '').toLowerCase()
    if (tType === 'enneagram') return renderEnneagramDetail()
    if (tType === 'mbti') return renderMbtiDetail()
    if (tType === 'values8') return renderValues8Detail()
    return renderFallbackTable()
  }

  if (loading) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('加载中...', 'Loading...')}</div>
  if (error) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{error}</div>
  if (!data) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('记录不存在', 'Record not found')}</div>

  const detail = data

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to={profileLink} className="inline-flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="mr-2" aria-hidden="true">←</span>
          {data.isOwner ? t('返回我的主页', 'Back to my profile') : t('返回用户主页', 'Back to profile')}
        </Link>
      </div>
      <div className="rounded-lg shadow-md p-6 sm:p-8 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{testTypeLabel(data.testType)}</div>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.resultSummary}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>{formatDate(data.createdAt)}</p>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {renderDetailContent()}
          {!data.scoreRows.length && formattedRawJson && (
            <pre
              className="mt-4 text-xs p-4 rounded overflow-auto max-h-96"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {formattedRawJson}
            </pre>
          )}
        </div>

        <div className="mt-6 pt-4 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <Link
            to={profileLink}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
          >
            {t('返回主页', 'Back to profile')}
          </Link>
          <Link
            to={retakePath(data.testType)}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: '#FFFFFF', backgroundColor: '#111827', border: '1px solid #111827' }}
          >
            {t('重新测试', 'Retake Test')}
          </Link>
        </div>
      </div>
    </div>
  )
}
