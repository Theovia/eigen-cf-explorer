import { useState, useMemo, useCallback } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { services } from '#/data/services'
import { architectures } from '#/data/architectures'
import { buildPrompt } from '#/lib/prompt-builder'

export function PromptBar() {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedArchId = useExplorerStore((s) => s.selectedArchId)
  const traffic = useExplorerStore((s) => s.traffic)

  const arch = useMemo(
    () => architectures.find((a) => a.id === selectedArchId) ?? null,
    [selectedArchId],
  )

  const prompt = useMemo(
    () =>
      buildPrompt({
        arch,
        services,
        traffic,
        selectedServices: arch?.services,
      }),
    [arch, traffic],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [prompt])

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg2)]">
      {/* Expanded view */}
      {expanded && (
        <div className="max-h-60 overflow-y-auto p-4 border-b border-[var(--border)]">
          <pre className="text-xs font-mono text-[var(--text2)] whitespace-pre-wrap leading-relaxed">
            {prompt}
          </pre>
        </div>
      )}

      {/* Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-[var(--text3)] truncate">
            {prompt.split('\n')[0]}
          </p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="
            shrink-0 px-3 py-1.5 rounded text-xs font-mono
            border border-[var(--border)] text-[var(--text2)]
            hover:bg-[var(--bg3)] hover:text-[var(--text)]
            transition-colors cursor-pointer
          "
        >
          {expanded ? 'Cerrar' : 'Ver completo'}
        </button>

        <button
          onClick={() => void handleCopy()}
          className={`
            shrink-0 px-3 py-1.5 rounded text-xs font-mono
            transition-colors cursor-pointer
            ${
              copied
                ? 'bg-[var(--green)] text-white border border-[var(--green)]'
                : 'bg-[var(--accent)] text-white border border-[var(--accent)] hover:brightness-110'
            }
          `}
        >
          {copied ? 'Copiado!' : 'Copiar prompt'}
        </button>
      </div>
    </div>
  )
}
