import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

type TestId = 'mmpi' | 'mbti' | 'enneagram' | 'bigfive' | 'values8'

type TestConfig = {
  titleZh: string
  titleEn: string
}

type QuestionBase = { id: number; text: string; text_en?: string }
type MbtiQuestion = QuestionBase & { scoreA: 'E' | 'S' | 'T' | 'J' | 'N' | 'F' | 'P' | 'I'; scoreB: 'E' | 'S' | 'T' | 'J' | 'N' | 'F' | 'P' | 'I' }
type EnneagramQuestion = QuestionBase & { type: number }
type Values8Question = QuestionBase & { effect: { econ: number; dipl: number; govt: number; scty: number } }
type BigFiveKey = { dimension: 'N' | 'E' | 'O' | 'A' | 'C'; reverse: boolean }
type MmpiKey = { key: 0 | 1; scales: string[] }

const TEST_MAP: Record<TestId, TestConfig> = {
  mmpi: { titleZh: 'MMPI', titleEn: 'MMPI' },
  mbti: { titleZh: 'MBTI', titleEn: 'MBTI' },
  enneagram: { titleZh: '九型人格', titleEn: 'Enneagram' },
  bigfive: { titleZh: '大五人格', titleEn: 'Big Five' },
  values8: { titleZh: '8values', titleEn: '8values' },
}

export function TestHost() {
  const { testId } = useParams<{ testId: string }>()
  const { language, t } = useLanguage()
  const { authenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro')
  const [questions, setQuestions] = useState<QuestionBase[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedDraft, setSavedDraft] = useState<{ answers: Record<string, number>; currentIndex: number } | null>(null)
  const [resultNode, setResultNode] = useState<ReactNode | null>(null)
  const [testCount, setTestCount] = useState(566)
  const [mmpiGender, setMmpiGender] = useState<'M' | 'F'>('M')
  const [mmpiAge, setMmpiAge] = useState<'16-25' | '26-35' | '36-45' | '46-55'>('16-25')
  const [bigFiveGender, setBigFiveGender] = useState<'M' | 'F'>('M')

  const DRAFT_PREFIX = 'test_draft_'

  const testConfig = useMemo(() => {
    if (!testId) return null
    return TEST_MAP[testId as TestId] ?? null
  }, [testId])

  const draftKey = `${DRAFT_PREFIX}${testId ?? 'unknown'}`

  useEffect(() => {
    if (!testId || !testConfig) return
    setError(null)
    setPhase('intro')
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
    setResultNode(null)
    try {
      const raw = localStorage.getItem(draftKey)
      setSavedDraft(raw ? JSON.parse(raw) : null)
    } catch {
      setSavedDraft(null)
    }
  }, [testId, testConfig, draftKey])

  const saveDraft = (nextAnswers: Record<string, number>, nextIndex: number) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ answers: nextAnswers, currentIndex: nextIndex }))
    } catch {
      // ignore
    }
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey)
      setSavedDraft(null)
    } catch {
      // ignore
    }
  }

  const postResultIfNeeded = async (type: string, summary: string, payload: object) => {
    if (!authenticated) return
    try {
      const body = new URLSearchParams({
        testType: type,
        resultSummary: summary,
        resultJson: JSON.stringify(payload),
        isPublic: 'false',
      })
      await fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: body.toString(),
      })
    } catch {
      // ignore
    }
  }

  const loadJson = async <T,>(path: string): Promise<T> => {
    const res = await fetch(path, { credentials: 'include' })
    if (!res.ok) throw new Error(`Failed to load ${path}`)
    return res.json() as Promise<T>
  }

  const beginTest = async (resume?: { answers: Record<string, number>; currentIndex: number }) => {
    if (!testId || !testConfig) return
    setLoading(true)
    setError(null)
    try {
      if (testId === 'mbti') {
        const data = await loadJson<MbtiQuestion[]>('/data/mbti_questions.json')
        setQuestions(data)
      } else if (testId === 'enneagram') {
        const path = language === 'en' ? '/data/enneagram_questions_en.json' : '/data/enneagram_questions.json'
        const data = await loadJson<EnneagramQuestion[]>(path)
        setQuestions(data)
      } else if (testId === 'values8') {
        const data = await loadJson<Values8Question[]>('/data/values8_questions.json')
        setQuestions(data)
      } else if (testId === 'bigfive') {
        const data = await loadJson<QuestionBase[]>('/data/bigfive_questions.json')
        setQuestions(data)
      } else if (testId === 'mmpi') {
        const all = await loadJson<QuestionBase[]>('/data/mmpi_questions.json')
        setQuestions(all.slice(0, testCount))
      }

      const nextAnswers = resume?.answers ?? {}
      const nextIndex = resume?.currentIndex ?? 0
      setAnswers(nextAnswers)
      setCurrentIndex(nextIndex)
      setPhase('test')
      saveDraft(nextAnswers, nextIndex)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('加载失败', 'Load failed'))
    } finally {
      setLoading(false)
    }
  }

  const computeAndShowResult = async () => {
    if (!testId) return
    if (testId === 'mbti') {
      const rows = questions as MbtiQuestion[]
      const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
      for (const q of rows) {
        const val = answers[String(q.id)]
        if (val == null) continue
        if (val === 3) continue
        const weight = Math.abs(val - 3)
        if (val > 3) scores[q.scoreA] += weight
        else scores[q.scoreB] += weight
      }
      const type = `${scores.E >= scores.I ? 'E' : 'I'}${scores.S >= scores.N ? 'S' : 'N'}${scores.T >= scores.F ? 'T' : 'F'}${scores.J >= scores.P ? 'J' : 'P'}`
      setResultNode(
        <div className="space-y-4">
          <p className="text-lg">{t('你的类型', 'Your type')}: <strong>{type}</strong></p>
        </div>,
      )
      await postResultIfNeeded('mbti', type, { type, scores })
    } else if (testId === 'enneagram') {
      const rows = questions as EnneagramQuestion[]
      const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
      for (const q of rows) {
        const val = answers[String(q.id)]
        if (val != null) scores[q.type] += val
      }
      const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
      setResultNode(
        <div className="space-y-4">
          <p className="text-lg">{t('主类型', 'Main type')}: <strong>{top}</strong></p>
        </div>,
      )
      await postResultIfNeeded('enneagram', `${t('第', 'Type ')}${top}${t('型', '')}`, { scores, mainType: Number(top) })
    } else if (testId === 'values8') {
      const rows = questions as Values8Question[]
      const axes: Array<'econ' | 'dipl' | 'govt' | 'scty'> = ['econ', 'dipl', 'govt', 'scty']
      const totals: Record<string, number> = { econ: 0, dipl: 0, govt: 0, scty: 0 }
      const maxes: Record<string, number> = { econ: 0, dipl: 0, govt: 0, scty: 0 }
      for (const q of rows) {
        const val = answers[String(q.id)]
        for (const axis of axes) {
          const effect = q.effect?.[axis] ?? 0
          if (val != null) totals[axis] += val * effect
          maxes[axis] += Math.abs(effect)
        }
      }
      const pct = (axis: 'econ' | 'dipl' | 'govt' | 'scty') => {
        const max = maxes[axis] || 1
        return Math.round((100 * (max + totals[axis]) / (2 * max)) * 10) / 10
      }
      const result = { econ: pct('econ'), dipl: pct('dipl'), govt: pct('govt'), scty: pct('scty') }
      setResultNode(
        <div className="space-y-2">
          <p>Equality: {result.econ}%</p>
          <p>World: {result.dipl}%</p>
          <p>Liberty: {result.govt}%</p>
          <p>Progress: {result.scty}%</p>
        </div>,
      )
      await postResultIfNeeded('values8', `E${result.econ} D${result.dipl} G${result.govt} S${result.scty}`, { scores: result })
    } else if (testId === 'bigfive') {
      const keyData = await loadJson<{ items: Record<string, BigFiveKey> }>('/data/bigfive_scoring_key.json')
      const norms = await loadJson<{ norms: Record<'M' | 'F', { mean: Record<string, number>; sd: Record<string, number> }> }>('/data/bigfive_norms.json')
      const raw: Record<'N' | 'E' | 'O' | 'A' | 'C', number> = { N: 0, E: 0, O: 0, A: 0, C: 0 }
      for (const q of questions) {
        const k = keyData.items[String(q.id)]
        const a = answers[String(q.id)]
        if (!k || a == null) continue
        const zeroBased = a - 1
        const score = k.reverse ? 4 - zeroBased : zeroBased
        raw[k.dimension] += score
      }
      const tScore = (d: 'N' | 'E' | 'O' | 'A' | 'C') => {
        const mean = norms.norms[bigFiveGender].mean[d]
        const sd = norms.norms[bigFiveGender].sd[d]
        if (!sd) return null
        return Math.round((50 + 10 * ((raw[d] - mean) / sd)) * 10) / 10
      }
      const ts = { N: tScore('N'), E: tScore('E'), O: tScore('O'), A: tScore('A'), C: tScore('C') }
      setResultNode(
        <div className="space-y-2">
          <p>N: {raw.N} / T {ts.N ?? '-'}</p>
          <p>E: {raw.E} / T {ts.E ?? '-'}</p>
          <p>O: {raw.O} / T {ts.O ?? '-'}</p>
          <p>A: {raw.A} / T {ts.A ?? '-'}</p>
          <p>C: {raw.C} / T {ts.C ?? '-'}</p>
        </div>,
      )
      await postResultIfNeeded('bigfive', `N${ts.N} E${ts.E} O${ts.O} A${ts.A} C${ts.C}`, { raw, t: ts })
    } else if (testId === 'mmpi') {
      const keyData = await loadJson<{ items: Record<string, MmpiKey> }>('/data/mmpi_scoring_key.json')
      const norms = await loadJson<{ norms: Record<'M' | 'F', Record<'16-25' | '26-35' | '36-45' | '46-55', { mean: Record<string, number>; sd: Record<string, number> }>> }>('/data/mmpi_norms.json')
      const scalesOrder = ['Q', 'L', 'F', 'K', 'Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si', 'MAS', 'Dy', 'Do', 'Re', 'Cn']
      const raw: Record<string, number> = {}
      for (const code of scalesOrder) raw[code] = 0
      for (const q of questions) {
        const k = keyData.items[String(q.id)]
        const a = answers[String(q.id)]
        if (!k || a == null) continue
        if ((a as 0 | 1) !== k.key) continue
        for (const sc of k.scales) {
          if (sc === 'Q') continue
          raw[sc] = (raw[sc] || 0) + 1
        }
      }
      raw.Mf = mmpiGender === 'M' ? (raw['Mf-m'] || 0) : (raw['Mf-f'] || 0)
      const norm = norms.norms[mmpiGender][mmpiAge]
      const tscore: Record<string, number | null> = {}
      for (const code of scalesOrder) {
        const mean = norm.mean[code]
        const sd = norm.sd[code]
        tscore[code] = sd ? Math.round((50 + 10 * ((raw[code] - mean) / sd)) * 10) / 10 : null
      }
      setResultNode(
        <div className="space-y-2">
          {scalesOrder.map((code) => (
            <p key={code}>{code}: {raw[code]} / T {tscore[code] ?? '-'}</p>
          ))}
        </div>,
      )
      await postResultIfNeeded('mmpi', `L${tscore.L} F${tscore.F} K${tscore.K}`, { raw, t: tscore, count: testCount })
    }
    clearDraft()
    setPhase('result')
  }

  const onSelect = (value: number) => {
    const q = questions[currentIndex]
    if (!q) return
    const nextAnswers = { ...answers, [String(q.id)]: value }
    const nextIndex = Math.min(currentIndex + 1, questions.length - 1)
    setAnswers(nextAnswers)
    saveDraft(nextAnswers, nextIndex)
    if (currentIndex === questions.length - 1) {
      setAnswers(nextAnswers)
      void computeAndShowResult()
    } else {
      setCurrentIndex(nextIndex)
    }
  }

  if (!testConfig) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('测试不存在', 'Test not found')}
        </h1>
        <Link to="/tests" className="inline-block mt-4 underline" style={{ color: 'var(--text-secondary)' }}>
          {t('返回测试列表', 'Back to tests')}
        </Link>
      </div>
    )
  }

  const current = questions[currentIndex]
  const questionText = current ? ((language === 'en' && current.text_en) ? current.text_en : current.text) : ''

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t(testConfig.titleZh, testConfig.titleEn)}
        </h1>
      </div>

      <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}>
        {error && <p className="mb-4 text-sm" style={{ color: '#dc2626' }}>{error}</p>}

        {phase === 'intro' && (
          <div className="space-y-4">
            {savedDraft && (
              <div className="rounded-lg border p-3 flex gap-3 items-center" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="text-sm">{t('检测到未完成草稿，是否继续？', 'Unfinished draft found. Resume?')}</span>
                <button type="button" className="px-3 py-1 rounded text-sm" style={{ background: 'var(--color-primary)', color: 'var(--text-on-primary)' }} onClick={() => void beginTest(savedDraft)}>
                  {t('继续', 'Resume')}
                </button>
                <button type="button" className="px-3 py-1 rounded text-sm border" style={{ borderColor: 'var(--border-primary)' }} onClick={clearDraft}>
                  {t('清除', 'Discard')}
                </button>
              </div>
            )}

            {testId === 'mmpi' && (
              <div className="flex flex-wrap gap-3 items-center">
                <label className="text-sm">{t('题量', 'Item count')}</label>
                <select value={testCount} onChange={(e) => setTestCount(Number(e.target.value))} className="px-3 py-2 rounded border" style={{ borderColor: 'var(--border-primary)' }}>
                  <option value={566}>566</option>
                  <option value={399}>399</option>
                </select>
                <label className="text-sm">{t('性别', 'Gender')}</label>
                <select value={mmpiGender} onChange={(e) => setMmpiGender(e.target.value as 'M' | 'F')} className="px-3 py-2 rounded border" style={{ borderColor: 'var(--border-primary)' }}>
                  <option value="M">{t('男', 'Male')}</option>
                  <option value="F">{t('女', 'Female')}</option>
                </select>
                <label className="text-sm">{t('年龄段', 'Age')}</label>
                <select value={mmpiAge} onChange={(e) => setMmpiAge(e.target.value as '16-25' | '26-35' | '36-45' | '46-55')} className="px-3 py-2 rounded border" style={{ borderColor: 'var(--border-primary)' }}>
                  <option value="16-25">16-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-55">46-55</option>
                </select>
              </div>
            )}

            {testId === 'bigfive' && (
              <div className="flex items-center gap-3">
                <label className="text-sm">{t('性别', 'Gender')}</label>
                <select value={bigFiveGender} onChange={(e) => setBigFiveGender(e.target.value as 'M' | 'F')} className="px-3 py-2 rounded border" style={{ borderColor: 'var(--border-primary)' }}>
                  <option value="M">{t('男', 'Male')}</option>
                  <option value="F">{t('女', 'Female')}</option>
                </select>
              </div>
            )}

            <button type="button" disabled={loading} className="px-4 py-2 rounded" style={{ background: 'var(--color-primary)', color: 'var(--text-on-primary)' }} onClick={() => void beginTest()}>
              {loading ? t('加载中...', 'Loading...') : t('开始测试', 'Start test')}
            </button>
          </div>
        )}

        {phase === 'test' && current && (
          <div className="space-y-5">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('第', 'Question ')}{currentIndex + 1} / {questions.length}
            </p>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-primary)' }}>
              <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
            </div>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{questionText}</p>

            {testId === 'mmpi' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" className="px-4 py-3 rounded border" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelect(1)}>{t('是', 'True')}</button>
                <button type="button" className="px-4 py-3 rounded border" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelect(0)}>{t('否', 'False')}</button>
              </div>
            ) : testId === 'values8' ? (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[1, 0.5, 0, -0.5, -1].map((v) => (
                  <button key={v} type="button" className="px-3 py-3 rounded border text-sm" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelect(v)}>
                    {v === 1 ? t('非常同意', 'Strongly agree') : v === 0.5 ? t('同意', 'Agree') : v === 0 ? t('中立', 'Neutral') : v === -0.5 ? t('不同意', 'Disagree') : t('非常不同意', 'Strongly disagree')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map((v) => (
                  <button key={v} type="button" className="px-3 py-3 rounded border text-sm" style={{ borderColor: 'var(--border-primary)' }} onClick={() => onSelect(v)}>
                    {v === 5
                      ? t('非常符合', 'Very true of me')
                      : v === 4
                        ? t('比较符合', 'Somewhat true of me')
                        : v === 3
                          ? t('一般', 'Neither true nor false')
                          : v === 2
                            ? t('比较不符合', 'Somewhat false of me')
                            : t('非常不符合', 'Very false of me')}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button type="button" disabled={currentIndex === 0} onClick={() => {
                const next = Math.max(0, currentIndex - 1)
                setCurrentIndex(next)
                saveDraft(answers, next)
              }}>
                {t('上一题', 'Previous')}
              </button>
              <button type="button" disabled={currentIndex >= questions.length - 1} onClick={() => {
                const next = Math.min(questions.length - 1, currentIndex + 1)
                setCurrentIndex(next)
                saveDraft(answers, next)
              }}>
                {t('下一题', 'Next')}
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-4">
            {resultNode}
            <button type="button" className="px-4 py-2 rounded border" style={{ borderColor: 'var(--border-primary)' }} onClick={() => {
              setPhase('intro')
              setAnswers({})
              setCurrentIndex(0)
              setResultNode(null)
            }}>
              {t('重新测试', 'Restart')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
