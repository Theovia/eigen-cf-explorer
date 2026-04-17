import { AnimatePresence, motion } from 'framer-motion'
import type { Decision } from '#/data/types'

interface QuestionCardProps {
  decision: Decision
  questionIdx: number
  selectedOption: number | undefined
  onSelect: (questionIdx: number, optionIdx: number) => void
  onNext: () => void
  isLast: boolean
}

export function QuestionCard({
  decision,
  questionIdx,
  selectedOption,
  onSelect,
  onNext,
  isLast,
}: QuestionCardProps) {
  const answered = selectedOption !== undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
      <h2
        className="text-lg font-bold"
        style={{
          fontFamily: '"Chakra Petch", sans-serif',
          color: 'var(--text)',
        }}
      >
        <span
          className="mr-2"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: 'var(--accent)',
            textShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
          }}
        >
          {String(questionIdx + 1).padStart(2, '0')}.
        </span>
        {decision.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {decision.options.map((opt, i) => {
          const isSelected = selectedOption === i
          return (
            <button
              key={i}
              onClick={() => onSelect(questionIdx, i)}
              className="text-left p-4 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: isSelected
                  ? 'rgba(249, 115, 22, 0.06)'
                  : 'var(--glass-bg)',
                border: isSelected
                  ? '1px solid rgba(249, 115, 22, 0.25)'
                  : '1px solid var(--glass-border)',
                boxShadow: isSelected
                  ? '0 0 20px rgba(249, 115, 22, 0.1)'
                  : 'none',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--glass-hover)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--glass-bg)'
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                }
              }}
            >
              <span className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                {opt.label}
              </span>
              <span className="block text-xs mt-1 leading-relaxed" style={{ color: 'var(--text3)' }}>
                {opt.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(249, 115, 22, 0.04)',
              border: '1px solid rgba(249, 115, 22, 0.15)',
              borderLeft: '3px solid var(--accent)',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {decision.options[selectedOption].explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {answered && !isLast && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onNext}
            className="self-end px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              background: 'var(--accent)',
              color: 'white',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.2)',
            }}
          >
            Siguiente pregunta &rarr;
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
