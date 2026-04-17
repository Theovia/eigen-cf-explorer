import { createFileRoute } from '@tanstack/react-router'
import { ReactFlowProvider } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplorerStore } from '#/stores/explorer-store'
import { ARCHITECTURES } from '#/data/architectures'
import { FlowCanvas } from '#/components/architecture/flow-canvas'
import { CostBreakdown } from '#/components/architecture/cost-breakdown'
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
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <h1
            className="text-lg font-bold"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              color: 'var(--text)',
            }}
          >
            {arch.name}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
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
        <div style={{ borderTop: '1px solid var(--glass-border)' }}>
          <CostBreakdown architectureId={arch.id} />
        </div>

        {/* Steps */}
        <div
          className="px-5 py-3 overflow-y-auto max-h-36"
          style={{
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
          }}
        >
          <h3
            className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              color: 'var(--text3)',
              fontWeight: 600,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 6px rgba(249, 115, 22, 0.5)',
              }}
            />
            Pasos de implementacion
          </h3>
          <ol className="list-decimal list-inside text-xs space-y-1.5" style={{ color: 'var(--text2)' }}>
            {arch.steps.map((step: string, i: number) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
