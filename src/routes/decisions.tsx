import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useExplorerStore } from '#/stores/explorer-store'
import { DECISIONS } from '#/data/decisions'
import { QuestionCard } from '#/components/decisions/question-card'
import { Synthesis } from '#/components/decisions/synthesis'
import type { Decision } from '#/data/types'

export const Route = createFileRoute('/decisions')({ component: DecisionsPage })

function DecisionsPage() {
  const decisionAnswers = useExplorerStore((s) => s.decisionAnswers)
  const answerDecision = useExplorerStore((s) => s.answerDecision)
  const resetDecision = useExplorerStore((s) => s.resetDecision)

  const [visibleCount, setVisibleCount] = useState(1)

  const handleSelect = useCallback(
    (_questionIdx: number, optionIdx: number) => {
      answerDecision(optionIdx)
    },
    [answerDecision],
  )

  const handleNext = useCallback(() => {
    setVisibleCount((c) => Math.min(c + 1, DECISIONS.length))
  }, [])

  // Count how many questions have been answered
  const answeredCount = decisionAnswers.filter((a: number | undefined) => a !== undefined).length
  const allAnswered = answeredCount >= DECISIONS.length

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text)]">
          Asistente de decisiones
        </h1>
        {answeredCount > 0 && (
          <button
            onClick={() => {
              resetDecision()
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
        Responde las preguntas para obtener una recomendacion personalizada de
        servicios y arquitectura de Cloudflare.
      </p>

      {/* Questions */}
      <div className="flex flex-col gap-8">
        {DECISIONS.slice(0, visibleCount).map((decision: Decision, idx: number) => (
          <QuestionCard
            key={idx}
            decision={decision}
            questionIdx={idx}
            selectedOption={decisionAnswers[idx]}
            onSelect={handleSelect}
            onNext={handleNext}
            isLast={idx === DECISIONS.length - 1}
          />
        ))}
      </div>

      {/* Synthesis */}
      {allAnswered && <Synthesis />}
    </div>
  )
}
