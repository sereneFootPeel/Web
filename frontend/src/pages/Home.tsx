import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export function Home() {
  const rotRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0, initialX: 0, initialY: 0 })

  useEffect(() => {
    const canvas = document.getElementById('homeCanvas') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const context = ctx

    let animationId: number
    const getConfig = () => ({
      rotationSpeed: 0.008,
      size: Math.min(canvas.width, canvas.height) * (window.innerWidth >= 768 ? 0.08 : 0.1),
      focal: window.innerWidth < 768 ? 200 : 500,
      lineWidth: window.innerWidth >= 768 ? 2.5 : 1.5,
    })
    let config = getConfig()
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      config = getConfig()
    }
    resize()
    window.addEventListener('resize', resize)

    const getPts = (size: number) => [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ].map(([x, y, z]) => ({ x: x! * size, y: y! * size, z: z! * size }))
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]

    function getLineColor() {
      const textTertiary = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim()
      if (textTertiary) return textTertiary
      if (document.documentElement.classList.contains('theme-midnight')) return '#6B7280'
      return '#6B7280'
    }

    function animate() {
      if (!dragRef.current.isDragging) {
        rotRef.current.x += config.rotationSpeed
        rotRef.current.y += config.rotationSpeed * 0.7
      }

      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)

      const pts = getPts(config.size)
      const proj = pts.map((p) => {
        let { x, y, z } = p
        const cx = Math.cos(rotRef.current.x), sx = Math.sin(rotRef.current.x)
        const cy = Math.cos(rotRef.current.y), sy = Math.sin(rotRef.current.y)
        const yy = y * cx - z * sx
        const zz = y * sx + z * cx
        const xx = x * cy - zz * sy
        const zf = x * sy + zz * cy
        const s = config.focal / (config.focal + zf)
        return { x: xx * s + canvas.width / 2, y: yy * s + canvas.height / 2 }
      })

      context.strokeStyle = getLineColor()
      context.lineWidth = config.lineWidth
      edges.forEach(([a, b]) => {
        context.beginPath()
        context.moveTo(proj[a].x, proj[a].y)
        context.lineTo(proj[b].x, proj[b].y)
        context.stroke()
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    // 鼠标拖拽旋转
    const handleMouseDown = (e: MouseEvent) => {
      dragRef.current.isDragging = true
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      dragRef.current.initialX = rotRef.current.x
      dragRef.current.initialY = rotRef.current.y
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return
      const deltaX = e.clientX - dragRef.current.lastX
      const deltaY = e.clientY - dragRef.current.lastY
      rotRef.current.y = dragRef.current.initialY + deltaX * 0.005
      rotRef.current.x = dragRef.current.initialX + deltaY * 0.005
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      dragRef.current.initialX = rotRef.current.x
      dragRef.current.initialY = rotRef.current.y
    }
    const handleMouseUp = () => {
      dragRef.current.isDragging = false
    }

    // 触摸旋转
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && !(e.target as HTMLElement).closest('a')) {
        dragRef.current.isDragging = true
        dragRef.current.lastX = e.touches[0].clientX
        dragRef.current.lastY = e.touches[0].clientY
        dragRef.current.initialX = rotRef.current.x
        dragRef.current.initialY = rotRef.current.y
      }
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDragging || e.touches.length !== 1) return
      if ((e.target as HTMLElement).closest('a')) return
      const deltaX = e.touches[0].clientX - dragRef.current.lastX
      const deltaY = e.touches[0].clientY - dragRef.current.lastY
      rotRef.current.y = dragRef.current.initialY + deltaX * 0.005
      rotRef.current.x = dragRef.current.initialX + deltaY * 0.005
      dragRef.current.lastX = e.touches[0].clientX
      dragRef.current.lastY = e.touches[0].clientY
      dragRef.current.initialX = rotRef.current.x
      dragRef.current.initialY = rotRef.current.y
      e.preventDefault()
    }
    const handleTouchEnd = () => {
      dragRef.current.isDragging = false
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      <canvas id="homeCanvas" className="absolute inset-0 w-full h-full" />

      <Link
        to="/quotes"
        className="welcome-button fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-3 sm:px-7 sm:py-5 text-sm sm:text-lg cursor-pointer transition-colors duration-300 hover:shadow-lg active:scale-95 backdrop-blur-sm touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        aria-label="欢迎游览"
      >
        <i className="fa fa-arrow-right" />
        <span>欢迎游览</span>
      </Link>
    </div>
  )
}
