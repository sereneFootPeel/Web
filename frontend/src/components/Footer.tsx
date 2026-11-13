import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function Footer() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [now, setNow] = useState(() => new Date())
  const navigate = useNavigate()
  const { language, t } = useLanguage()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  const dateLine = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`
  const weekday = language === 'en' ? WEEKDAYS_EN[now.getDay()] : WEEKDAYS_ZH[now.getDay()]

  return (
    <>
      <footer data-page-surface className="footer-component relative" style={{ color: 'var(--text-primary)' }}>
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="footer-bar">
            <div className="footer-dateblock">
              <p className="footer-date">{dateLine}</p>
              <p className={`footer-weekday${language === 'zh' ? ' is-zh' : ''}`}>{weekday}</p>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ml-auto inline-flex items-center gap-1.5 self-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 touch-manipulation"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              title={t('搜索', 'Search')}
              aria-label={t('搜索', 'Search')}
            >
              <i className="fa fa-search" />
              <span>{t('搜索', 'Search')}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 搜索模态框 */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
          }}
        >
          <div
            data-page-surface
            className="search-modal-panel fixed bottom-0 left-1/2 w-full sm:w-2/3 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('搜索', 'Search')}
                </h3>
                <button
                  type="button"
                  aria-label={t('关闭搜索', 'Close search')}
                  className="p-2 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onClick={() => setSearchOpen(false)}
                >
                  <i className="fa fa-times text-lg" />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('输入关键词搜索...', 'Search by keywords...')}
                  className="w-full px-4 py-3 pr-14 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base transition-all duration-200"
                  style={{
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-md transition-colors shadow-md"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--text-on-primary)',
                  }}
                >
                  <i className="fa fa-search" />
                </button>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      )}
    </>
  )
}
