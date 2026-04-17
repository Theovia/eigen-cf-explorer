import { useExplorerStore } from '#/stores/explorer-store'
import { SERVICES } from '#/data/services'
import { AnimatePresence, motion } from 'framer-motion'
import type { Service, ServiceLimit, VsComparison } from '#/data/types'

const CAT_ICONS: Record<string, string> = {
  compute: '\u26A1',
  storage: '\uD83D\uDCBE',
  ai: '\uD83E\uDDE0',
  security: '\uD83D\uDEE1\uFE0F',
  integration: '\uD83D\uDD17',
}

const catGlowColors: Record<string, string> = {
  compute: 'rgba(59,130,246,0.15)',
  storage: 'rgba(34,197,94,0.15)',
  ai: 'rgba(168,85,247,0.15)',
  security: 'rgba(239,68,68,0.15)',
  integration: 'rgba(6,182,212,0.15)',
}

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
            <div className="text-2xl mb-3 opacity-30">
              {'\u2B21'}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text3)' }}>
              Haz click en un servicio para ver detalles
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col gap-4 p-4 overflow-y-auto h-full"
        >
          {/* Header */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: catTextColors[service.cat] ?? 'var(--text3)',
                background: catGlowColors[service.cat] ?? 'rgba(113,113,122,0.1)',
                border: `1px solid ${catTextColors[service.cat] ?? 'var(--text3)'}30`,
                boxShadow: `0 0 12px ${catGlowColors[service.cat] ?? 'transparent'}`,
              }}
            >
              <span>{CAT_ICONS[service.cat] ?? ''}</span>
              {service.cat}
            </span>
            <h2
              className="text-xl font-bold mt-3"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                color: 'var(--text)',
              }}
            >
              {service.name}
            </h2>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text2)' }}>
              {service.desc}
            </p>
          </div>

          {/* Limits table */}
          {service.limits.length > 0 && (
            <div>
              <h4
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
                    background: 'var(--cyan)',
                    boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                  }}
                />
                Limites
              </h4>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <table className="w-full text-xs">
                  <tbody>
                    {service.limits.map((limit: ServiceLimit, i: number) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: i < service.limits.length - 1
                            ? '1px solid var(--glass-border)'
                            : 'none',
                          background: i % 2 === 0 ? 'transparent' : 'var(--glass-bg)',
                        }}
                      >
                        <td className="py-2 px-3" style={{ color: 'var(--text2)' }}>
                          {limit.label}
                        </td>
                        <td
                          className="py-2 px-3 text-right"
                          style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            color: 'var(--text)',
                          }}
                        >
                          {limit.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h4
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
                  background: 'var(--cyan)',
                  boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                }}
              />
              Pricing
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                color: 'var(--accent)',
                textShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
              }}
            >
              {service.pricing}
            </p>
          </div>

          {/* When to use */}
          <div
            className="rounded-lg p-3"
            style={{
              background: 'rgba(34, 197, 94, 0.04)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
              borderLeft: '3px solid var(--green)',
            }}
          >
            <h4
              className="text-[10px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                color: 'var(--green)',
                fontWeight: 600,
              }}
            >
              {'\u2713'} Cuando usar
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {service.use}
            </p>
          </div>

          {/* When NOT to use */}
          <div
            className="rounded-lg p-3"
            style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderLeft: '3px solid var(--red)',
            }}
          >
            <h4
              className="text-[10px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                color: 'var(--red)',
                fontWeight: 600,
              }}
            >
              {'\u2717'} Cuando NO usar
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {service.notUse}
            </p>
          </div>

          {/* Gotcha */}
          <div
            className="rounded-lg p-3"
            style={{
              background: 'rgba(234, 179, 8, 0.04)',
              border: '1px solid rgba(234, 179, 8, 0.15)',
              borderLeft: '3px solid var(--yellow)',
            }}
          >
            <h4
              className="text-[10px] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"
              style={{
                fontFamily: '"Chakra Petch", sans-serif',
                color: 'var(--yellow)',
                fontWeight: 600,
              }}
            >
              {'\u26A0'} Gotcha
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {service.gotcha}
            </p>
          </div>

          {/* Vs comparisons */}
          {service.vs.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4
                className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                style={{
                  fontFamily: '"Chakra Petch", sans-serif',
                  color: 'var(--text3)',
                  fontWeight: 600,
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--cyan)',
                    boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                  }}
                />
                Comparaciones
              </h4>
              {service.vs.map((vs: VsComparison, i: number) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(6, 182, 212, 0.04)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    borderLeft: '3px solid var(--cyan)',
                  }}
                >
                  <h5
                    className="text-xs mb-1"
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      color: 'var(--cyan)',
                    }}
                  >
                    {vs.title}
                  </h5>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                    {vs.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Doc link */}
          <a
            href={service.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline mt-auto pb-2 transition-colors"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'var(--accent)',
            }}
          >
            Documentacion &rarr;
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
