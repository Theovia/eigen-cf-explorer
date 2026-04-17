import { getBezierPath, type EdgeProps } from '@xyflow/react'

/**
 * ParticleEdge — Custom React Flow edge with animated particles flowing along a bezier path.
 *
 * Uses SVG-native <animateMotion> for buttery smooth animation.
 * Particles are staggered with trailing glow effects.
 * Respects prefers-reduced-motion via CSS (animateMotion inherits animation-duration override).
 */
export function ParticleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const particles = [0, 0.5, 1.0, 1.5, 2.0] // stagger offsets in seconds
  const filterId = `particle-glow-${id}`

  return (
    <g className="particle-edge">
      {/* SVG filter for particle glow */}
      <defs>
        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id={`trail-grad-${id}`}>
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base path - very subtle line */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(6, 182, 212, 0.15)"
        strokeWidth={1}
        className="particle-edge-base"
      />

      {/* Trail particles (slightly larger, lower opacity — rendered first so they're behind) */}
      {particles.map((delay, i) => (
        <circle
          key={`trail-${id}-${i}`}
          r={5}
          fill={`url(#trail-grad-${id})`}
          className="particle-edge-particle"
        >
          <animateMotion
            dur="2.5s"
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
          r={2}
          fill="#06b6d4"
          filter={`url(#${filterId})`}
          opacity={0.9}
          className="particle-edge-particle"
        >
          <animateMotion
            dur="2.5s"
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
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '9px',
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--text3)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {label as string}
          </div>
        </foreignObject>
      )}
    </g>
  )
}
