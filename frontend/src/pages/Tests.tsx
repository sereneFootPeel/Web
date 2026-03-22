export function Tests() {
  const tests = [
    { id: 'mmpi', name: 'MMPI', desc: '明尼苏达多项人格测验', icon: 'fa-clipboard-list', path: '/mmpi' },
    { id: 'mbti', name: 'MBTI', desc: '迈尔斯-布里格斯性格分类法', icon: 'fa-user-tag', path: '/mbti' },
    { id: 'enneagram', name: '九型人格', desc: '九种人格类型分析', icon: 'fa-pie-chart', path: '/enneagram' },
    { id: 'bigfive', name: '大五人格', desc: '人格五因素模型', icon: 'fa-chart-bar', path: '/bigfive' },
    { id: 'values8', name: '8values', desc: '测试八条政治价值', icon: 'fa-balance-scale', path: '/values8' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        心理测试
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {tests.map((test) => (
          <a
            key={test.id}
            href={test.path}
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
          </a>
        ))}
      </div>
    </div>
  )
}
