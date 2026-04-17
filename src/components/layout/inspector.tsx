import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { getTheme } from '#/lib/theme'
import { AnimatePresence, motion } from 'framer-motion'
import type { Service, ServiceLimit, VsComparison } from '#/data/types'

const catTextColors: Record<string, string> = {
  compute: 'var(--blue)',
  storage: 'var(--green)',
  ai: 'var(--purple)',
  security: 'var(--red)',
  integration: 'var(--cyan)',
}

export function Inspector() {
  const selectedService = useExplorerStore((s) => s.selectedService)

  const service: Service | null = selectedService
    ? SERVICES[selectedService] ?? null
    : null

  return (
    <AnimatePresence mode="wait">
      {!service ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center h-full p-6"
        >
          <div className="text-center">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text3)' }}>
              Selecciona un servicio
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col gap-5 p-5 overflow-y-auto h-full"
        >
          {/* Header */}
          <div>
            {/* Category — mono 10px uppercase, category color */}
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: catTextColors[service.cat] ?? 'var(--text3)',
              }}
            >
              {service.cat}
            </span>
            {/* Service name — 18px Chakra Petch, zinc-100 */}
            <h2
              className="text-lg font-bold mt-1"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                color: '#f4f4f5',
                fontSize: '18px',
              }}
            >
              {service.name}
            </h2>
            {/* Description — 13px, zinc-300 */}
            <p
              className="mt-2 leading-relaxed"
              style={{
                color: '#d4d4d8',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              {service.desc}
            </p>
          </div>

          {/* Limits table */}
          {service.limits.length > 0 && (
            <div>
              <h4
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#71717a',
                  fontWeight: 500,
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#27272a'}`,
                }}
              >
                Limites
              </h4>
              <table className="w-full">
                <tbody>
                  {service.limits.map((limit: ServiceLimit, i: number) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < service.limits.length - 1
                          ? `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#18181b'}`
                          : 'none',
                      }}
                    >
                      <td
                        className="py-1.5 pr-3"
                        style={{
                          color: '#a1a1aa',
                          fontSize: '12px',
                        }}
                      >
                        {limit.label}
                      </td>
                      <td
                        className="py-1.5 text-right"
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontVariantNumeric: 'tabular-nums',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      >
                        {limit.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h4
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#71717a',
                fontWeight: 500,
                marginBottom: '6px',
                paddingBottom: '6px',
                borderBottom: `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#27272a'}`,
              }}
            >
              Pricing
            </h4>
            <p
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '14px',
                color: '#fb923c',
              }}
            >
              {service.pricing}
            </p>
          </div>

          {/* When to use — text with tiny prefix */}
          <div>
            <h4
              className="text-xs font-medium mb-1.5 flex items-center gap-1.5"
              style={{ color: 'var(--green)' }}
            >
              <span style={{ fontSize: '11px' }}>{'\u2713'}</span> Cuando usar
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#d4d4d8', fontSize: '13px' }}>
              {service.use}
            </p>
          </div>

          {/* When NOT to use — text with tiny prefix */}
          <div>
            <h4
              className="text-xs font-medium mb-1.5 flex items-center gap-1.5"
              style={{ color: 'var(--red)' }}
            >
              <span style={{ fontSize: '11px' }}>{'\u2717'}</span> Cuando NO usar
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#d4d4d8', fontSize: '13px' }}>
              {service.notUse}
            </p>
          </div>

          {/* Gotcha */}
          <div className="flex items-start gap-2">
            <span style={{ color: 'var(--yellow)', fontSize: '13px', lineHeight: '1.5' }}>{'\u26A0'}</span>
            <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa', fontSize: '13px' }}>
              {service.gotcha}
            </p>
          </div>

          {/* Vs comparisons — header in cyan mono, thin top border */}
          {service.vs.length > 0 && (
            <div>
              <h4
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#71717a',
                  fontWeight: 500,
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#27272a'}`,
                }}
              >
                Comparaciones
              </h4>
              <div className="flex flex-col gap-3">
                {service.vs.map((vs: VsComparison, i: number) => (
                  <div key={i}>
                    <h5
                      className="mb-1 font-medium"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '11px',
                        color: 'var(--cyan)',
                      }}
                    >
                      {vs.title}
                    </h5>
                    <p style={{ color: '#d4d4d8', fontSize: '13px', lineHeight: 1.6 }}>
                      {vs.body}
                    </p>
                    {i < service.vs.length - 1 && (
                      <div
                        className="mt-3"
                        style={{ borderBottom: `1px solid ${getTheme() === 'light' ? 'var(--border)' : '#18181b'}` }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doc link — mono 11px, blue-400 */}
          <a
            href={service.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pb-2 transition-colors hover:opacity-80"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: '#60a5fa',
              textDecoration: 'none',
            }}
          >
            Documentacion &rarr;
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
