import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useExplorerStore } from '#/stores/explorer-store'

// ─── Category colors mapped to CSS variables ──────────────────
const CAT_COLORS: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--yellow)',
}

const CAT_BG: Record<string, string> = {
  compute: 'rgba(59,130,246,0.15)',
  storage: 'rgba(34,197,94,0.15)',
  ai: 'rgba(168,85,247,0.15)',
  security: 'rgba(239,68,68,0.15)',
  integration: 'rgba(234,179,8,0.15)',
}

// ─── Custom node data shape ───────────────────────────────────
type ServiceNodeData = {
  serviceId: string
  name: string
  category: string
  role: string
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>

// ─── Component ────────────────────────────────────────────────
export function ServiceNode({ data }: NodeProps<ServiceNodeType>) {
  const { serviceId, name, category, role } = data
  const selectedServiceId = useExplorerStore((s) => s.selectedServiceId)
  const selectService = useExplorerStore((s) => s.selectService)

  const isSelected = selectedServiceId === serviceId
  const catColor = CAT_COLORS[category] ?? 'var(--text3)'
  const catBg = CAT_BG[category] ?? 'rgba(107,112,132,0.15)'

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !border-0"
        style={{ background: 'var(--text3)' }}
      />

      <div
        onClick={() => selectService(isSelected ? null : serviceId)}
        className="cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-150"
        style={{
          width: 160,
          background: 'var(--bg2)',
          borderLeft: `3px solid ${catColor}`,
          borderTop: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
          borderRight: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
          borderBottom: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
          boxShadow: isSelected
            ? '0 0 12px rgba(249,115,22,0.25)'
            : '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        {/* Service name */}
        <div
          className="text-xs font-semibold leading-tight truncate"
          style={{ color: 'var(--text)' }}
        >
          {name}
        </div>

        {/* Category badge */}
        <span
          className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide"
          style={{
            color: catColor,
            background: catBg,
          }}
        >
          {category}
        </span>

        {/* Role in architecture */}
        {role && (
          <div
            className="mt-1.5 text-[10px] leading-snug"
            style={{ color: 'var(--text2)' }}
          >
            {role}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !border-0"
        style={{ background: 'var(--text3)' }}
      />
    </>
  )
}
