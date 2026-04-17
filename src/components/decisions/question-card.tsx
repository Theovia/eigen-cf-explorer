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
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-[var(--text)]">
        <span className="font-mono text-[var(--accent)] mr-2">
          {questionIdx + 1}.
        </span>
        {decision.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {decision.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(questionIdx, i)}
            className={`
              text-left p-3 rounded-lg border transition-all duration-150
              cursor-pointer hover:bg-[var(--bg3)]
              ${
                selectedOption === i
                  ? 'border-[var(--accent)] bg-[var(--bg3)]'
                  : 'border-[var(--border)] bg-[var(--bg2)]'
              }
            `}
          >
            <span className="block text-sm font-medium text-[var(--text)]">
              {opt.label}
            </span>
            <span className="block text-xs text-[var(--text3)] mt-1 leading-relaxed">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3 animate-in">
          <p className="text-sm text-[var(--text2)] leading-relaxed">
            {decision.options[selectedOption].explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {answered && !isLast && (
        <button
          onClick={onNext}
          className="
            self-end px-4 py-2 rounded-lg text-sm font-mono
            bg-[var(--accent)] text-white
            hover:brightness-110 transition-all cursor-pointer
          "
        >
          Siguiente pregunta &rarr;
        </button>
      )}
    </div>
  )
}
