import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { philosophyApi } from '../api/philosophy'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function nameSize(name: string) {
  if (name.length <= 14) {
    return 'text-[1.75rem] leading-tight sm:text-[2.05rem]'
  }
  if (name.length <= 26) {
    return 'text-[1.5rem] leading-tight sm:text-[1.8rem]'
  }
  return 'text-[1.35rem] leading-snug sm:text-[1.55rem]'
}

/** 首页只排介绍的开头，停在完整句子上，避免整段文字爬进水立方。 */
function opening(raw: string) {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return ''

  const sentences = text.match(/[^.!?]+[.!?]+(?:["”’)]*)|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [text]
  let chosen = ''
  for (const sentence of sentences) {
    const next = chosen ? `${chosen} ${sentence}` : sentence
    if (chosen && next.length > 280) break
    chosen = next
    if (chosen.length >= 140) break
  }
  return chosen
}

type HomeSchool = {
  name: string
  description: string
}

export function Home() {
  const [school, setSchool] = useState<HomeSchool | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    philosophyApi.schoolNodes()
      .then(async (nodes) => {
        const ready = nodes.filter((node) => node.nameEn?.trim())
        if (ready.length === 0 || cancelled) return
        const pick = ready[Math.floor(Math.random() * ready.length)]
        const detail = await philosophyApi.schoolDetail(pick.id, 'en')
        if (cancelled) return
        setSchool({
          name: detail.nameEn?.trim() || pick.nameEn?.trim() || '',
          description: detail.description?.trim() || '',
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const dateLine = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`
  const timeLine = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return (
    <>
      <Link to="/philosophers" className="sr-only">
        Enter the archive
      </Link>

      <div className="pointer-events-none fixed inset-0 z-[2]">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-7 pt-8 sm:px-12 sm:pt-10 md:px-16 md:pt-12">
          <div className="home-mark">
            <p className="text-[1.375rem] font-normal tracking-[0.12em] text-[var(--text-secondary)]">
              {dateLine}
            </p>
            <p className="mt-2 text-lg font-normal uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
              {WEEKDAYS[now.getDay()]}
            </p>
          </div>
          <p
            className="home-mark text-[1.375rem] font-normal tracking-[0.12em] text-[var(--text-secondary)] tabular-nums"
            style={{ animationDelay: '90ms' }}
          >
            {timeLine}
          </p>
        </div>

        {school?.name ? (
          <div className="absolute bottom-0 left-0 px-7 pb-10 sm:px-12 sm:pb-14 md:px-16 md:pb-[4.5rem]">
            <div className="w-[min(22rem,78vw)] sm:w-[24rem]">
              <p
                className={`home-mark font-normal text-[var(--text-primary)] ${nameSize(school.name)}`}
                style={{ animationDelay: '160ms' }}
              >
                {school.name}
              </p>
              {school.description ? (
                <p
                  className="home-mark mt-3 text-[15px] font-normal leading-7 text-[var(--text-secondary)]"
                  style={{ animationDelay: '280ms' }}
                >
                  {opening(school.description)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
