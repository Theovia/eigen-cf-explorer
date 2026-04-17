import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useExplorerStore } from '#/stores/explorer-store'
import { useFlowContext } from './flow-context'
import { getTheme } from '#/lib/theme'

// -- Category colors (full saturation for dark mode top border) ----
const CAT_COLORS: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
}

// Muted/pastel category colors for light mode top border
const CAT_COLORS_MUTED: Record<string, string> = {
  compute: '#93c5fd',   // blue-300
  storage: '#86efac',   // green-300
  ai: '#c4b5fd',        // purple-300
  security: '#fca5a5',  // red-300
  integration: '#67e8f9', // cyan-300
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
  const { serviceId, name, category, role } = data
  const selectedService = useExplorerStore((s) => s.selectedService)
  const selectService = useExplorerStore((s) => s.selectService)
  const { hoveredNode, connectedNodes } = useFlowContext()

  const isSelected = selectedService === serviceId
  const isLight = getTheme() === 'light'
  const catColor = CAT_COLORS[category] ?? 'var(--text3)'
  const catColorMuted = CAT_COLORS_MUTED[category] ?? '#d4d4d8'

  // -- Connection highlighting ----
  const isHighlightActive = hoveredNode !== null
  const isConnected = connectedNodes.has(serviceId)

  // Dimming: when a node is hovered and this node is NOT connected
  let nodeOpacity = 1
  if (isHighlightActive && !isConnected) {
    nodeOpacity = 0.35
  }

  // -- Light mode: elevation shadows. Dark mode: clean borders. ----
  const lightBaseShadow = '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
  const lightHoverShadow = '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
  const lightSelectedShadow = '0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)'

  const nodeShadow = isLight
    ? (isSelected ? lightSelectedShadow : lightBaseShadow)
    : 'none'

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!border-0 !rounded-full"
        style={{
          width: 6,
          height: 6,
          background: isLight ? catColor : '#52525b',
          opacity: nodeOpacity,
          transition: 'opacity 0.3s ease',
        }}
      />

      <div
        onClick={() => selectService(isSelected ? null : serviceId)}
        className="cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
        style={{
          width: 165,
          background: isLight
            ? 'white'
            : (isSelected ? '#1a1510' : '#111318'),
          borderTop: `2px solid ${isSelected
            ? 'var(--accent)'
            : (isLight ? catColorMuted : catColor)}`,
          borderLeft: isSelected
            ? (isLight ? '2px solid var(--accent)' : '2px solid var(--accent)')
            : `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
          borderRight: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
          borderBottom: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
          boxShadow: nodeShadow,
          opacity: nodeOpacity,
          transition: 'opacity 0.3s ease, background 0.15s ease, border-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            if (isLight) {
              e.currentTarget.style.boxShadow = lightHoverShadow
              e.currentTarget.style.borderColor = '#d6d3d1'
            } else {
              e.currentTarget.style.background = '#18181b'
              e.currentTarget.style.borderColor = '#52525b'
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            if (isLight) {
              e.currentTarget.style.boxShadow = lightBaseShadow
              e.currentTarget.style.borderColor = 'var(--border)'
            } else {
              e.currentTarget.style.background = '#111318'
              e.currentTarget.style.borderColor = '#27272a'
            }
          }
        }}
      >
        {/* Name — 14px Chakra Petch, zinc-100, weight 600 */}
        <div
          className="text-[14px] font-semibold leading-tight truncate"
          style={{
            color: 'var(--text)',
            fontFamily: '"Chakra Petch", sans-serif',
          }}
        >
          {name}
        </div>

        {/* Role — 10px monospace, zinc-500, uppercase tracking */}
        {role && (
          <div
            className="mt-1 leading-snug"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#71717a',
            }}
          >
            {role}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!border-0 !rounded-full"
        style={{
          width: 6,
          height: 6,
          background: isLight ? catColor : '#52525b',
          opacity: nodeOpacity,
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  )
}
