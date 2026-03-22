import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  // 首页：仅显示立方体和欢迎按钮，全屏无 Header/Footer
  if (isHome) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <Outlet />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <Header />
      <main
        className="flex-grow container mx-auto px-4 py-4 sm:py-8"
        style={{ paddingTop: 'calc(4rem + 1rem)' }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
