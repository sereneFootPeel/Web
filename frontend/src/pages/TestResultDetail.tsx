import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

type ScoreRow =
  | { rowType: 'enneagram'; label: string; value: number; max: number }
  | { rowType: 'mbti_axis'; leftCode: string; rightCode: string; leftCount: number; rightCount: number }
  | { rowType: 'values8_axis'; leftLabel: string; rightLabel: string; leftPct: number; rightPct: number }
  | { rowType: 'kv'; key: string; value: string }

type DetailData = {
  id: number
  testType: string
  resultSummary: string
  createdAt: string | null
  userId: number | null
  scoreRows: ScoreRow[]
}

export function TestResultDetail() {
  const { id } = useParams()
  const { language, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DetailData | null>(null)

  useEffect(() => {
    if (!id) {
      setError(t('记录不存在', 'Record not found'))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`/api/test-results/${id}`, { credentials: 'include' })
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

  const pageTitle = (type: string) => {
    const tType = (type || '').toLowerCase()
    if (tType === 'mbti') return t('你的 MBTI 类型', 'Your MBTI Type')
    if (tType === 'enneagram') return t('测验结果', 'Your Result')
    if (tType === 'values8') return t('你的 8values 结果', 'Your 8values Result')
    if (tType === 'bigfive') return t('测验结果（原始分 / T 分）', 'Results (Raw / T Scores)')
    if (tType === 'mmpi') return t('测验结果（原始分 / T 分）', 'Results (Raw / T Scores)')
    return t('测验结果', 'Test Result')
  }

  const rowLabel = (row: ScoreRow) => {
    if (row.rowType === 'mbti_axis') {
      const names: Record<string, [string, string]> = {
        E: ['外向', 'Extraverted'],
        I: ['内向', 'Introverted'],
        S: ['实感', 'Sensing'],
        N: ['直觉', 'Intuitive'],
        T: ['思考', 'Thinking'],
        F: ['情感', 'Feeling'],
        J: ['判断', 'Judging'],
        P: ['知觉', 'Perceiving'],
      }
      const left = names[row.leftCode]
      const right = names[row.rightCode]
      if (left && right) {
        return `${row.leftCode}(${t(left[0], left[1])}) / ${row.rightCode}(${t(right[0], right[1])})`
      }
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

  if (loading) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('加载中...', 'Loading...')}</div>
  if (error) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{error}</div>
  if (!data) return <div className="p-8" style={{ color: 'var(--text-secondary)' }}>{t('记录不存在', 'Record not found')}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link to={profileLink} className="text-sm underline" style={{ color: 'var(--text-secondary)' }}>
          {t('返回个人主页', 'Back to profile')}
        </Link>
      </div>
      <div className="rounded-xl shadow-md p-6 border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{testTypeLabel(data.testType)}</div>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{pageTitle(data.testType)}</h1>

        <div
          className="mt-4 mb-6 p-4 rounded-lg border-2"
          style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('结果', 'Result')}
          </div>
          <div className="text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {data.resultSummary}
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {formatDate(data.createdAt)}
          </div>
        </div>

        <div className="overflow-x-auto">
          {data.scoreRows.length > 0 ? data.scoreRows.map((row, idx) => {
            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 text-sm py-2 border-b"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }}
              >
                <div className="col-span-7 sm:col-span-8">{rowLabel(row)}</div>
                <div className="col-span-5 sm:col-span-4 text-right">{rowValue(row)}</div>
              </div>
            )
          }) : (
            <div className="text-sm py-2" style={{ color: 'var(--text-secondary)' }}>
              {t('暂无详细分数', 'No detailed scores')}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            to={retakePath(data.testType)}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium"
            style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
          >
            {t('重新测试', 'Restart Test')}
          </Link>
        </div>
      </div>
    </div>
  )
}
