import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { decisions } from '#/data/decisions'
import { QuestionCard } from '#/components/decisions/question-card'
import { Synthesis } from '#/components/decisions/synthesis'

export const Route = createFileRoute('/decisions')({ component: DecisionsPage })

function DecisionsPage() {
  const answers = useExplorerStore((s) => s.answers)
  const answerDecision = useExplorerStore((s) => s.answerDecision)
  const resetDecisions = useExplorerStore((s) => s.resetDecisions)

  const [visibleCount, setVisibleCount] = useState(1)

  const handleSelect = useCallback(
    (questionIdx: number, optionIdx: number) => {
      answerDecision(questionIdx, optionIdx)
    },
    [answerDecision],
  )

  const handleNext = useCallback(() => {
    setVisibleCount((c) => Math.min(c + 1, decisions.length))
  }, [])

  const allAnswered = Object.keys(answers).length >= decisions.length

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text)]">
          Asistente de decisiones
        </h1>
        {Object.keys(answers).length > 0 && (
          <button
            onClick={() => {
              resetDecisions()
              setVisibleCount(1)
            }}
            className="
              px-3 py-1.5 rounded text-xs font-mono
              border border-[var(--border)] text-[var(--text3)]
              hover:bg-[var(--bg3)] hover:text-[var(--text)]
              transition-colors cursor-pointer
            "
          >
            Reiniciar
          </button>
        )}
      </div>

      <p className="text-sm text-[var(--text2)]">
        Responde las preguntas para obtener una recomendación personalizada de
        servicios y arquitectura de Cloudflare.
      </p>

      {/* Questions */}
      <div className="flex flex-col gap-8">
        {decisions.slice(0, visibleCount).map((decision, idx) => (
          <QuestionCard
            key={idx}
            decision={decision}
            questionIdx={idx}
            selectedOption={answers[idx]}
            onSelect={handleSelect}
            onNext={handleNext}
            isLast={idx === decisions.length - 1}
          />
        ))}
      </div>

      {/* Synthesis */}
      {allAnswered && <Synthesis />}
    </div>
  )
}
