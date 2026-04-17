import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useExplorerStore } from '#/stores/explorer-store'

// -- Category colors ----
const CAT_COLORS: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
}

const CAT_BG: Record<string, string> = {
  compute: 'rgba(59,130,246,0.10)',
  storage: 'rgba(34,197,94,0.10)',
  ai: 'rgba(168,85,247,0.10)',
  security: 'rgba(239,68,68,0.10)',
  integration: 'rgba(6,182,212,0.10)',
}

// RGB values for dynamic glow computation
const CAT_RGB: Record<string, string> = {
  compute: '59,130,246',
  storage: '34,197,94',
  ai: '168,85,247',
  security: '239,68,68',
  integration: '6,182,212',
}

const CAT_ICONS: Record<string, string> = {
  compute: '\u26A1',
  storage: '\uD83D\uDCBE',
  ai: '\uD83E\uDDE0',
  security: '\uD83D\uDEE1\uFE0F',
  integration: '\uD83D\uDD17',
}

// -- Custom node data shape ----
type ServiceNodeData = {
  serviceId: string
  name: string
  category: string
  role: string
  costWeight?: number
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>

// -- Component ----
export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  const { serviceId, name, category, role, costWeight = 0 } = data
  const selectedService = useExplorerStore((s) => s.selectedService)
  const selectService = useExplorerStore((s) => s.selectService)

  const isSelected = selectedService === serviceId
  const catColor = CAT_COLORS[category] ?? 'var(--text3)'
  const catBg = CAT_BG[category] ?? 'rgba(107,112,132,0.10)'
  const catRgb = CAT_RGB[category] ?? '107,112,132'

  // Breathing node: cost weight modulates glow intensity and subtle scale
  const cw = Math.min(Math.max(costWeight, 0), 1)
  const glowIntensity = 0.12 + cw * 0.4 // 0.12 to 0.52
  const glowSpread = 15 + cw * 30 // 15px to 45px
  const scaleBoost = 1 + cw * 0.03 // 1.0 to 1.03
  const pulseSpeed = 3 - cw * 1.5 // 3s to 1.5s (faster for higher cost)

  const breathingGlow = `0 0 ${glowSpread}px rgba(${catRgb}, ${glowIntensity}), 0 0 ${glowSpread * 2}px rgba(${catRgb}, ${glowIntensity * 0.3})`
  const selectedGlow = '0 0 25px rgba(249,115,22,0.25), 0 0 50px rgba(249,115,22,0.08), 0 4px 20px rgba(0,0,0,0.5)'

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !border-0 !rounded-full"
        style={{
          background: catColor,
          boxShadow: `0 0 6px ${catColor}60`,
        }}
      />

      <div
        onClick={() => selectService(isSelected ? null : serviceId)}
        className="cursor-pointer rounded-xl px-3.5 py-3 transition-all duration-200 breathing-node"
        style={{
          width: 170,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: `2px solid ${isSelected ? 'var(--accent)' : catColor}`,
          borderLeft: '1px solid var(--glass-border)',
          borderRight: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: isSelected ? selectedGlow : breathingGlow,
          transform: isSelected ? 'translateY(-2px)' : `scale(${scaleBoost})`,
          animationName: !isSelected ? 'breathing-glow' : 'none',
          animationDuration: `${pulseSpeed}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          // Pass CSS custom properties for the keyframe animation
          '--breathing-glow-low': breathingGlow,
          '--breathing-glow-high': `0 0 ${glowSpread * 1.6}px rgba(${catRgb}, ${glowIntensity * 1.5}), 0 0 ${glowSpread * 3}px rgba(${catRgb}, ${glowIntensity * 0.5})`,
          '--breathing-scale': `${scaleBoost}`,
          '--breathing-scale-high': `${scaleBoost + 0.005}`,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = `scale(${scaleBoost + 0.02}) translateY(-1px)`
            e.currentTarget.style.boxShadow = `0 0 ${glowSpread * 2}px rgba(${catRgb}, ${glowIntensity * 2}), 0 8px 25px rgba(0,0,0,0.5)`
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = `scale(${scaleBoost})`
            e.currentTarget.style.boxShadow = breathingGlow
          }
        }}
      >
        {/* Row: icon + name */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{CAT_ICONS[category] ?? ''}</span>
          <div
            className="text-xs font-semibold leading-tight truncate"
            style={{
              color: 'var(--text)',
              fontFamily: '"Chakra Petch", sans-serif',
            }}
          >
            {name}
          </div>
        </div>

        {/* Category badge */}
        <span
          className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
          style={{
            color: catColor,
            background: catBg,
            border: `1px solid ${catColor}25`,
          }}
        >
          {category}
        </span>

        {/* Role in architecture */}
        {role && (
          <div
            className="mt-1.5 text-[10px] leading-snug"
            style={{ color: 'var(--text3)' }}
          >
            {role}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !border-0 !rounded-full"
        style={{
          background: catColor,
          boxShadow: `0 0 6px ${catColor}60`,
        }}
      />
    </>
  )
}
