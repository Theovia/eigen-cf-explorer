import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * CustomCursor -- A ring that follows the mouse with slight easing.
 * Only visible inside the flow canvas area (controlled by parent).
 * Expands when hovering a node (via CSS class on body).
 * Respects prefers-reduced-motion. SSR-safe.
 */
export function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springX = useSpring(cursorX, { stiffness: 500, damping: 30 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 30 })

  const [visible, setVisible] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  // SSR-safe reduced motion check
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReduced) return

    const handler = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [cursorX, cursorY, prefersReduced])

  // Show cursor when inside flow canvas
  useEffect(() => {
    if (prefersReduced) return

    const show = () => setVisible(true)
    const hide = () => setVisible(false)

    // Observe the flow canvas container
    const observer = new MutationObserver(() => {
      const el = document.querySelector('.flow-canvas-area')
      if (el) {
        el.addEventListener('mouseenter', show)
        el.addEventListener('mouseleave', hide)
      }
    })

    // Initial bind
    const el = document.querySelector('.flow-canvas-area')
    if (el) {
      el.addEventListener('mouseenter', show)
      el.addEventListener('mouseleave', hide)
    }

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      const el = document.querySelector('.flow-canvas-area')
      if (el) {
        el.removeEventListener('mouseenter', show)
        el.removeEventListener('mouseleave', hide)
      }
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <motion.div
      className="custom-cursor"
      style={{
        position: 'fixed',
        left: springX,
        top: springY,
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 99999,
        mixBlendMode: 'screen',
        opacity: visible ? 1 : 0,
        transition: 'width 0.2s, height 0.2s, border-color 0.2s, opacity 0.2s',
      }}
    />
  )
}
