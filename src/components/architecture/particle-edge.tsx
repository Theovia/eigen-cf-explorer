import { getBezierPath, type EdgeProps } from '@xyflow/react'
import { useFlowContext } from './flow-context'
import { getTheme } from '#/lib/theme'

/**
 * ParticleEdge -- Custom React Flow edge with animated particles flowing along a bezier path.
 *
 * Uses SVG-native <animateMotion> for buttery smooth animation.
 * Particles are staggered with trailing glow effects.
 * Respects prefers-reduced-motion via CSS (animateMotion inherits animation-duration override).
 *
 * Connection highlighting:
 * - When a node is hovered and this edge connects to it: speed up particles, brighten
 * - When a node is hovered and this edge does NOT connect: dim to near invisible
 */
export function ParticleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  label,
}: EdgeProps) {
  const { hoveredNode, connectedEdges } = useFlowContext()
  const isLight = getTheme() === 'light'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // -- Connection highlighting logic ----
  const isHighlightActive = hoveredNode !== null
  const isConnected = connectedEdges.has(id)

  // Determine visual state
  let pathOpacity = 0.15
  let particleSpeed = '2.5s'
  let particleOpacity = 0.9
  let trailOpacity = 1
  let labelOpacity = 1

  if (isHighlightActive) {
    if (isConnected) {
      // This edge connects to the hovered node — highlight!
      pathOpacity = 0.6
      particleSpeed = '1s'
      particleOpacity = 1
      trailOpacity = 1
      labelOpacity = 1
    } else {
      // Not connected — dim to near invisible
      pathOpacity = 0.03
      particleSpeed = '2.5s'
      particleOpacity = 0.15
      trailOpacity = 0.15
      labelOpacity = 0.2
    }
  }

  const particles = [0, 0.5, 1.0, 1.5, 2.0] // stagger offsets in seconds
  const filterId = `particle-glow-${id}`

  return (
    <g
      className="particle-edge"
      style={{
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* SVG filter for particle glow */}
      <defs>
        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={isHighlightActive && isConnected ? 4 : 3} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id={`trail-grad-${id}`}>
          <stop offset="0%" stopColor="#06b6d4" stopOpacity={isHighlightActive && isConnected ? 0.5 : 0.3} />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base path - very subtle line */}
      <path
        d={edgePath}
        fill="none"
        stroke={isLight
          ? `rgba(8, 145, 178, ${Math.min(pathOpacity * 2, 0.4)})`
          : `rgba(6, 182, 212, ${pathOpacity})`
        }
        strokeWidth={isHighlightActive && isConnected ? 1.5 : 1}
        className="particle-edge-base"
        style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
      />

      {/* Trail particles (slightly larger, lower opacity -- rendered first so they're behind) */}
      {particles.map((delay, i) => (
        <circle
          key={`trail-${id}-${i}`}
          r={isHighlightActive && isConnected ? 7 : 5}
          fill={`url(#trail-grad-${id})`}
          opacity={trailOpacity}
          className="particle-edge-particle"
          style={{ transition: 'opacity 0.3s ease' }}
        >
          <animateMotion
            dur={particleSpeed}
            repeatCount="indefinite"
            begin={`${delay + 0.08}s`}
            path={edgePath}
          />
        </circle>
      ))}

      {/* Main flowing particles */}
      {particles.map((delay, i) => (
        <circle
          key={`particle-${id}-${i}`}
          r={isHighlightActive && isConnected ? 2.5 : 2}
          fill={isHighlightActive && isConnected ? '#22d3ee' : '#06b6d4'}
          filter={`url(#${filterId})`}
          opacity={particleOpacity}
          className="particle-edge-particle"
          style={{ transition: 'opacity 0.3s ease, fill 0.3s ease' }}
        >
          <animateMotion
            dur={particleSpeed}
            repeatCount="indefinite"
            begin={`${delay}s`}
            path={edgePath}
          />
        </circle>
      ))}

      {/* Edge label */}
      {label && (
        <foreignObject
          x={labelX - 55}
          y={labelY - 12}
          width={110}
          height={24}
          style={{ overflow: 'visible', opacity: labelOpacity, transition: 'opacity 0.3s ease' }}
        >
          <div
            style={{
              background: isLight ? 'white' : 'var(--glass-bg)',
              backdropFilter: isLight ? 'none' : 'blur(8px)',
              WebkitBackdropFilter: isLight ? 'none' : 'blur(8px)',
              border: `1px solid ${
                isLight
                  ? 'var(--border)'
                  : (isHighlightActive && isConnected ? 'rgba(6, 182, 212, 0.3)' : 'var(--glass-border)')
              }`,
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              color: isHighlightActive && isConnected
                ? (isLight ? '#0891b2' : 'var(--cyan)')
                : 'var(--text3)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease, border-color 0.3s ease',
            }}
          >
            {label as string}
          </div>
        </foreignObject>
      )}
    </g>
  )
}
