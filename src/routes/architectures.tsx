import { createFileRoute } from '@tanstack/react-router'
import { ReactFlowProvider } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplorerStore } from '#/stores/explorer-store'
import { ARCHITECTURES } from '#/data/architectures'
import { FlowCanvas } from '#/components/architecture/flow-canvas'
import { CostBreakdown } from '#/components/architecture/cost-breakdown'
import { getTheme } from '#/lib/theme'
import type { Architecture } from '#/data/types'

export const Route = createFileRoute('/architectures')({
  component: ArchitecturesPage,
})

function ArchitecturesPage() {
  const selectedArch = useExplorerStore((s) => s.selectedArch)
  const arch = ARCHITECTURES.find((a: Architecture) => a.id === selectedArch) ?? null

  if (!arch) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-3xl mb-3 opacity-20">{'\u2B21'}</div>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Selecciona una arquitectura en el panel izquierdo
          </p>
        </div>
      </div>
    )
  }

  const isLight = getTheme() === 'light'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={arch.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full overflow-hidden"
      >
        {/* Architecture header */}
        <div
          className="px-5 py-3"
          style={{ borderBottom: `1px solid ${isLight ? 'var(--border)' : '#27272a'}` }}
        >
          <h1
            className="text-lg font-bold"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              color: '#f4f4f5',
            }}
          >
            {arch.name}
          </h1>
          <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>
            {arch.desc}
          </p>
        </div>

        {/* React Flow diagram */}
        <div className="flex-1 min-h-0">
          <ReactFlowProvider>
            <FlowCanvas architectureId={arch.id} />
          </ReactFlowProvider>
        </div>

        {/* Cost breakdown */}
        <div style={{ borderTop: `1px solid ${isLight ? 'var(--border)' : '#27272a'}` }}>
          <CostBreakdown architectureId={arch.id} />
        </div>

        {/* Steps */}
        <div
          className="px-5 py-3 overflow-y-auto max-h-36"
          style={{
            borderTop: `1px solid ${isLight ? 'var(--border)' : '#27272a'}`,
            background: isLight ? 'var(--bg3)' : '#0a0a0b',
          }}
        >
          <h3
            className="mb-2"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            Pasos de implementacion
          </h3>
          <ol className="list-decimal list-inside text-xs space-y-1.5" style={{ color: '#a1a1aa' }}>
            {arch.steps.map((step: string, i: number) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
