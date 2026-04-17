import { useEffect, useRef, useState } from 'react'

/**
 * AmbientParticles -- Canvas 2D floating particles.
 * Tiny dots drifting slowly upward like dust motes in a server room.
 * 60 particles max, very slow, very subtle. Not a snowstorm.
 * Respects prefers-reduced-motion. SSR-safe.
 */
export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [prefersReduced, setPrefersReduced] = useState(false)

  // SSR-safe: check reduced motion in useEffect
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check for light mode
    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light'

    // Resize handler
    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles
    const COUNT = 60
    const w = () => canvas.offsetWidth
    const h = () => canvas.offsetHeight

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }[] = []

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.3 - 0.05, // drift up
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, w(), h())

      const light = isLight()

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.y < -10) {
          p.y = h() + 10
          p.x = Math.random() * w()
        }
        if (p.x < -10) p.x = w() + 10
        if (p.x > w() + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        // Use theme-appropriate color
        // Light mode: warm stone-400 tinted, subtle. Dark: cyan.
        if (light) {
          ctx.fillStyle = `rgba(168, 162, 158, ${p.opacity * 0.5})`
        } else {
          ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`
        }
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
