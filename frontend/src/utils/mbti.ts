export type SupportedLanguage = 'zh' | 'en'

export type MbtiDimension = {
  dimension: string
  leftCode: 'E' | 'S' | 'T' | 'J'
  rightCode: 'I' | 'N' | 'F' | 'P'
  leftZh: string
  leftEn: string
  rightZh: string
  rightEn: string
}

export const MBTI_DIMENSIONS: MbtiDimension[] = [
  { dimension: 'E-I', leftCode: 'E', rightCode: 'I', leftZh: '外向', leftEn: 'Extraverted', rightZh: '内向', rightEn: 'Introverted' },
  { dimension: 'S-N', leftCode: 'S', rightCode: 'N', leftZh: '实感', leftEn: 'Sensing', rightZh: '直觉', rightEn: 'Intuitive' },
  { dimension: 'T-F', leftCode: 'T', rightCode: 'F', leftZh: '思考', leftEn: 'Thinking', rightZh: '情感', rightEn: 'Feeling' },
  { dimension: 'J-P', leftCode: 'J', rightCode: 'P', leftZh: '判断', leftEn: 'Judging', rightZh: '知觉', rightEn: 'Perceiving' },
]

const MBTI_TYPE_DESCRIPTIONS: Record<string, { zh: string; en: string }> = {
  INTJ: { zh: '内向、直觉、思考、判断。独立，善于规划，追求系统与逻辑。', en: 'Introverted, Intuitive, Thinking, Judging. Independent, strategic, values logic.' },
  INTP: { zh: '内向、直觉、思考、知觉。分析型，喜欢理论与可能性。', en: 'Introverted, Intuitive, Thinking, Perceiving. Analytical, loves theory.' },
  ENTJ: { zh: '外向、直觉、思考、判断。果断，善于组织与领导。', en: 'Extraverted, Intuitive, Thinking, Judging. Decisive leader, organized.' },
  ENTP: { zh: '外向、直觉、思考、知觉。创新，喜欢辩论与挑战。', en: 'Extraverted, Intuitive, Thinking, Perceiving. Innovative, enjoys debate.' },
  INFJ: { zh: '内向、直觉、情感、判断。理想主义，关注他人与意义。', en: 'Introverted, Intuitive, Feeling, Judging. Idealistic, cares about meaning.' },
  INFP: { zh: '内向、直觉、情感、知觉。敏感，重视价值观与和谐。', en: 'Introverted, Intuitive, Feeling, Perceiving. Sensitive, values harmony.' },
  ENFJ: { zh: '外向、直觉、情感、判断。热情，善于激励他人。', en: 'Extraverted, Intuitive, Feeling, Judging. Enthusiastic, motivates others.' },
  ENFP: { zh: '外向、直觉、情感、知觉。热情洋溢，富有想象力。', en: 'Extraverted, Intuitive, Feeling, Perceiving. Enthusiastic, imaginative.' },
  ISTJ: { zh: '内向、实感、思考、判断。可靠，注重事实与秩序。', en: 'Introverted, Sensing, Thinking, Judging. Reliable, fact-based, orderly.' },
  ISFJ: { zh: '内向、实感、情感、判断。尽责，关心他人细节。', en: 'Introverted, Sensing, Feeling, Judging. Conscientious, cares for others.' },
  ESTJ: { zh: '外向、实感、思考、判断。务实，善于管理与执行。', en: 'Extraverted, Sensing, Thinking, Judging. Practical, manages and executes.' },
  ESFJ: { zh: '外向、实感、情感、判断。热心，重视和谐与责任。', en: 'Extraverted, Sensing, Feeling, Judging. Warm, values harmony.' },
  ISTP: { zh: '内向、实感、思考、知觉。冷静，善于动手解决问题。', en: 'Introverted, Sensing, Thinking, Perceiving. Cool, hands-on problem solver.' },
  ISFP: { zh: '内向、实感、情感、知觉。温和，注重当下与美感。', en: 'Introverted, Sensing, Feeling, Perceiving. Gentle, present-focused.' },
  ESTP: { zh: '外向、实感、思考、知觉。行动派，喜欢冒险与即兴。', en: 'Extraverted, Sensing, Thinking, Perceiving. Action-oriented, adventurous.' },
  ESFP: { zh: '外向、实感、情感、知觉。活泼，享受与人互动与乐趣。', en: 'Extraverted, Sensing, Feeling, Perceiving. Lively, enjoys people and fun.' },
}

export function getMbtiPolesLabel(item: MbtiDimension, language: SupportedLanguage) {
  return language === 'en'
    ? `${item.leftCode}(${item.leftEn}) / ${item.rightCode}(${item.rightEn})`
    : `${item.leftCode}(${item.leftZh}) / ${item.rightCode}(${item.rightZh})`
}

export function getMbtiTypeDescription(type: string, language: SupportedLanguage) {
  const key = (type || '').toUpperCase()
  const value = MBTI_TYPE_DESCRIPTIONS[key]
  if (!value) return ''
  return language === 'en' ? value.en : value.zh
}

