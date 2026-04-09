import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchWithCredentials } from '../api/client'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { MBTI_DIMENSIONS, getMbtiPolesLabel, getMbtiTypeDescription, type SupportedLanguage } from '../utils/mbti'

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
type Values8Axis = 'econ' | 'dipl' | 'govt' | 'scty'

const TEST_MAP: Record<TestId, TestConfig> = {
  mmpi: { titleZh: 'MMPI', titleEn: 'MMPI' },
  mbti: { titleZh: 'MBTI', titleEn: 'MBTI' },
  enneagram: { titleZh: '九型人格', titleEn: 'Enneagram' },
  bigfive: { titleZh: '大五人格', titleEn: 'Big Five' },
  values8: { titleZh: '8values', titleEn: '8values' },
}

const ENNEAGRAM_TYPE_NAMES: Record<SupportedLanguage, Record<number, string>> = {
  zh: {
    1: '完美型', 2: '助人型', 3: '成就型', 4: '自我型', 5: '理智型', 6: '忠诚型', 7: '活跃型', 8: '领袖型', 9: '和平型',
  },
  en: {
    1: 'Perfectionist', 2: 'Helper', 3: 'Achiever', 4: 'Individualist', 5: 'Investigator', 6: 'Loyalist', 7: 'Enthusiast', 8: 'Challenger', 9: 'Peacemaker',
  },
}

const ENNEAGRAM_TYPE_DESCRIPTIONS: Record<SupportedLanguage, Record<number, string>> = {
  zh: {
    1: '讲原则、求完美，对自己和他人要求高，是非分明。',
    2: '乐于付出、善解人意，重视关系，渴望被需要。',
    3: '目标明确、追求成功与认可，效率高，重视形象。',
    4: '感性、追求独特与深度，情绪丰富，渴望被理解。',
    5: '理性、喜欢独处与思考，重视隐私与知识。',
    6: '谨慎、忠诚，重视安全与承诺，容易担心。',
    7: '乐观、爱玩，喜欢新鲜与自由，避免沉重。',
    8: '强势、直接，重视公平与力量，保护欲强。',
    9: '温和、随和，追求和谐，不愿冲突。',
  },
  en: {
    1: 'Principled, perfectionistic, high standards for self and others.',
    2: 'Caring, supportive, values relationships, wants to be needed.',
    3: 'Goal-oriented, seeks success and recognition, efficient.',
    4: 'Emotional, seeks uniqueness and depth, creative.',
    5: 'Analytical, values privacy and knowledge, observant.',
    6: 'Loyal, security-oriented, cautious, committed.',
    7: 'Optimistic, fun-loving, seeks variety and freedom.',
    8: 'Assertive, direct, values justice and strength.',
    9: 'Easygoing, peace-seeking, avoids conflict.',
  },
}

const VALUES8_LABELS: Record<SupportedLanguage, Record<Values8Axis, [string, string]>> = {
  zh: {
    econ: ['平等', '市场'],
    dipl: ['民族', '全球'],
    govt: ['自由', '权威'],
    scty: ['传统', '进步'],
  },
  en: {
    econ: ['Equality', 'Markets'],
    dipl: ['Nation', 'World'],
    govt: ['Liberty', 'Authority'],
    scty: ['Tradition', 'Progress'],
  },
}

const BIG_FIVE_CODES: Array<'N' | 'E' | 'O' | 'A' | 'C'> = ['N', 'E', 'O', 'A', 'C']
const BIG_FIVE_DIMENSION_NAMES: Record<SupportedLanguage, Record<'N' | 'E' | 'O' | 'A' | 'C', string>> = {
  zh: { N: '神经质', E: '外倾性', O: '开放性', A: '宜人性', C: '严谨性' },
  en: { N: 'Neuroticism', E: 'Extraversion', O: 'Openness', A: 'Agreeableness', C: 'Conscientiousness' },
}

const MMPI_SCALE_ORDER = ['Q', 'L', 'F', 'K', 'Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si', 'MAS', 'Dy', 'Do', 'Re', 'Cn']
const MMPI_SCALE_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  zh: {
    Q: '疑问', L: '说谎', F: '诈病', K: '校正', Hs: '疑病', D: '抑郁', Hy: '癔症', Pd: '病态人格',
    Mf: '男性化-女性化', 'Mf-m': '男子气', 'Mf-f': '女子气', Pa: '妄想', Pt: '精神衰弱', Sc: '精神分裂', Ma: '轻躁狂', Si: '社会内倾',
    MAS: '焦虑', Dy: '依赖', Do: '支配', Re: '责任', Cn: '控制',
  },
  en: {
    Q: 'Cannot say', L: 'Lie', F: 'Infrequency', K: 'Correction', Hs: 'Hypochondriasis', D: 'Depression', Hy: 'Hysteria', Pd: 'Psychopathic deviate',
    Mf: 'Masculinity-Femininity', 'Mf-m': 'Masc.', 'Mf-f': 'Fem.', Pa: 'Paranoia', Pt: 'Psychasthenia', Sc: 'Schizophrenia', Ma: 'Hypomania', Si: 'Social introversion',
    MAS: 'Anxiety', Dy: 'Dependency', Do: 'Dominance', Re: 'Responsibility', Cn: 'Control',
  },
}

function round1(value: number) {
  return Math.round(value * 10) / 10
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
  const uiLanguage: SupportedLanguage = language === 'en' ? 'en' : 'zh'

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
      await fetchWithCredentials('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
      const description = getMbtiTypeDescription(type, uiLanguage)
      setResultNode(
        <div className="space-y-6">
          <div className="p-4 rounded-lg border-2" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-2xl font-bold tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>{type}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('维度', 'Dimension')}</th>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('两极', 'Poles')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('得分', 'Score')}</th>
                </tr>
              </thead>
              <tbody>
                {MBTI_DIMENSIONS.map((item) => (
                  <tr key={item.dimension} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item.dimension}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{getMbtiPolesLabel(item, uiLanguage)}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {item.leftCode}: {scores[item.leftCode] ?? 0} &nbsp; {item.rightCode}: {scores[item.rightCode] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
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
      const typeNames = ENNEAGRAM_TYPE_NAMES[uiLanguage]
      const typeDescriptions = ENNEAGRAM_TYPE_DESCRIPTIONS[uiLanguage]
      const ordered = Object.entries(scores).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]
        return Number(a[0]) - Number(b[0])
      })
      const top = Number(ordered[0]?.[0] ?? 0)
      const topName = typeNames[top] ?? ''
      const topSummary = uiLanguage === 'en' ? `Type ${top} ${topName}` : `第${top}型 ${topName}`
      setResultNode(
        <div className="space-y-6">
          <div className="p-4 rounded-lg border-2" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('主类型', 'Main type')}</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{topSummary}</p>
            {typeDescriptions[top] && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{typeDescriptions[top]}</p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('类型', 'Type')}</th>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('名称', 'Name')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('得分', 'Score')}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                  <tr key={item} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{typeNames[item] ?? ''}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{scores[item] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('各类型简要说明', 'Brief descriptions of all types')}</p>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <p key={item}>
                <strong>{item} {typeNames[item] ?? ''}</strong>：{typeDescriptions[item] ?? ''}
              </p>
            ))}
          </div>
        </div>,
      )
      await postResultIfNeeded('enneagram', topSummary, { scores, mainType: top, mainName: topName, typeNames })
    } else if (testId === 'values8') {
      const rows = questions as Values8Question[]
      const axes: Values8Axis[] = ['econ', 'dipl', 'govt', 'scty']
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
      const labels = VALUES8_LABELS[uiLanguage]
      const leftPercentByAxis: Record<Values8Axis, number> = {
        econ: result.econ,
        dipl: round1(100 - result.dipl),
        govt: result.govt,
        scty: round1(100 - result.scty),
      }
      setResultNode(
        <div className="space-y-6">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {t('每条对立轴两端加总为 100%，显示你在该价值轴上的倾向。', 'Each opposing axis sums to 100%, showing where you land on that value scale.')}
          </p>
          {axes.map((axis) => {
            const [leftLabel, rightLabel] = labels[axis]
            const leftPercent = leftPercentByAxis[axis]
            const rightPercent = round1(100 - leftPercent)

            return (
              <div key={axis} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <span>{leftLabel}</span>
                  <span>{rightLabel}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-primary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${leftPercent}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{leftLabel} {leftPercent}%</span>
                  <span>{rightPercent}% {rightLabel}</span>
                </div>
              </div>
            )
          })}
        </div>,
      )
      const summary = axes.map((axis) => `${labels[axis][0]}${leftPercentByAxis[axis]}%`).join(' ')
      await postResultIfNeeded('values8', summary, { scores: result, labels })
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
      const dimensionNames = BIG_FIVE_DIMENSION_NAMES[uiLanguage]
      setResultNode(
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {t('T 分按常模换算：T = 50 + 10×(原始分−均值)/标准差，仅供参考。', 'T-scores are computed from norms: T = 50 + 10×(raw−mean)/sd. For reference only.')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('维度代码', 'Code')}</th>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('维度', 'Dimension')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('原始分', 'Raw')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('T 分', 'T')}</th>
                </tr>
              </thead>
              <tbody>
                {BIG_FIVE_CODES.map((code) => (
                  <tr key={code} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{code}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{dimensionNames[code]}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{raw[code]}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{ts[code] ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      )
      await postResultIfNeeded('bigfive', `N${ts.N} E${ts.E} O${ts.O} A${ts.A} C${ts.C}`, { raw, t: ts })
    } else if (testId === 'mmpi') {
      const keyData = await loadJson<{ items: Record<string, MmpiKey> }>('/data/mmpi_scoring_key.json')
      const norms = await loadJson<{ norms: Record<'M' | 'F', Record<'16-25' | '26-35' | '36-45' | '46-55', { mean: Record<string, number>; sd: Record<string, number> }>> }>('/data/mmpi_norms.json')
      const raw: Record<string, number> = {}
      for (const code of MMPI_SCALE_ORDER) raw[code] = 0
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
      for (const code of MMPI_SCALE_ORDER) {
        const mean = norm.mean[code]
        const sd = norm.sd[code]
        tscore[code] = sd ? Math.round((50 + 10 * ((raw[code] - mean) / sd)) * 10) / 10 : null
      }
      const qThreshold = questions.length === 399 ? 22 : questions.length === 566 ? 30 : null
      const validityHint = qThreshold !== null && (raw.Q || 0) > qThreshold
        ? (uiLanguage === 'en'
          ? `Warning: Cannot say (Q) = ${raw.Q || 0} exceeds threshold (${qThreshold}). Results may be invalid.`
          : `提示：无法回答（Q）=${raw.Q || 0} 超过阈值（${qThreshold}），结果可能不可靠。`)
        : ''
      const scaleNames = MMPI_SCALE_NAMES[uiLanguage]
      setResultNode(
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {t('此处 T 分按常模表计算：T = 50 + 10×(原始分−均值)/标准差，仅供参考。', 'T-scores here are computed from norms: T = 50 + 10×(raw−mean)/sd. For reference only.')}
          </p>
          {validityHint && (
            <p className="text-sm" style={{ color: '#b45309' }}>{validityHint}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('量表', 'Scale')}</th>
                  <th className="text-left py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('名称', 'Name')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('原始分', 'Raw')}</th>
                  <th className="text-right py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{t('T 分', 'T')}</th>
                </tr>
              </thead>
              <tbody>
                {MMPI_SCALE_ORDER.map((code) => (
                  <tr key={code} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>{code}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{scaleNames[code] || code}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{raw[code] || 0}</td>
                    <td className="py-2 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>{tscore[code] ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
