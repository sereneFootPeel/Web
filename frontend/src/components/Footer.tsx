import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function Footer() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      <footer
        className="footer-component py-8"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex w-full items-center justify-end">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation min-w-[44px] min-h-[44px]"
                style={{ color: 'var(--text-primary)' }}
                title={t('搜索', 'Search')}
                aria-label={t('搜索', 'Search')}
              >
                <i className="fa fa-search text-xl sm:text-2xl" />
              </button>
            </div>
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
            className="search-modal-panel fixed bottom-0 left-1/2 w-full sm:w-2/3 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
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
