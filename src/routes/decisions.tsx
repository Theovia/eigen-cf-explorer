import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
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
        <h1
          className="text-xl font-bold"
          style={{
            fontFamily: '"Chakra Petch", sans-serif',
            color: 'var(--text)',
          }}
        >
          Asistente de decisiones
        </h1>
        {answeredCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              resetDecision()
              setVisibleCount(1)
            }}
            className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              fontWeight: 500,
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text3)',
            }}
          >
            Reiniciar
          </motion.button>
        )}
      </div>

      <p className="text-sm" style={{ color: 'var(--text2)' }}>
        Responde las preguntas para obtener una recomendacion personalizada de
        servicios y arquitectura de Cloudflare.
      </p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {DECISIONS.map((_: Decision, idx: number) => (
          <div
            key={idx}
            className="h-1 rounded-full flex-1 transition-all duration-300"
            style={{
              background: decisionAnswers[idx] !== undefined
                ? 'var(--accent)'
                : 'var(--glass-border)',
              boxShadow: decisionAnswers[idx] !== undefined
                ? '0 0 8px rgba(249, 115, 22, 0.3)'
                : 'none',
            }}
          />
        ))}
      </div>

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
