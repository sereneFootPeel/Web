import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function Tests() {
  const { t } = useLanguage()
  const tests = [
    {
      id: 'mmpi',
      name: 'MMPI',
      desc: t('明尼苏达多项人格测验', 'Minnesota Multiphasic Personality Inventory'),
      icon: 'fa-clipboard-list',
      path: '/tests/mmpi',
    },
    {
      id: 'mbti',
      name: 'MBTI',
      desc: t('迈尔斯-布里格斯性格分类法', 'Myers-Briggs Type Indicator'),
      icon: 'fa-user-tag',
      path: '/tests/mbti',
    },
    {
      id: 'enneagram',
      name: t('九型人格', 'Enneagram'),
      desc: t('九种人格类型分析', 'A nine-type personality system'),
      icon: 'fa-pie-chart',
      path: '/tests/enneagram',
    },
    {
      id: 'bigfive',
      name: t('大五人格', 'Big Five'),
      desc: t('人格五因素模型', 'Five-factor model of personality'),
      icon: 'fa-chart-bar',
      path: '/tests/bigfive',
    },
    {
      id: 'values8',
      name: '8values',
      desc: t('测试八条政治价值', 'Eight political values quiz'),
      icon: 'fa-balance-scale',
      path: '/tests/values8',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('心理测试', 'Psychological Tests')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {tests.map((test) => (
          <Link
            key={test.id}
            to={test.path}
            className="group block rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border hover:-translate-y-1"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <i className={`fa ${test.icon} text-xl`} style={{ color: 'var(--text-primary)' }} />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {test.name}
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {test.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
