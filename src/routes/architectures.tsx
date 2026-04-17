import { createFileRoute } from '@tanstack/react-router'
import { useExplorerStore } from '#/stores/explorer-store'
import { ARCHITECTURES } from '#/data/architectures'
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
        <p className="text-sm text-[var(--text3)]">
          Selecciona una arquitectura en el panel izquierdo
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Architecture header */}
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-semibold text-[var(--text)]">
          {arch.name}
        </h1>
        <p className="text-sm text-[var(--text2)] mt-1">{arch.desc}</p>
        <p className="text-xs font-mono text-[var(--text3)] mt-2">
          {arch.flow}
        </p>
      </div>

      {/* Flow canvas placeholder — will be replaced by flow-agent */}
      <div className="flex-1 flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <p className="text-sm text-[var(--text3)]">
            Architecture diagram loading...
          </p>
          <p className="text-xs text-[var(--text3)] mt-2 font-mono">
            {arch.services.join(' -> ')}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 py-4 border-t border-[var(--border)] overflow-y-auto max-h-40">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text3)] mb-2">
          Pasos
        </h3>
        <ol className="list-decimal list-inside text-sm text-[var(--text2)] space-y-1">
          {arch.steps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
