import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const GAP = 18
const RADIUS = 68
const DOT = 2.5
const EDGE = DOT + 2

type Surface = {
  left: number
  top: number
  right: number
  bottom: number
  radius: number
}

const hostKeys = new WeakMap<HTMLElement, number>()
let nextHostKey = 1

function hostKey(host: HTMLElement) {
  let key = hostKeys.get(host)
  if (key == null) {
    key = nextHostKey
    nextHostKey += 1
    hostKeys.set(host, key)
  }
  return key
}

/** 内圈保持实心白，只在圆的外缘淡出。 */
function edgeAlpha(dist: number) {
  const t = dist / RADIUS
  if (t <= 0.42) return 1
  const fade = (t - 0.42) / 0.58
  const x = 1 - fade
  return x * x * (3 - 2 * x)
}

function onPage(x: number, y: number) {
  const el = document.elementFromPoint(x, y)
  return Boolean(el?.closest('[data-page-surface]'))
}

function inside(surface: Surface, x: number, y: number) {
  const left = surface.left + EDGE
  const top = surface.top + EDGE
  const right = surface.right - EDGE
  const bottom = surface.bottom - EDGE
  const radius = Math.max(0, surface.radius - EDGE)
  if (right <= left || bottom <= top) return false
  if (x < left || y < top || x > right || y > bottom) return false
  if (radius <= 0) return true
  let cx = x
  let cy = y
  if (x < left + radius) cx = left + radius
  else if (x > right - radius) cx = right - radius
  if (y < top + radius) cy = top + radius
  else if (y > bottom - radius) cy = bottom - radius
  if (cx === x && cy === y) return true
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= radius * radius
}

/** 点阵铺在面板底色上、内容下面。鼠标周围一圈才显出来。 */
export function PageCursorDots() {
  const [hosts, setHosts] = useState<HTMLElement[]>([])

  useEffect(() => {
    const sync = () => {
      const next = [...document.querySelectorAll<HTMLElement>('[data-page-surface]')]
      setHosts((prev) => {
        if (prev.length === next.length && prev.every((host, index) => host === next[index])) return prev
        return next
      })
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let pending = false
    let strength = 0
    let target = 0
    let mx = -9999
    let my = -9999
    const contexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>()

    const draw = () => {
      for (const canvas of document.querySelectorAll<HTMLCanvasElement>('canvas.page-dots')) {
        let ctx = contexts.get(canvas)
        if (!ctx) {
          const next = canvas.getContext('2d')
          if (!next) continue
          ctx = next
          contexts.set(canvas, next)
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const bitmapW = Math.max(1, Math.floor(width * dpr))
        const bitmapH = Math.max(1, Math.floor(height * dpr))
        if (canvas.width !== bitmapW || canvas.height !== bitmapH) {
          canvas.width = bitmapW
          canvas.height = bitmapH
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)
        if (strength < 0.01 || width < 1 || height < 1) continue

        const host = canvas.parentElement
        if (!host) continue
        const hostRect = host.getBoundingClientRect()
        const canvasRect = canvas.getBoundingClientRect()
        const radiusCss = Number.parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0
        const surface: Surface = {
          left: hostRect.left,
          top: hostRect.top,
          right: hostRect.right,
          bottom: hostRect.bottom,
          radius: Math.min(radiusCss, hostRect.width / 2, hostRect.height / 2),
        }
        if (hostRect.bottom < 0 || hostRect.top > window.innerHeight) continue
        if (hostRect.right < 0 || hostRect.left > window.innerWidth) continue

        ctx.fillStyle = '#ffffff'
        const x0 = surface.left + GAP / 2
        const y0 = surface.top + GAP / 2
        const minCol = Math.max(0, Math.floor((mx - RADIUS - x0) / GAP))
        const maxCol = Math.floor((Math.min(surface.right, mx + RADIUS) - x0) / GAP)
        const minRow = Math.max(0, Math.floor((my - RADIUS - y0) / GAP))
        const maxRow = Math.floor((Math.min(surface.bottom, my + RADIUS) - y0) / GAP)

        for (let row = minRow; row <= maxRow; row++) {
          const y = y0 + row * GAP
          for (let col = minCol; col <= maxCol; col++) {
            const x = x0 + col * GAP
            if (!inside(surface, x, y)) continue
            const dist = Math.hypot(x - mx, y - my)
            if (dist > RADIUS) continue
            ctx.globalAlpha = edgeAlpha(dist) * strength
            ctx.beginPath()
            ctx.arc(x - canvasRect.left, y - canvasRect.top, DOT, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
      }
    }

    const tick = () => {
      pending = false
      strength += (target - strength) * 0.28
      if (Math.abs(target - strength) < 0.01) strength = target
      draw()
      if (strength !== target) schedule()
    }

    const schedule = () => {
      if (pending) return
      pending = true
      frame = window.requestAnimationFrame(tick)
    }

    const place = (x: number, y: number) => {
      mx = x
      my = y
      target = onPage(x, y) ? 1 : 0
      schedule()
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      place(event.clientX, event.clientY)
    }

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget != null) return
      target = 0
      schedule()
    }

    const onReflow = () => schedule()

    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
    }
  }, [])

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  return hosts.map((host) => createPortal(
    <canvas
      className="page-dots"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />,
    host,
    hostKey(host),
  ))
}
