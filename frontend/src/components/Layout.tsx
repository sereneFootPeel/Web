import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { WaterScene } from './WaterScene'
import { ArchiveBackground } from './ArchiveBackground'

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isHistory = location.pathname.startsWith('/history')

  const shellClass = isHome
    ? 'relative z-10 min-h-screen w-full bg-transparent'
    : isHistory
      ? 'relative z-10 h-dvh overflow-hidden flex flex-col bg-transparent'
      : 'relative z-10 min-h-screen flex flex-col bg-transparent'

  return (
    <>
      <ArchiveBackground />
      {isHome ? <WaterScene /> : null}
      <div className={shellClass}>
        {isHome ? (
          <Outlet />
        ) : (
          <>
            <Header />
            <main
              className={
                isHistory
                  ? 'flex-1 min-h-0 w-full overflow-hidden pt-16'
                  : 'flex-grow container mx-auto px-4 py-4 sm:py-8'
              }
              style={isHistory ? undefined : { paddingTop: 'calc(4rem + 1rem)' }}
            >
              {isHistory ? (
                <Outlet />
              ) : (
                <div className="glass-panel min-h-[50vh] rounded-2xl px-4 py-5 sm:px-6 sm:py-7">
                  <Outlet />
                </div>
              )}
            </main>
            {!isHistory ? <Footer /> : null}
          </>
        )}
      </div>
    </>
  )
}
