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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
      {/* Question text: Chakra Petch 18px zinc-100 */}
      <h2
        className="font-bold"
        style={{
          fontFamily: '"Chakra Petch", sans-serif',
          color: '#f4f4f5',
          fontSize: '18px',
        }}
      >
        <span
          className="mr-2"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: 'var(--accent)',
          }}
        >
          {String(questionIdx + 1).padStart(2, '0')}.
        </span>
        {decision.question}
      </h2>

      {/* Options: bg #111318, border zinc-800, hover border zinc-600 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {decision.options.map((opt, i) => {
          const isSelected = selectedOption === i
          return (
            <button
              key={i}
              onClick={() => onSelect(questionIdx, i)}
              className="text-left p-4 rounded-lg transition-all duration-150 cursor-pointer"
              style={{
                background: isSelected ? '#1a1510' : '#111318',
                border: `1px solid ${isSelected ? '#27272a' : '#27272a'}`,
                borderLeft: isSelected
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#52525b'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#27272a'
                }
              }}
            >
              <span className="block text-sm font-medium" style={{ color: '#f4f4f5' }}>
                {opt.label}
              </span>
              <span className="block text-xs mt-1 leading-relaxed" style={{ color: '#71717a' }}>
                {opt.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation: 13px zinc-300 */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pl-3"
            style={{
              borderLeft: '2px solid var(--accent)',
            }}
          >
            <p style={{ color: '#d4d4d8', fontSize: '13px', lineHeight: 1.6 }}>
              {decision.options[selectedOption].explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {answered && !isLast && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onNext}
            className="self-end px-4 py-2 rounded text-sm font-semibold transition-colors duration-150 cursor-pointer"
            style={{
              fontFamily: '"Chakra Petch", sans-serif',
              background: 'var(--accent)',
              color: 'black',
              border: 'none',
            }}
          >
            Siguiente pregunta &rarr;
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
