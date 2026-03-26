import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const navItems = [
  { path: '/quotes', labelZh: '推荐', labelEn: 'Recommended', icon: 'fa-quote-left' },
  { path: '/philosophers', labelZh: '哲学家', labelEn: 'Philosophers', icon: 'fa-users' },
  { path: '/schools', labelZh: '学派', labelEn: 'Schools', icon: 'fa-university' },
  { path: '/tests', labelZh: '测试', labelEn: 'Tests', icon: 'fa-clipboard-list' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <header
      id="navbar"
      className="fixed top-0 left-0 right-0 z-50 w-full bg-primary shadow-sm overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold font-sans"
              style={{ color: 'var(--text-primary)' }}
            >
              <i className="fa fa-book mr-2" />
              <span>{t('哲学网站', 'Philosophy Website')}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              {navItems.map(({ path, labelZh, labelEn, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="px-3 py-3 rounded-md text-sm font-medium hover:opacity-80 transition-colors"
                  style={{
                    color: location.pathname === path
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  }}
                >
                  <i className={`fa ${icon} mr-1`} />
                  <span>{t(labelZh, labelEn)}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <Link
                    to="/user/profile"
                    className="px-3 py-3 rounded-md text-sm font-medium hover:opacity-80 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <i className="fa fa-user mr-1" />
                    <span>{t('用户主页', 'Profile')}</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-3 rounded-md text-sm font-medium hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <i className="fa fa-sign-in mr-1" />
                  <span>{t('登录', 'Login')}</span>
                </Link>
              )}
            </div>

            <button
              id="menu-toggle"
              className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t('菜单', 'Menu')}
              aria-expanded={mobileOpen}
            >
              <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden relative z-10"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
            {navItems.map(({ path, labelZh, labelEn, icon }) => (
              <Link
                key={path}
                to={path}
                className="px-3 py-3 rounded-md text-sm font-medium hover:opacity-80 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(false)}
              >
                <i className={`fa ${icon} mr-2`} />
                <span>{t(labelZh, labelEn)}</span>
              </Link>
            ))}
            {user && (
              <Link
                to="/user/profile"
                className="px-3 py-3 rounded-md text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(false)}
              >
                <i className="fa fa-user mr-2" />
                <span>{t('用户主页', 'Profile')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
